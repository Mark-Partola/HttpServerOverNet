// @flow

import HttpServer from './HttpServer';

const httpServer = new HttpServer();

httpServer.on('request', (req) => {
  global.console.log(req.headers);

  req.on('data', (chunk) => {
    global.console.log('chunk');
    global.console.log(chunk.toString());
  });
});

httpServer.run({ port: 8081 }).then(() => {
  global.console.log('HTTP Server is working on 127.0.0.1:8081');
});
