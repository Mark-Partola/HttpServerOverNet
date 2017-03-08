// @flow

import { Socket } from 'net';
import Request from './Request';
import IncomingMessageParser from './IncomingMessageParser';

import type { Headers } from './Request';

export default class Connection {

  request: Request;
  messageParser: IncomingMessageParser;

  constructor(client: Socket) {
    this.request = new Request();
    this.messageParser = new IncomingMessageParser();

    this.messageParser.on('headers', (headers: Headers) => {
      this.request.setStartHeader(headers.start);
      this.request.setHeaders(headers.common);
    });

    this.messageParser.on('body', (body: string) => this.request.setBody(body));

    client.on('data', (data: Buffer) => this.messageParser.process(data));

    client.on('close', (withError: boolean) => {
      global.console.log(`Connection is closed${withError ? ' with error' : ''}.`);
    });

    client.on('error', error => global.console.log(error));
  }
}
