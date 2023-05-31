'use strict';
const { Agent } = require('node:http');
const { performance } = require('node:perf_hooks');
const { Queue, randomUAgent, logger } = require('../utilities/');
const file = __dirname + '/../logs/httpChecker.log';

const log = logger(file)(JSON.stringify)('AppHttpChecker')('httpChecker');
const infoLog = log('info');
const errorLog = log('error');

const serializeData = ({
  city,
  country,
  countryCode,
  region,
  regionName,
}, duration, host, port) => ({
  city,
  country,
  countryCode,
  region,
  regionName,
  duration,
  host,
  port,
});
module.exports = (proxies, timeout = 10000) => new Promise((resolve) => {
  let i = 1;
  const queue = Queue.channels(200)
    .timeout(timeout)
    .process((proxy, cb) => {
      const [host, port] = proxy.split(':');
      const url = `http://ip-api.com/json/${host}`;
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
        }
      };
      const startTime = performance.now();
      let duration = undefined;
      fetch(url, options)
        .then(
          (res) => {
            if (res.status === 200) {
              duration = performance.now() - startTime;
              return res.json();
            }
          },
          (reason) => cb(reason)
        )
        .then(
          (data) => {
            const result = serializeData(data, duration, host, port);
            cb(null, result);
          },
          (reason) => cb(reason)
        )
        .catch((err) => cb(err));
    })
    .success((res) => {
      infoLog(res);
    })
    .failure((err) => {
      errorLog(err);
    })
    .done((err, res) => {
      console.log('Done', { res, err, count: i++ });
    })
    .drain(() => {
      console.log('HttpChecker Done!');
      resolve();
    });

  proxies.forEach((proxy) => queue.add(proxy));
});
