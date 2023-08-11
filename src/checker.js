'use strict';

const { Queue, logger } = require('./lib/');

module.exports = (proxies, checker, options) =>
  new Promise((resolve) => {
    const { channels, timeout } = options;
    const name = checker.name.toUpperCase();
    logger.show('system', `${name} started!`);
    const queue = Queue.channels(channels)
      .timeout(timeout)
      .process(checker)
      .success((res) => logger.log(res))
      // .failure((err) => void logger.error(err.message))
      .drain(() => {
        logger.show('system', `${name} is done!`);
        resolve();
      });

    for (const proxy of proxies) queue.add(proxy);
  });
