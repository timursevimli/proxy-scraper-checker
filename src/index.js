'use strict';
const { getSource } = require('./utilities');
const proxySources = getSource('proxy_sources.txt');
const testSource = proxySources.splice(0, 3);
const tasks = require('./tasks');
const { scraper, checker } = require('./lib');

//TODO: Divide to threads!

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
    channels: 20,
    checker: parallelCheck,
  },
  single: {
    channels: 100,
    checker: sequentialCheck,
  }
};

const filterTasks = (useCurl) => ({ name }) => {
  if (name) {
    if (name.includes('Socks')) {
      return useCurl ?
        name.includes('curl') :
        !name.includes('curl');
    }
    return true;
  }
};

const boot = async (
  { executionType = 'single', useCurl = true, timeout = 10000 } = {}
) => {
  const proxies = await scraper(testSource);
  const selectedTasks = Object.values(tasks).filter(filterTasks(useCurl));
  const settings = execution[executionType];
  if (settings) {
    const { checker, channels } = settings;
    await checker(proxies, selectedTasks, { timeout, channels });
    finalize();
  } else {
    const msg = 'Wrong executionType!';
    throw new Error(msg);
  }
};

process.on('uncaughtException', (err) => {
  console.error(err);
  process.exit(1);
});

module.exports = boot;
