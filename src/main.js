// @flow

import { Server } from 'net';

import deferred from './utils/deferred';

class TcpServer extends Server {

  constructor() {
    super();

    this.addListeners();
  }

  addListeners() {
    this.on('connection', (client) => {
      client.on('data', (data) => {
        global.console.log(data.toString());
        client.write('HTTP/1.1 200 OK');
      });
    });

    this.on('listening', () => {
      global.console.log('Listening on 127.0.0.1:8080');
    });

    this.on('close', () => {
      global.console.log('Server stopped.');
    });

    this.on('error', (error) => {
      global.console.log('An error occurred.');
      global.console.log(error);
    });
  }

  listen(port) {
    const promise = deferred();
    super.listen(port, () => promise.resolve());
    return promise.promise;
  }
}

class HttpServer extends TcpServer {

  listen(port) {
    return super.listen(port);
  }
}

const httpServer = new HttpServer();
httpServer.listen(8080);
