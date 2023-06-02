'use strict';
const { getSource } = require('./utilities');
const proxySources = getSource('proxy_sources.txt');
const testSource = proxySources.splice(0, 3);
const {
  scraper,
  checkHttp,
  checkHttps,
  checkSocks4,
  checkCurlSocks4,
  checkCurlSocks5
} = require('./lib');

//TODO: Divide to threads!
//TODO: Change logger contracts!
//TODO: Remove checkers on lib and use one abstract checker with more jobs!

const sequentialCheck = async (proxies, options, checkers) => {
  for (const checker of checkers) {
    await checker(proxies, options);
  }
};

const parallelCheck = (proxies, options, checkers) =>
  new Promise((resolve) => {
    const promises = checkers.map((checker) => checker(proxies, options));
    Promise.all(promises).finally(resolve);
  });

const finalize = () => {
  console.log('All done!');
  setTimeout(() => {
    process.exit(0);
  }, 1000);
};

const socksCheckers = {
  curl: [checkCurlSocks4, checkCurlSocks5],
  node: [checkSocks4, () => { }],
};

const channelsCount = {
  parallel: { http: 150, socks: 20 },
  sequential: { http: 300, socks: 40 },
};

const boot = async (
  { type = 'parallel', useCurl = false, timeout = 10000 }
) => {
  const proxies = await scraper(testSource);
  const socksFns = socksCheckers[useCurl ? 'curl' : 'node'];
  const [checkSocks4, checkSocks5] = socksFns;
  const checkers = [checkHttp, checkHttps, checkSocks4, checkSocks5];
  const { http, socks } = channelsCount[type];

  const checkOpts = {
    timeout,
    channels: { http, socks },
  };

  const checker = type === 'parallel' ? parallelCheck : sequentialCheck;
  checker(proxies, checkOpts, checkers).then(finalize);
};

const bootOptions = {
  type: 'parallel',
  useCurl: true,
  timeout: 10000,
};

boot(bootOptions);

process.on('uncaughtException', (err) => {
  console.error(err);
  process.exit(1);
});
