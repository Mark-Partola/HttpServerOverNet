// @flow

import Stream from 'stream';
import { Socket } from 'net';

type ResponseHeaders = Map<string, string>;

class Response extends Stream.Writable {

  destination: Socket;
  headers: ResponseHeaders;
  isHeadersSent: boolean;
  responseStatusCode: number;
  statusDictionary: Map<number, string>;

  /**
   * TODO: научиться передавать опции. Ругается Flow, без понятия откуда взять тип.
   */
  constructor() {
    super();

    this.headers = new Map();
    this.isHeadersSent = false;
    this.responseStatusCode = 200;
    this.statusDictionary = new Map([
      [200, 'OK'],
      [404, 'Not Found'],
    ]);
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

  set statusCode(statusCode: number) {
    this.responseStatusCode = statusCode;
  }

  end(lastChunk?: Buffer | string | Function) {
    this.sendHeaderIfNeed();

    if (lastChunk) {
      this.destination.write(lastChunk);
    }

    this.destination.end();
  }

  _write(chunk: Buffer | string, encoding: string, cb: Function): boolean {
    this.sendHeaderIfNeed();

    this.destination.write(chunk);

    cb();

    return true;
  }

  sendHeaderIfNeed() {
    if (!this.isHeadersSent) {
      this.destination.write(this.getStartHeader());

      this.destination.write(this.concatHeaders(this.headers));
      this.destination.write('\r\n');
      this.isHeadersSent = true;
    }
  }

  getStartHeader() {
    const description: string = this.statusDictionary.get(this.responseStatusCode) || '';
    return `HTTP/1.1 ${this.responseStatusCode} ${description}\r\n`;
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
