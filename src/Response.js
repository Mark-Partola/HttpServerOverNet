// @flow

import Stream from 'stream';
import { Socket } from 'net';

class Response extends Stream.Writable {

  destination: Socket;
  headers: {[key: string]: string};

  /**
   * TODO: научиться передавать опции. Ругается Flow, без понятия откуда взять тип.
   */
  constructor() {
    super();

    this.headers = {};
  }

  connect(destination: Socket) {
    this.destination = destination;
  }

  setHeader(name: string, value: string): void {
    this.headers[name] = value;
  }

  _write(): boolean {
    return true;
  }
}


export default Response;
