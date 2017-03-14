// @flow

import fs from 'mz/fs';
import path from 'path';
import mime from 'mime';
import Request from '../Request';
import Response from '../Response';

export default function (req: Request, res: Response) {
  const parsedPath = path.parse(req.uri);

  const ext = parsedPath.ext || '.html';
  const name = parsedPath.name || 'index';
  const dir = parsedPath.dir;

  const requestedFile = path.normalize(`${dir}/${name}${ext}`);

  const file = path.resolve(`./src/public/${requestedFile}`);

  fs.exists(file).then((exists: boolean) => {
    if (!exists) {
      res.statusCode = 404;
      res.end('Not Found');
    } else {
      fs.access(file, fs.constants.R_OK).then((err: Error) => {
        if (err) {
          res.statusCode = 401;
          res.end('Permission Denied');
        }
      });
      fs.stat(file)
        .then((stats): Promise<number> => Promise.resolve(stats.size))
        .then((size: number) => {
          res.setHeader('Content-Type', mime.lookup(requestedFile));
          res.setHeader('Content-Length', size);
          fs.createReadStream(file).pipe(res);
        })
        .catch(err => global.console.error(err));
    }
  });
}
