'use strict';
const { Agent } = require('node:http');
const { Collector, Queue, randomUAgent } = require('../utilities/');
const { performance } = require('perf_hooks');
const serializeData = ({
  city,
  country,
  countryCode,
  region,
  regionName,
}, duration) => ({
  city,
  country,
  countryCode,
  region,
  regionName,
  duration
});
module.exports = (proxies, timeout = 10000) => new Promise((resolve) => {
  const count = proxies instanceof Set ? proxies.size : proxies.length;
  const dc = new Collector(count)
    .done((err, data) => {
      console.dir({ err, data });
    });
  let i = 1;
  const queue = Queue.channels(100)
    .timeout(timeout)
    .process((proxy, cb) => {
      const [host, port] = proxy.split(':');
      const url = `http://ip-api.com/json/${host}`;
      const agent = new Agent({
        // keepAlive: true,
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
            const result = serializeData(data, duration);
            cb(null, result);
          },
          (reason) => cb(reason)
        )
        .catch((err) => cb(err));
    })
    .success((res) => {
      dc.pick(`Task${i}`, res);
    })
    .failure((err) => {
      dc.fail(`Task${i}`, err);
    })
    .done((err, res) => {
      console.log('Done', { res, err });
      i++;
    })
    .drain(() => console.log('Checking queue drain!'));

  proxies.forEach((proxy) => queue.add(proxy));
});
