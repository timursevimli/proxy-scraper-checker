'use strict';

const { Queue, logger } = require('./lib/');

module.exports = (proxies, checker, options) =>
  new Promise((resolve) => {
    const { channels, timeout } = options;
    const name = checker.name.replace('check', '').toUpperCase();
    const queue = Queue.channels(channels)
      .process(checker)
      .success((res) => void logger.log(res))
      .drain(() => {
        logger.show('system', `${name} checker is done!`);
        resolve();
      });

    logger.show('system', `${name} checker started!`);
    for (const proxy of proxies) queue.add({ proxy, timeout });
  });
