// @flow

import { Socket } from 'net';

type MainHeader = {
  method: string,
  uri: string,
  version: string
};

type Headers = {
  start: MainHeader,
  common: Map<string, string>
};

class Request {

  method: string;
  uri: string;
  version: string;
  headers: Map<string, string>;

  setStartHeader(startHeader: MainHeader): void {
    this.method = startHeader.method;
    this.uri = startHeader.uri;
    this.version = startHeader.version;
  }

  setHeaders(headers: Map<string, string>): void {
    this.headers = headers;
  }
}

export default class Connection {

  buffer: Buffer;
  request: Request;

  constructor(client: Socket) {
    this.buffer = Buffer.from([]);
    this.request = new Request();

    client.on('data', (data: Buffer) => {
      this.buffer = Buffer.concat([this.buffer, data]);

      const headersEndPosition: number = this.detectRequestHeaders(data);

      if (headersEndPosition !== -1) {
        const rawHeaders = this.buffer.slice(0, headersEndPosition);
        const headers: Headers = this.parseRequestHeaders(rawHeaders);

        this.request.setStartHeader(headers.start);
        this.request.setHeaders(headers.common);

        global.console.log(this.request.headers.get('Content-Length'));
      }
    });

    client.on('end', () => global.console.log(this.buffer.toString()));

    client.on('close', (data) => {
      global.console.log('close');
      global.console.log(data);
    });

    client.on('error', (data) => {
      global.console.log('error');
      global.console.log(data);
    });
  }

  detectRequestHeaders(data: Buffer): number {
    const headersDelimiter = Buffer.from('\r\n\r\n');
    return data.indexOf(headersDelimiter);
  }

  parseRequestHeaders(rawHeaders: Buffer): Headers {
    const headerRows: Array<string> = rawHeaders.toString().split('\r\n');

    const startString = headerRows.shift();
    const parsedStartString = startString.split(' ');

    const headersMap = headerRows.reduce((acc, row) => {
      const parts = row.split(': ');
      return Object.assign({}, acc, { [parts[0]]: parts[1] });
    }, {});

    const headerEntries = Object.entries(headersMap)
      .map(entry => [String(entry[0]), String(entry[1])]);

    const headers: Map<string, string> = new Map(headerEntries);

    return {
      start: {
        method: parsedStartString.shift(),
        uri: parsedStartString.shift(),
        version: parsedStartString.shift(),
      },
      common: headers,
    };
  }
}
