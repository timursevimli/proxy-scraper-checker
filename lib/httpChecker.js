'use strict';
const { Agent } = require('node:http');
const { Collector, Queue, randomUAgent } = require('../utilities/');
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
        keepAlive: true,
        keepAliveMsecs: 1000,
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
      fetch(url, options)
        .then(
          (res) => (res.status === 200 ? res.text() : undefined),
          (reason) => cb(reason)
        )
        .then(
          (data) => {
            console.log({ data });
            //TODO:'Complete this case'
          },
          (reason) => cb(reason)
        )
        .catch((err) => cb(err));
    })
    .success((res) => {
      dc.collect(`Task${i}`, null, res);
    })
    .failure((err, res) => {
      dc.collect(`Task${i}`, err, res);
    })
    .done(() => i++)
    .drain(() => console.log('Checking queue drain!'));

  proxies.forEach((proxy) => queue.add(proxy));
});
