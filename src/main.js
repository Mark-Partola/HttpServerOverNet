// @flow

import HttpServer from './HttpServer';
import staticMiddleware from './middlewares/staticMiddleware';

const httpServer = new HttpServer();

httpServer.on('request', (req, res) => {
  req.on('data', (chunk: Buffer) => {
    global.console.log('chunk');
    global.console.log(chunk.toString());
  });

  staticMiddleware(req, res);
});

httpServer.run({ port: 8081 }).then(() => {
  global.console.log('HTTP Server is working on 127.0.0.1:8081');
});
