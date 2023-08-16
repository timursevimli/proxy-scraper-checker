'use strict';

const { Collector, Queue, logger } = require('./lib');
const { randomUAgent, validateProxy } = require('./utils/');

const showErrors = (errors) => {
  for (const key in errors) {
    const error = errors[key];
    logger.show('debug', error);
  }
};

const resultsHandler = (results) => {
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
  let aborted = false;

  let timer = setTimeout(() => {
    timer = null;
    if (!aborted) {
      controller.abort();
      aborted = true;
    }
    const msg = `Request timeout for this url: ${url}`;
    cb(new Error(msg));
  }, timeout);

  const options = {
    signal: controller.signal,
    method: 'GET',
    headers: {
      Connection: 'close',
      'User-agent': randomUAgent(),
    },
  };

  const proxies = [];

  try {
    const res = await fetch(url, options);
    if (res.status !== 200) {
      const msg = `${res.statusText} for this url: ${url}`;
      throw new Error(msg);
    }
    const result = await res.text();

    const datas = result.split('\n').length === 1 ?
      result.split(',') :
      result.split('\n');

    for (const data of datas) {
      const regex = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5})/;
      const match = data.match(regex);
      if (!match) continue;
      const proxy = match[0];
      const isValidProxy = validateProxy(proxy);
      if (isValidProxy) proxies.push(proxy);
    }
    if (proxies.length > 0) return void cb(null, proxies);
    const err = new Error(`Proxies not found in this url: ${url}`);
    cb(err);
  } catch (error) {
    cb(error);
  } finally {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (!aborted) controller.abort();
  }
};

module.exports = (sources, options) =>
  new Promise((resolve) => {
    const { timeout, channels } = options;
    const dataCollector = new Collector(sources.length).done(
      (errors, results) => {
        showErrors(errors);
        const result = resultsHandler(results);
        const msg = `Scraper is done! Proxy count: ${result.size}`;
        logger.show('system', msg);
        resolve(result);
      },
    );

    let i = 1;

    const queue = Queue.channels(channels)
      .process((url, cb) => void scrapeProxy(url, timeout, cb))
      .success((res) => void dataCollector.pick(`Task${i}`, res))
      .failure((err) => void dataCollector.fail(`Task${i}`, err.message))
      .done(() => void i++);

    logger.show('system', 'Scraping started!');
    for (const source of sources) queue.add(source);
  });
