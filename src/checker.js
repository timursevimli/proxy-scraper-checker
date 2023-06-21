'use strict';
const { Queue } = require('./utils/');

module.exports = (proxies, checker, logger, options) =>
  new Promise((resolve) => {
    const { channels, timeout } = options;
    const name = checker.name;
    console.log(`${name} started!`);
    const log = logger(name);
    const infoLog = log('info');
    const errorLog = log('error');
    const queue = Queue.channels(channels)
      .timeout(timeout)
      .process(checker)
      .success(infoLog)
      .failure((err) => errorLog(err?.message))
      .drain(() => {
        console.log(`${name} is done!`);
        resolve();
      });

    proxies.forEach((proxy) => queue.add(proxy));
  });
