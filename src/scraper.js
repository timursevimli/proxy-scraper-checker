'use strict';

const { Collector, Queue, logger } = require('./lib');
const { randomUAgent, validateProxy } = require('./utils/');

module.exports = (sources, { timeout = 10000, channels = 10 } = {}) =>
  new Promise((resolve) => {
    const dc = new Collector(sources.length).done((errors, results) => {
      for (const key in errors) {
        const error = errors[key];
        logger.show('debug', error);
      }
      const scrapedProxies = new Set();
      for (const key in results) {
        const result = results[key];
        if (result.length > 0) {
          for (const data of result) {
            scrapedProxies.add(data);
          }
        }
      }
      logger.show('system', `Scraper is done! Founded: ${scrapedProxies.size}`);
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
      .success((res) => void dc.pick(`Task${i}`, res))
      .failure((err) => void dc.fail(`Task${i}`, err?.message))
      .done(() => void i++);

    for (const source of sources) queue.add(source);
  });
