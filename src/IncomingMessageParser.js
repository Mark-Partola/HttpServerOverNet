// @flow

import EventEmitter from 'events';
import type { Headers, MainHeader } from './Request';

export default class IncomingMessageParser extends EventEmitter {

  bodyDelimiter: string;
  headerDelimiter: string;
  buffer: Buffer;
  isBody: boolean;
  contentLength: number;

  constructor() {
    super();

    this.buffer = Buffer.from([]);
    this.bodyDelimiter = '\r\n\r\n';
    this.headerDelimiter = '\r\n';
  }

  process(data: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, data]);

    const headersEndPosition: number = this.detectRequestHeaders(this.buffer);

    if (headersEndPosition !== -1) {
      const rawHeaders = this.buffer.slice(0, headersEndPosition);
      const headers: Headers = this.parseRequestHeaders(rawHeaders);

      this.emit('headers', headers);

      const bodyOffsetHeadersLength = Buffer.from(this.bodyDelimiter).length;
      const startBodyPosition = rawHeaders.length + bodyOffsetHeadersLength;

      this.contentLength = Number(headers.common.get('Content-Length'));

      this.buffer = this.buffer.slice(startBodyPosition);

      this.isBody = true;
    }

    if (this.isBody && (this.contentLength === this.buffer.length)) {
      this.emit('body', this.buffer.toString());
    }
  }

  detectRequestHeaders(data: Buffer): number {
    const headersDelimiter = Buffer.from(this.bodyDelimiter);
    return data.indexOf(headersDelimiter);
  }

  parseRequestHeaders(rawHeaders: Buffer): Headers {
    const headerRows: Array<string> = rawHeaders.toString().split(this.headerDelimiter);

    return {
      start: this.parseStartHeader(headerRows.shift()),
      common: this.parseCommonHeaders(headerRows),
    };
  }

  parseStartHeader(startHeader: string): MainHeader {
    const parsedStartHeader = startHeader.split(' ');

    return {
      method: parsedStartHeader.shift(),
      uri: parsedStartHeader.shift(),
      version: parsedStartHeader.shift(),
    };
  }

  parseCommonHeaders(headerRows: Array<string>): Map<string, string> {
    const headersMap = headerRows.reduce((acc, row) => {
      const parts = row.split(': ');
      return Object.assign({}, acc, { [parts[0]]: parts[1] });
    }, {});

    const headerEntries = Object.entries(headersMap)
      .map(entry => [String(entry[0]), String(entry[1])]);

    return new Map(headerEntries);
  }
}
