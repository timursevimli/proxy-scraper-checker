'use strict';
const { Collector, Queue, randomUAgent } = require('../utilities/');
module.exports = (sources, timeout = 10000) => new Promise((resolve) => {
  const dc = new Collector(sources.length)
    .done((err, data) => {
      if (err) console.log({ CollectorErrors: err });
      const results = new Set();
      for (const key in data) {
        const datas = data[key];
        if (datas.length > 0) {
          datas.forEach((data) => results.add(data));
        }
      }
      console.log({ size: results.size });
      resolve(results);
    });
  let i = 1;
  const queue = Queue.channels(20)
    .timeout(timeout)
    .process((url, cb) => {
      const proxies = [];
      const options = {
        timeout,
        method: 'GET',
        headers: {
          'User-agent': randomUAgent(),
          'Content-Type': 'application/json',
        },
      };
      fetch(url, options)
        .then(
          (res) => res.text(),
          (reason) => cb(reason))
        .then(
          (data) => {
            const lines = data.split('\n');
            for (const line of lines) {
              const regex = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5})/;
              const match = line.match(regex);
              if (match) proxies.push(match[0]);
            }
            cb(null, proxies);
          },
          (reason) => cb(reason))
        .catch((err) => {
          console.error(err);
          cb(err);
        });
    })
    .success((res) => {
      dc.pick(`Task${i}`, res);
    })
    .failure((err) => {
      dc.fail(`Task${i}`, err);
    })
    .done(() => i++)
    .drain(() => console.log('Scraping queue drain!'));

  sources.forEach((source) => queue.add(source));
});
