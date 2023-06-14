'use strict';
const { getSource, logger } = require('./utils/');
const checkers = require('./checkers/');
const scraper = require('./scraper.js');
const checker = require('./checker.js');

const sequentialCheck = async (proxies, tasks, options) => {
  for (const task of tasks) {
    await checker(proxies, task, options);
  }
};

const parallelCheck = (proxies, tasks, options) =>
  new Promise((resolve) => {
    const promises = tasks.map((task) => checker(proxies, task, options));
    Promise.all(promises).finally(resolve);
  });

const finalize = () => {
  console.log('All done!');
  setTimeout(() => {
    process.exit(0);
  }, 1000);
};

const execution = {
  multi: {
    channels: 35,
    checker: parallelCheck,
  },
  single: {
    channels: 150,
    checker: sequentialCheck,
  }
};

const boot = async ({
  executionType = 'single',
  timeout = 10000,
  source = 'proxy_sources.txt',
  test = false,
} = {}) => {
  const logFile = __dirname + '/../logs/proxy-checker.log';
  const appLogger = logger(logFile)(JSON.stringify)('ProxyChecker');

  process.on('uncaughtExceptionMonitor', (err) => {
    const errorLog = appLogger('boot')('error');
    errorLog(err);
  });

  const proxySources = getSource(source);
  const sources = test ? proxySources.splice(0, 3) : proxySources;
  const proxies = await scraper(sources, appLogger);
  const settings = execution[executionType];
  if (settings) {
    const { checker, channels } = settings;
    await checker(
      proxies,
      Object.values(checkers),
      appLogger,
      { timeout, channels }
    );
    finalize();
  } else {
    const msg = 'Wrong executionType!';
    throw new Error(msg);
  }
};

process.on('uncaughtException', (err) => {
  console.error(err.stack || err);
  setTimeout(process.exit, 0, 1);
});

module.exports = boot;
