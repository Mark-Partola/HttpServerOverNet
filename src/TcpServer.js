// @flow

import { Server } from 'net';

import deferred from './utils/deferred';

export type ServerParams = {
  host?: string,
  port: number
};

export default class TcpServer extends Server {

  constructor() {
    super();

    this.addListeners();
  }

  addListeners() {
    this.on('close', () => {
      global.console.log('Server stopped.');
    });

    this.on('error', (error) => {
      global.console.log('An error occurred.');
      global.console.log(error);
    });
  }

  run(params: ServerParams) {
    const promise = deferred();

    super.listen({
      host: params.host || '127.0.0.1',
      port: params.port,
    }, () => promise.resolve());

    return promise.promise;
  }
}
