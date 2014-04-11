/*jslint indent:2, node:true*/

'use strict';

// 3rd-party modules

var request;
request = require('request');

// this module

var bearerToken;

function getBearerToken(callback) {
  request.post({
    url: 'https://api.twitter.com/oauth2/token',
    auth: {
      user: process.env.TWITTER_KEY,
      pass: process.env.TWITTER_SECRET,
      sendImmediately: true
    },
    strictSSL: true
  }, function (err, res, body) {
    if (err) {
      callback(err);
      return;
    }
    if (res.headers['content-type'].indexOf('application/json') !== 0) {
      callback(new TypeError('upstream API responded with unexpected type'));
      return;
    }
    body = JSON.parse(body);
    callback(body.access_token);
  }).form({
    grant_type: 'client_credentials'
  });
}

function getUserTimeline(options, callback) {
  options = options || {};
  request.get({
    url: 'https://api.twitter.com/1.1/statuses/user_timeline.json',
    qs: options,
    headers: {
      Authorization: 'Bearer ' + bearerToken
    },
    strictSSL: true
  }, function (err, res, body) {
    if (err) {
      callback(err);
      return;
    }
    if (res.headers['content-type'].indexOf('application/json') !== 0) {
      callback(new TypeError('upstream API responded with unexpected type'));
      return;
    }
    body = JSON.parse(body);
    callback(body);
  }).form({
    grant_type: 'client_credentials'
  });
}

// exports

exports.name = 'twitter';

exports.version = '0.0.0';

exports.register = function (plugin, options, next) {
  if (!process.env.TWITTER_KEY || !process.env.TWITTER_SECRET) {
    next();
    return;
  }

  getBearerToken(function (token) {
    bearerToken = token;
  });
  options = options || {};
  options.msg = options.msg || 'hello world';
  plugin.route({
    method: 'GET',
    path: '/twitter',
    handler: function (request, reply) {
      reply(options.msg + ', ' + request.info.remoteAddress);
    }
  });
  plugin.route({
    method: 'GET',
    path: '/twitter/1.1/statuses/user_timeline.json',
    handler: function (request, reply) {
      getUserTimeline(request.query, function (timeline) {
        reply(JSON.stringify(timeline));
      });
    }
  });
  next();
};
