// @flow

import { Socket } from 'net';
import EventEmitter from 'events';

import Request from './Request';
import IncomingMessageParser from './IncomingMessageParser';

import type { Headers } from './Request';

export default class Connection extends EventEmitter {

  request: Request;
  messageParser: IncomingMessageParser;

  constructor(client: Socket) {
    super();

    this.request = new Request();
    this.messageParser = new IncomingMessageParser();

    this.messageParser.on('headers', (headers: Headers) => {
      this.request.setStartHeader(headers.start);
      this.request.setHeaders(headers.common);
      this.request.listen(client);

      this.emit('request', this.request);

      /**
       * TODO: Научиться возвращать отрезанный кусок от тела запроса.
       */
      this.request.unshift(Buffer.from('Hello, world!!!'));
    });

    client.on('data', (data: Buffer) => this.messageParser.process(data));

    client.on('close', (withError: boolean) => {
      global.console.log(`Connection is closed${withError ? ' with error' : ''}.`);
    });

    client.on('error', error => global.console.log(error));
  }
}
