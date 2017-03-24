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

  currentContentLengthSent: number;

  /**
   * TODO: научиться передавать опции. Ругается Flow, без понятия откуда взять тип.
   */
  constructor() {
    super();

    this.headers = new Map();
    this.isHeadersSent = false;
    this.currentContentLengthSent = 0;
    this.responseStatusCode = 200;
    this.statusDictionary = new Map([
      [200, 'OK'],
      [404, 'Not Found'],
    ]);
  }

  bindSocket(destination: Socket) {
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
    this.destination.end(lastChunk);
  }

  _write(chunk: Buffer | string, encoding: string, cb: Function): boolean {
    this.sendHeaderIfNeed();

    this.currentContentLengthSent += chunk.length;
    this.destination.write(chunk);

    const contentLength = this.headers.get('Content-Length');
    if (contentLength) {
      if (this.currentContentLengthSent >= contentLength) {
        cb();
        this.emit('served');
        return true;
      }
    }

    cb();

    return true;
  }

  sendHeaderIfNeed() {
    if (!this.isHeadersSent) {
      this.destination.write(this.getStartHeader());

      const headers = this.concatHeaders(this.headers);
      this.destination.write(headers);
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
