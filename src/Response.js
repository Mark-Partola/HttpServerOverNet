// @flow

import Stream from 'stream';
import { Socket } from 'net';

class Response extends Stream.Writable {

  destination: Socket;

  connect(destination: Socket) {
    this.destination = destination;
  }

  _write(): boolean {
    return true;
  }
}


export default Response;
