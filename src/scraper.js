'use strict';

const { Collector, Queue } = require('./lib');
const { randomUAgent, validateProxy } = require('./utils/');

module.exports = (sources, logger, { timeout = 10000, channels = 10 } = {}) =>
  new Promise((resolve) => {
    const dc = new Collector(sources.length).done((errors, results) => {
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
    const log = logger('scraper');
    const infoLog = log('info');
    const errorLog = log('error');
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
            (reason) => cb(reason),
          )
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
              if (proxies.length > 0) {
                cb(null, proxies);
              } else {
                const err = new Error(`Proxies not found in url: ${url}`);
                cb(err);
              }
            },
            (reason) => cb(reason),
          )
          .catch((err) => cb(err));
      })
      .success((res) => {
        infoLog(res);
        dc.pick(`Task${i}`, res);
      })
      .failure((err) => {
        errorLog(err?.message);
        dc.fail(`Task${i}`, err?.message);
      })
      .done(() => i++);

    sources.forEach((source) => queue.add(source));
  });
