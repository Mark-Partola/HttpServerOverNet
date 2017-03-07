// @flow

export default class Connection {

  constructor(client) {
    client.on('data', (data) => {
      global.console.log(data);
    });

    client.on('end', () => {

    });

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
