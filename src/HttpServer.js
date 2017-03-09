// @flow

import { Socket } from 'net';
import TcpServer from './TcpServer';
import type { ServerParams } from './TcpServer';
import Connection from './Connection';

export default class HttpServer extends TcpServer {

  constructor() {
    super();

    this.on('connection', (client: Socket) => {
      const connection = new Connection(client);
      connection.on('request', (...args) => this.emit('request', ...args));
    });
  }

  run(params: ServerParams) {
    return super.run(params);
  }
}
