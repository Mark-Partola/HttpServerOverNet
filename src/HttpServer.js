// @flow

import { Socket } from 'net';
import EventEmitter from 'events';
import TcpServer from './TcpServer';
import type { ServerParams } from './TcpServer';
import Connection from './Connection';

export default class HttpServer extends EventEmitter {

  constructor() {
    super();

    this.tcpServer = new TcpServer();

    this.tcpServer.on('connection', (client: Socket) => {
      const connection = new Connection(client);
      connection.on('request', (...args) =>
        this.emit('request', ...args));
    });
  }

  run(params: ServerParams) {
    return this.tcpServer.run(params);
  }
}
