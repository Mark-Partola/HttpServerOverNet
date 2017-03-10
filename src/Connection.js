// @flow

import { Socket } from 'net';
import EventEmitter from 'events';

import Request from './Request';
import Response from './Response';
import IncomingMessageParser from './IncomingMessageParser';

import type { Headers } from './Request';

export default class Connection extends EventEmitter {

  request: Request;
  response: Response;
  messageParser: IncomingMessageParser;

  constructor(client: Socket) {
    super();

    this.request = new Request();
    this.response = new Response();

    this.request.connect(client);
    this.response.connect(client);

    this.messageParser = new IncomingMessageParser();

    this.messageParser.on('headers', (headers: Headers) => {
      this.request.setStartHeader(headers.start);
      this.request.setHeaders(headers.common);

      this.emit('request', this.request, this.response);
    });

    client.on('data', (data: Buffer) =>
      this.messageParser.process(data));

    client.on('close', (withError: boolean) =>
      global.console.log(`Connection is closed${withError ? ' with error' : ''}.`));

    client.on('error', error =>
      global.console.log(error));
  }
}
