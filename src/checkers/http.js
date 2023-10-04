'use strict';

const { Agent, request } = require('node:http');
const { getDuration, getGeoInfo, getAgent } = require('../lib');

const http = (task, cb) => {
  const { proxy, timeout } = task;
  const [host, port] = proxy.split(':');

  const controller = new AbortController();

  let timer = setTimeout(() => {
    timer = null;
    controller.abort();
    const err = new Error('Aborted from timer!');
    cb(err);
  }, timeout);

  const options = {
    hostname: 'vulnweb.com',
    port: 80,
    method: 'GET',
    signal: controller.signal,
    agent: new Agent({ host, port }),
    headers: {
      Connection: 'close',
      'User-Agent': getAgent(),
    },
  };

  const begin = getDuration();

  const req = request(options, (res) => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (res.statusCode !== 200) {
      const err = new Error(res.statusMessage);
      return void cb(err);
    }
    const duration = getDuration(begin);
    const country = getGeoInfo(host);
    const result = `HTTP ${proxy} ${country} ${duration}`;
    cb(null, result);
  });

  req.on('error', (err) => void cb(err));
  req.end();
};

module.exports = { http };
