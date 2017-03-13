// @flow

import fs from 'mz/fs';
import path from 'path';
import HttpServer from './HttpServer';

const httpServer = new HttpServer();

httpServer.on('request', (req, res) => {
  req.on('data', (chunk: Buffer) => {
    global.console.log('chunk');
    global.console.log(chunk.toString());
  });

  res.setHeader('Content-Type', 'text/html');

  const file = path.resolve(__dirname, './public/index.html');
  fs.stat(file)
    .then((stats): Promise<number> => Promise.resolve(stats.size))
    .then((size: number) => {
      res.setHeader('Content-Length', size);
      fs.createReadStream(file).pipe(res);
    })
    .catch(err => global.console.error(err));
});

httpServer.run({ port: 8081 }).then(() => {
  global.console.log('HTTP Server is working on 127.0.0.1:8081');
});
