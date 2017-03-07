// @flow

import TcpServer from './TcpServer';
import Connection from './Connection';

export default class HttpServer extends TcpServer {

  constructor() {
    super();

    this.on('connection', (client) => {
      new Connection(client);
    });
  }

  listen(port) {
    return super.listen(port);
  }
}
