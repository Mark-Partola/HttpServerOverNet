// @flow

import fs from 'mz/fs';
import path from 'path';
import mime from 'mime';
import Request from '../Request';
import Response from '../Response';

export default function (req: Request, res: Response) {
  const parsedPath = path.parse(req.uri);

  const normalizedPath: {
    root?: string;
    dir?: string;
    base?: string;
    ext?: string;
    name?: string;
  } = {
    ...parsedPath,
    base: (parsedPath.base === '')
      ? 'index.html'
      : parsedPath.base,
    ext: parsedPath.ext || '.html',
  };

  const requestedFile = path.normalize(path.format(normalizedPath));

  const file = path.resolve(`./src/public/${requestedFile}`);
  fs.stat(file)
    .then((stats): Promise<number> => Promise.resolve(stats.size))
    .then((size: number) => {
      res.setHeader('Content-Type', mime.lookup(requestedFile));
      res.setHeader('Content-Length', size);
      fs.createReadStream(file).pipe(res);
    })
    .catch(err => global.console.error(err));
}
