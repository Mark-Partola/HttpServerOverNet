// @flow

import Stream from 'stream';
import { Socket } from 'net';

type ResponseHeaders = Map<string, string>;

class Response extends Stream.Writable {

  destination: Socket;
  headers: ResponseHeaders;
  isHeadersSent: boolean;

  /**
   * TODO: научиться передавать опции. Ругается Flow, без понятия откуда взять тип.
   */
  constructor() {
    super();

    this.headers = new Map();
    this.isHeadersSent = false;
  }

  connect(destination: Socket) {
    this.destination = destination;
  }

  setHeader(name: string, value: string | number): void {
    if (this.isHeadersSent) {
      throw new Error('Headers already sent.');
    }

    this.headers.set(name, String(value));
  }

  end(lastChunk?: Buffer | string | Function) {
    if (lastChunk) {
      this.destination.write(lastChunk);
    }

    this.destination.end();
  }

  _write(chunk: Buffer | string, encoding: string, cb: Function): boolean {
    if (!this.isHeadersSent) {
      this.destination.write('HTTP/1.1 200 OK\r\n');

      this.destination.write(this.concatHeaders(this.headers));
      this.destination.write('\r\n');
      this.isHeadersSent = true;
    }

    this.destination.write(chunk);

    cb();

    return true;
  }

  concatHeaders(responseHeaders: ResponseHeaders) {
    let headers = '';
    responseHeaders.forEach((value, key) => {
      headers += `${key}: ${value}\r\n`;
    });

    return headers;
  }
}

export default Response;
