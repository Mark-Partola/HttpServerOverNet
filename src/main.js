// @flow

import HttpServer from './HttpServer';

const httpServer = new HttpServer();

httpServer.on('request', (req, res) => {
  global.console.log(req.headers);

  req.on('data', (chunk: Buffer) => {
    global.console.log('chunk');
    global.console.log(chunk.toString());
  });

  res.setHeader('Content-Type', 'text/plain');
  // res.setHeader('Transfer-Encoding', 'chunked');

  res.write('Hello...');
  res.write(' World\r\n');
  res.write('New line!');

  res.end();
});

httpServer.run({ port: 8081 }).then(() => {
  global.console.log('HTTP Server is working on 127.0.0.1:8081');
});
