// @flow

import { Socket } from 'net';

type MainHeader = {
  method: string,
  uri: string,
  version: string
};

type CommonHeader = {
  [key: string]: string
}

type Headers = {
  start: MainHeader,
  common: Array<CommonHeader>
};

class Request {

  method: string;
  uri: string;
  version: string;
  headers: Array<CommonHeader>;

  setStartHeader(startHeader: MainHeader): void {
    this.method = startHeader.method;
    this.uri = startHeader.uri;
    this.version = startHeader.version;
  }

  setHeaders(headers: Array<CommonHeader>): void {
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

        global.console.log(this.request.method);
        global.console.log(this.request.uri);
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

    const headers: Array<CommonHeader> = headerRows.map((row) => {
      const parts = row.split(': ');
      return parts.reduce((acc, curr) =>
        Object.assign({}, acc, { [curr[0]]: curr[1] }), {});
    });

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
