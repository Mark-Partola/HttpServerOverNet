// @flow

import { Socket } from 'net';
import EventEmitter from 'events';

import Request from './Request';
import Response from './Response';

export default class Connection extends EventEmitter {

  constructor(client: Socket) {
    super();

    this.client = client;

    this.createRequestResponseIteration();

    client.on('close', (withError: boolean) =>
      global.console.log(`Connection is closed${withError ? ' with error' : ''}.`));

    client.on('error', error =>
      global.console.log(error));
  }

  createRequestResponseIteration() {
    this.client.removeAllListeners('error');
    this.client.removeAllListeners('data');
    this.client.removeAllListeners('end');

    const request = new Request();
    const response = new Response();

    request.bindSocket(this.client);
    response.bindSocket(this.client);

    request.on('headers', () =>
      this.emit('request', request, response));

    response.on('served', () =>
      this.createRequestResponseIteration());
  }
}
