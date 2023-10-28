'use strict';

const net = require('node:net');
const { Agent, request } = require('node:http');
const { getDuration, getGeoInfo, getAgent } = require('../lib');

const https = (task, cb) => {
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
    hostname: 'api64.ipify.org',
    path: '/?format\\=json',
    port: 443,
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
    const duration = getDuration(begin);

    res.on('data', (chunk) => {
      const data = chunk.toString();
      const isIp = net.isIPv4(data) || net.isIPv6(data);
      if (!isIp) return void cb(new Error('Proxy is not configured'));
      const country = getGeoInfo(host);
      const result = `HTTPS ${proxy} ${country} ${duration}`;
      cb(null, result);
    });

    if (res.statusCode !== 200) {
      const message = res.statusMessage || 'Status code is not 200';
      req.destroy(message);
    }
  });

  req.on('error', (err) => void cb(err));
  req.on('close', () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  });
  req.end();
};

module.exports = { https };
