'use strict';
const {
  scraper,
  checkHttp,
  checkHttps,
  checkSocks4,
  checkCurlSocks4,
  checkCurlSocks5
} = require('./lib');
const { getSource } = require('./utilities');
const proxySources = getSource('proxy_sources.txt');
const testSource = proxySources.splice(0, 3);

const checkerFunctions = {
  'curl': [checkCurlSocks4, checkCurlSocks5],
  'node': [checkSocks4],
};
//TODO: DIVIDE TO THREADS!
//TODO: Change logger contracts!

const sequentialCheck = async (curl = true) => {
  const checkerId = curl ? 'curl' : 'node';
  const [checkerS4, checkerS5] = checkerFunctions[checkerId];
  // const scrapedProxies = await scraper(proxySources);
  const scrapedProxies = await scraper(testSource);
  // await checkHttp(scrapedProxies);
  // await checkHttps(scrapedProxies);
  await checkerS4(scrapedProxies);
  await checkerS5(scrapedProxies);
};

const parallelCheck = (curl = true) =>
  new Promise((resolve) => {
    const checkerId = curl ? 'curl' : 'node';
    const [checkerS4, checkerS5] = checkerFunctions[checkerId];
    const scrapedProxies = scraper(proxySources);
    scrapedProxies.then((proxies) => {
      const http = checkHttp(proxies);
      const https = checkHttps(proxies);
      const socks4 = checkerS4(proxies);
      const socks5 = checkerS5(proxies);

      Promise.all([http, https, socks4, socks5])
        .then(resolve);
    });
  });

const finalize = () => {
  console.log('All done!');
  setTimeout(() => {
    process.exit(0);
  }, 1000);
};

const boot = ({ parallel = false, curl = false }) => {
  const checker = parallel ? parallelCheck(curl) : sequentialCheck(curl);
  checker.then(finalize);
};

boot({ parallel: false, curl: false });

process.on('uncaughtException', (err) => {
  console.error(err);
  process.exit(1);
});
