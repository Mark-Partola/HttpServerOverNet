// @flow

import fs from 'mz/fs';
import path from 'path';
import mime from 'mime';
import Request from '../Request';
import Response from '../Response';
import deferred from '../utils/deferred';

export default class StaticMiddleware {

  constructor(req: Request, res: Response) {
    this.process(req, res);
  }

  process(req, res) {
    const file = this.getNormalizedFileName(req.uri || '');

    this.checkExists({ req, res, file })
      .then(this.canAccess.bind(this))
      .then(this.sendFile.bind(this))
      .catch(this.handleError.bind(this));
  }

  getNormalizedFileName(uri) {
    const parsedPath = path.parse(uri);

    const ext = parsedPath.ext || '.html';
    const name = parsedPath.name || 'index';
    const dir = parsedPath.dir;

    const requestedFile = path.normalize(`${dir}/${name}${ext}`);

    return path.resolve(`./src/public/${requestedFile}`);
  }

  checkExists(context) {
    const defer = deferred();

    fs.exists(context.file).then((exists: boolean) => {
      if (!exists) {
        defer.reject(Object.assign({}, context, { errNo: 404 }));
      } else {
        defer.resolve(context);
      }
    });

    return defer.promise;
  }

  canAccess(context) {
    const defer = deferred();

    fs.access(context.file, fs.constants.R_OK).then((err: Error) => (err
        ? defer.reject(Object.assign(context, { errNo: 401 }))
        : defer.resolve(context)
    ));

    return defer.promise;
  }

  sendFile(context) {
    const defer = deferred();

    fs.stat(context.file)
      .then((stats): Promise<number> => Promise.resolve(stats.size))
      .then((size: number) => {
        context.res.setHeader('Content-Type', mime.lookup(context.file));
        context.res.setHeader('Content-Length', size);
        fs.createReadStream(context.file).pipe(context.res, { end: false });
      })
      .catch(err =>
        defer.reject(Object.assign(context, { errNo: 500, description: err })));

    return defer.promise;
  }

  handleError(context) {
    const messages = {
      404: 'Not Found',
      401: 'Permission Denied',
      500: 'Internal Server Error',
      0: 'Something Went Wrong',
    };

    const statusMessage = messages[context.errNo || 0];

    const body = (process.env.NODE_ENV === 'development' && context.description)
      ? context.description
      : statusMessage;

    context.res.statusCode = context.errNo;
    context.res.setHeader('Content-Type', 'text/plain');
    context.res.setHeader('Content-Length', Buffer.from(body).length);
    context.res.end(body);
  }
}
