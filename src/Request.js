// @flow

export type MainHeader = {
  method: string,
  uri: string,
  version: string
};

export type Headers = {
  start: MainHeader,
  common: Map<string, string>
};

export default class Request {

  method: string;
  uri: string;
  version: string;
  headers: Map<string, string>;
  body: string;

  constructor() {
    this.body = '';
  }

  setStartHeader(startHeader: MainHeader): void {
    this.method = startHeader.method;
    this.uri = startHeader.uri;
    this.version = startHeader.version;
  }

  setHeaders(headers: Map<string, string>): void {
    this.headers = headers;
  }

  setBody(body: string) {
    this.body = body;
  }

  getBody() {
    return this.body;
  }
}
