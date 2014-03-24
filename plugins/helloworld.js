/*jslint indent:2, node:true*/

'use strict';

// exports

exports.name = 'helloworld';

exports.version = '0.0.0';

exports.register = function (plugin, options, next) {
  options = options || {};
  options.msg = options.msg || 'hello world';
  plugin.route({
    method: 'GET',
    path: '/hello',
    handler: function (request, reply) {
      reply(options.msg + ', ' + request.info.remoteAddress);
    }
  });
  next();
};
