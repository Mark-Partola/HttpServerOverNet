// @flow

import TcpServer from './TcpServer';
import type { ServerParams } from './TcpServer';
import Connection from './Connection';

export default class HttpServer extends TcpServer {

  constructor() {
    super();

    this.on('connection', (client) => {
      new Connection(client);
    });
  }

  run(params: ServerParams) {
    return super.run(params);
  }
}
