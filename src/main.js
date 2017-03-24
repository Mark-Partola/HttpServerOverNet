// @flow

import HttpServer from './HttpServer';
import StaticMiddleware from './middlewares/StaticMiddleware';

const httpServer = new HttpServer();

httpServer.on('request', (req, res) => {
  req.on('data', (chunk: Buffer) => {
    global.console.log('chunk');
    global.console.log(chunk.toString());
  });

  new StaticMiddleware(req, res);
});

httpServer.run({ port: 8082 }).then(() => {
  global.console.log('HTTP Server is working on 127.0.0.1:8082');
});
