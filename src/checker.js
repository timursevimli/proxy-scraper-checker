'use strict';
const { Queue, logger } = require('./utils/');

module.exports = (proxies, checker, options) =>
  new Promise((resolve) => {
    const { channels = 20, timeout = 10000 } = options || {};
    const name = checker.name;
    console.log(`${name} started!`);
    const log = logger(name);
    const queue = Queue.channels(channels)
      .timeout(timeout)
      .process(checker)
      .success(log('info'))
      .failure(log('error'))
      .drain(() => {
        console.log(`${name.toUpperCase()} is done!`);
        resolve();
      });

    proxies.forEach((proxy) => queue.add(proxy));
  });
