'use strict';

const { getSource } = require('./utils/');
const { logger } = require('./lib');
const checkers = require('./checkers/');
const scraper = require('./scraper.js');
const checker = require('./checker.js');

const sequentialCheck = async (proxies, tasks, logger, options) => {
  for (const task of tasks) {
    await checker(proxies, task, logger, options);
  }
};

const parallelCheck = (proxies, tasks, logger, options) =>
  new Promise((resolve) => {
    const promises = tasks.map((task) =>
      checker(proxies, task, logger, options),
    );
    Promise.all(promises).finally(resolve);
  });

const finalize = async () => {
  logger.show('system', 'All done!');
  await logger.close();
  process.exit(0);
};

const executionOptions = {
  multi: {
    execution: parallelCheck,
    chCalc: (ch, count) => (ch / count).toFixed(0),
  },
  single: {
    execution: sequentialCheck,
    chCalc: (ch) => ch,
  },
};

const boot = async ({
  mode = 'single',
  timeout = 10000,
  source = 'proxy_sources.txt',
  test = false,
  channels = 100,
} = {}) => {
  const proxySources = await getSource(source);
  const sources = test ? proxySources.splice(0, 3) : proxySources;
  const proxies = await scraper(sources);
  const { execution, chCalc } = executionOptions[mode];
  if (!execution) {
    const msg = 'Wrong mode, use \'single\' or \'multi\' mode in config.json!';
    throw new Error(msg);
  }
  const tasks = Object.values(checkers);
  await execution(proxies, tasks, {
    timeout,
    channels: chCalc(channels, tasks.length),
  });
  finalize();
};

process.on('uncaughtExceptionMonitor', (err) => {
  logger.show('error', err.message || err);
});

process.on('uncaughtException', (err) => {
  logger.error(err);
  setTimeout(async () => {
    await logger.close();
    process.exit(1);
  }, 0);
});

process.on('SIGINT', async () => {
  logger.show('system', 'EXITING...');
  await logger.close();
  process.exit(0);
});

module.exports = boot;
