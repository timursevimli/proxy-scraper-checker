'use strict';

const { Agent } = require('node:http');
const { getDuration, getGeoInfo, getUserAgent } = require('../utils/');

const checkHttps = async (task, cb) => {
  const { proxy, timeout } = task;
  const [host, port] = proxy.split(':');
  const url = 'https://google.com';

  const options = {
    method: 'GET',
    agent: new Agent({ host, port }),
    signal: AbortSignal.timeout(timeout),
    headers: {
      Connection: 'close',
      'User-agent': getUserAgent(),
    },
  };

  const begin = getDuration();

  try {
    const res = await fetch(url, options);
    if (res.status !== 200) return void cb(res.statusText);
    const duration = getDuration(begin);
    const geoInfo = await getGeoInfo(proxy);
    const result = `HTTPS ${geoInfo} ${duration}`;
    cb(null, result);
  } catch (e) {
    cb(e);
  }
};

module.exports = checkHttps;
