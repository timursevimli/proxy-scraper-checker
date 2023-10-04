'use strict';

const { Collector, Queue } = require('./utils');
const { validate, getSource, showProgress } = require('./lib');

const parseScrapedData = (results) => {
  const scrapedProxies = new Set();
  for (const key in results) {
    const result = results[key];
    if (result.length === 0) continue;
    for (const data of result) {
      scrapedProxies.add(data);
    }
  }
  return scrapedProxies;
};

const scrapeProxy = async (url, timeout, cb) => {
  const controller = new AbortController();

  let timer = setTimeout(() => {
    timer = null;
    controller.abort();
    cb(new Error(`Request aborted from timer for url: ${url}`));
  }, timeout);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (res.status >= 400) {
      throw new Error(`${res.statusText} for url: ${url}`);
    }
    const result = await res.text();
    const lines = result.split('\n');
    const datas = lines.length === 1 ? result.split(',') : lines;

    const proxies = [];

    for (const data of datas) {
      const regex = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5})/;
      const match = data.match(regex);
      if (!match) continue;
      const proxy = match[0];
      const isValidProxy = validate(proxy);
      if (isValidProxy) proxies.push(proxy);
    }
    if (proxies.length === 0) {
      throw new Error(`Proxies not found in url: ${url}`);
    }
    cb(null, proxies);
  } catch (error) {
    cb(error);
  } finally {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }
};

module.exports = async (logger, options) => {
  const { timeout, source, channels } = options;
  const sources = await getSource(source);

  let count = 1;
  let success = 0;
  let failed = 0;

  return new Promise((resolve) => {
    const dataCollector = new Collector(sources.length)
      .finish((errors, results) => {
        setTimeout(() => {
          for (const key in errors) {
            const error = errors[key];
            logger.show('debug', error);
          }
          const proxies = parseScrapedData(results);
          logger.show('system', `Scraper is done! Proxy count:${proxies.size}`);
          resolve(proxies);
        }, 0);
      })
      .done((err) => {
        err ? failed++ : success++;
        showProgress(logger, sources.length, count, success, failed);
      });

    const queue = Queue.channels(channels)
      .process((url, cb) => void scrapeProxy(url, timeout, cb))
      .success((res) => void dataCollector.pick(`Task${count}`, res))
      .failure((err) => void dataCollector.fail(`Task${count}`, err.message))
      .done(() => void count++);

    logger.show('system', 'Scraping started!');
    for (const source of sources) queue.add(source);
  });
};
