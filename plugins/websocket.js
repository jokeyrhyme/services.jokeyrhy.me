/*jslint indent:2, node:true*/

'use strict';

// Node.JS' built-in modules

var os, path;
os = require('os');
path = require('path');

// 3rd-party modules

var WebSocketServer;
WebSocketServer = require('ws').Server;

// custom modules

var SocketRoom;
SocketRoom = require(path.join('..', 'lib', 'SocketRoom'));

// this module

var sockets, rooms;
sockets = [];
rooms = {};

function parseMessage(message) {
  if (typeof message === 'string') {
    try {
      return JSON.parse(message);
    } catch (err) {
      console.error('received non-JSON message');
      return {};
    }
  }
}

function getStats() {
  return {
    date: new Date(),
    type: os.type(),
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    uptime: os.uptime(),
    loadavg: os.loadavg(),
    totalmem: os.totalmem(),
    freemem: os.freemem()
  };
}

function onConnection(ws) {
  var statsInterval;

  statsInterval = setInterval(function () {
    ws.send(JSON.stringify({
      type: 'stats',
      data: getStats()
    }));
  }, 60 * 1e3); // 60 seconds

  ws.on('message', function (message) {
    message = parseMessage(message);
    if (message.type === 'join') {
      rooms[message.room] = rooms[message.room] || new SocketRoom(message.room);
      rooms[message.room].addSocket(ws);
    }
  });

  ws.on('close', function () {
    clearInterval(statsInterval);
  });
}

// exports

exports.name = 'websocket';

exports.version = '0.0.0';

exports.register = function (plugin, options, next) {
  options = options || {};
  plugin.servers.forEach(function (server) {
    var wss;
    options.server = server.listener;
    wss = new WebSocketServer(options);
    sockets.push(wss);
    wss.on('connection', onConnection);
  });
  next();
};
