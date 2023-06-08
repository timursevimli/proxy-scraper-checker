'use strict';
const {
  Collector,
  Queue,
  randomUAgent,
  logger,
  validateProxy
} = require('../utilities/');

const log = logger('scraper');
const infoLog = log('info');
const errorLog = log('error');

module.exports = (sources, { timeout = 10000, channels = 10 } = {}) =>
  new Promise((resolve) => {
    const dc = new Collector(sources.length)
      .done((errors, results) => {
        if (Object.keys(errors).length > 0) console.error({ errors });
        const scrapedProxies = new Set();
        for (const key in results) {
          const result = results[key];
          if (result.length > 0) {
            result.forEach((data) => scrapedProxies.add(data));
          }
        }
        console.log('Scraper is done!', { size: scrapedProxies.size });
        resolve(scrapedProxies);
      });
    let i = 1;
    const queue = Queue.channels(channels)
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
                if (match) {
                  const proxy = match[0];
                  const isValidProxy = validateProxy(proxy);
                  if (isValidProxy) proxies.push(proxy);
                }
              }
              cb(null, proxies);
            },
            (reason) => cb(reason))
          .catch((err) => cb(err));
      })
      .success((res) => {
        infoLog(res);
        dc.pick(`Task${i}`, res);
      })
      .failure((err) => {
        errorLog(err);
        dc.fail(`Task${i}`, err);
      })
      .done(() => i++);

    sources.forEach((source) => queue.add(source));
  });
