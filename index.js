/*jslint indent:2, node:true*/

'use strict';

// Node.JS' built-in modules

var fs, path;
fs = require('fs');
path = require('path');

// this module

var Hapi = require('hapi');

// create a Pack to put the Server in
var pack = new Hapi.Pack();

// Create a server with a host and port
var server = pack.server('0.0.0.0', process.env.PORT || 8000, {
  cors: {
    origin: [
      'http://jokeyrhy.me',
      'https://jokeyrhy.me',
      'http://localhost:4000',
      'https://localhost:4000'
    ],
    isOriginExposed: false,
    credentials: false
  }
});

var pluginPath;
/*jslint nomen:true*/ // Node.JS' __dirname
pluginPath = path.join(__dirname, 'plugins');
/*jslint nomen:false*/

function pluginCallback(err) {
  if (err) {
    throw err;
  }
}

// add all the modules in the plugins directory to this Pack
fs.readdir(pluginPath, function (err, files) {
  var f, file;
  if (err) {
    throw err;
  }
  f = files.length;
  while (f > 0) {
    f -= 1;
    file = files[f];
    if (/^\w+\.js$/.test(file)) {
      pack.register(require(path.join(pluginPath, file)), {}, pluginCallback);
    }
  }

  // Start the Pack of Servers
  pack.start();
});
