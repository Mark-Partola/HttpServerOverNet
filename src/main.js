// @flow

import { Server } from 'net';

const server = new Server();

server.on('connection', (client) => {

  client.on('data', (data) => {
    console.log(data.toString());
    client.write('HTTP/1.1 200 OK');
    client.end();
  });
});

server.on('listening', () => {
  console.log('Listening on 127.0.0.1:8080');
});

server.on('close', () => {
  console.log('Server stopped.');
});

server.on('error', (error) => {
  console.log('An error occurred.');
  console.log(error);
});

server.listen(8080);