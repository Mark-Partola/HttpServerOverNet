// @flow

export default class Connection {

  constructor(client) {
    this.buffer = new Buffer([]);

    client.on('data', (data) => {
      this.buffer = Buffer.concat([this.buffer, data]);

      const headersDelimiter = new Buffer('\r\n\r\n');
      const indexOfDelimiter = data.indexOf(headersDelimiter);

      if (indexOfDelimiter !== -1) {
        const headers = this.buffer.slice(0, indexOfDelimiter).toString();
        console.log(headers);
      }
    });

    client.on('end', () => console.log(this.buffer.toString()));

    client.on('close', (data) => {
      global.console.log('close');
      global.console.log(data);
    });

    client.on('error', (data) => {
      global.console.log('error');
      global.console.log(data);
    });
  }
}
