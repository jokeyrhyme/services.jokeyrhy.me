/*jslint indent:2, node:true*/

'use strict';

var Hapi = require('hapi');

// Create a server with a host and port
var server = Hapi.createServer('0.0.0.0', process.env.PORT || 8000, {
  origin: [
    'http://jokeyrhy.me',
    'https://jokeyrhy.me',
    'http://localhost:4000',
    'https://localhost:4000'
  ],
  isOriginExposed: false,
  credentials: false
});

// Add the route
server.route({
  method: 'GET',
  path: '/hello',
  handler: function (request, reply) {
    reply('hello world');
  }
});

// Start the server
server.start();
