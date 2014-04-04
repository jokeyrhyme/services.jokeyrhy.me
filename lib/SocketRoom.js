/*jslint indent:2, node:true*/

'use strict';

// Node.JS' built-in modules

var os, EventEmitter;
os = require('os');
EventEmitter = require('events').EventEmitter;

// this module

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

/**
 * coordinates the `ws` API across multiple related socket connections
 * https://github.com/einaros/ws/blob/master/doc/ws.md
 */
function SocketRoom(id) {
  EventEmitter.call(this);
  this.id = id;
  this.sockets = [];
  this.handlers = [];
}

SocketRoom.prototype =  Object.create(EventEmitter.prototype, {
  constructor: {
    value: EventEmitter
  }
});

// API borrowed from `ws`

SocketRoom.prototype.close = function (code, data) {
  this.sockets.forEach(function (ws) {
    ws.close.call(ws, code, data);
  });
};

SocketRoom.prototype.pause = function () {
  this.sockets.forEach(function (ws) {
    ws.pause.call(ws);
  });
};

SocketRoom.prototype.ping = function (data, options, dontFailWhenClosed) {
  this.sockets.forEach(function (ws) {
    ws.ping.call(ws, data, options, dontFailWhenClosed);
  });
};

SocketRoom.prototype.pong = function (data, options, dontFailWhenClosed) {
  this.sockets.forEach(function (ws) {
    ws.pong.call(ws, data, options, dontFailWhenClosed);
  });
};

SocketRoom.prototype.resume = function () {
  this.sockets.forEach(function (ws) {
    ws.resume.call(ws);
  });
};

SocketRoom.prototype.close = function (code, data) {
  this.sockets.forEach(function (ws) {
    ws.close.call(ws, code, data);
  });
};

SocketRoom.prototype.send = function (data, options, callback) {
  this.sockets.forEach(function (ws) {
    ws.send.call(ws, data, options, callback);
  });
};

SocketRoom.prototype.terminate = function () {
  this.sockets.forEach(function (ws) {
    ws.terminate.call(ws);
  });
};

// custom API

SocketRoom.prototype.createHandler = function (socket) {
  var me;
  me = this;
  return function (message) {
    var others;
    message = parseMessage(message);
    if (message.room === me.id) {
      others = me.sockets.filter(function (ws) {
        return ws !== socket;
      });
      others.forEach(function (ws) {
        ws.send(JSON.stringify(message));
      });
    }
  };
};

SocketRoom.prototype.addSocket = function (socket) {
  var me, handler;
  me = this;
  if (this.sockets.indexOf(socket) === -1) {
    this.sockets.push(socket);
    handler = this.createHandler(socket);
    this.handlers.push(handler);
  }
  socket.on('message', handler);
  socket.once('close', function () {
    me.removeSocket(socket);
  });
};

SocketRoom.prototype.removeSocket = function (socket) {
  var index, handler;
  index = this.sockets.indexOf(socket);
  if (index !== -1) {
    this.sockets.splice(index, 1);
    handler = this.handlers[index];
    this.handlers.splice(index, 1);
  }
  socket.removeListener('message', handler);
};

// exports

module.exports = SocketRoom;
