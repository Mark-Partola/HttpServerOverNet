// @flow

import Stream from 'stream';
import { Socket } from 'net';

export type MainHeader = {
  method: string,
  uri: string,
  version: string
};

export type Headers = {
  start: MainHeader,
  common: Map<string, string>
};

export default class Request extends Stream.Readable {

  method: string;
  uri: string;
  version: string;
  headers: Map<string, string>;

  source: Socket;

  setStartHeader(startHeader: MainHeader): void {
    this.method = startHeader.method;
    this.uri = startHeader.uri;
    this.version = startHeader.version;
  }

  setHeaders(headers: Map<string, string>): void {
    this.headers = headers;
  }

  connect(source: Socket) {
    this.source = source;
  }

  _read() {
    this.source.on('data', chunk => this.push(chunk));
    this.source.on('end', () => this.push(null));
  }
}
