'use strict';

const { Agent } = require('node:http');
const { getDuration, getGeoInfo, randomUAgent } = require('../utils/');

const checkHttps = (proxy, cb) => {
  const timeout = 10000;
  const [host, port] = proxy.split(':');
  const url = 'https://google.com';
  const agent = new Agent({
    keepAlive: false,
    // keepAliveMsecs: 1000,
    timeout,
    host,
    port,
  });
  const options = {
    agent,
    timeout,
    method: 'GET',
    headers: {
      'User-agent': randomUAgent(),
      'Content-Type': 'application/json',
    },
  };
  const begin = getDuration();
  fetch(url, options)
    .then((res) => {
      if (res.status === 200) {
        getGeoInfo(proxy).then((res) => {
          const duration = getDuration(begin);
          const result = `${res} ${duration}`;
          cb(null, result);
        }, cb);
      }
    }, cb)
    .catch(cb);
};

module.exports = checkHttps;
