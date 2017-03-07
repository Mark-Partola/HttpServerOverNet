// @flow

import { Server } from 'net';

import deferred from './utils/deferred';

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

  listen(port) {
    const promise = deferred();
    super.listen(port, () => promise.resolve());
    return promise.promise;
  }
}
