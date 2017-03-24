// @flow

import Stream from 'stream';
import { Socket } from 'net';
import IncomingMessageParser from './IncomingMessageParser';

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

  messageParser: IncomingMessageParser;

  source: Socket;

  constructor() {
    super();

    this.messageParser = new IncomingMessageParser();
  }

  setStartHeader(startHeader: MainHeader): void {
    this.method = startHeader.method;
    this.uri = startHeader.uri;
    this.version = startHeader.version;
  }

  setHeaders(headers: Map<string, string>): void {
    this.headers = headers;
  }

  bindSocket(source: Socket) {
    this.source = source;

    this.messageParser.on('headers', (headers: Headers) => {
      this.setStartHeader(headers.start);
      this.setHeaders(headers.common);

      this.emit('headers');
    });

    this.source.on('data', (data: Buffer) =>
      this.messageParser.process(data));
  }

  _read() {
    this.source.on('data', chunk => this.push(chunk));
    this.source.on('end', () => this.push(null));
  }
}
