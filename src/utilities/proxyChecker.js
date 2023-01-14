'use strict';

require('dotenv').config();
const axios = require('axios');
const checkerOptions = require('../options/checkerRequestParam.js');
const pLimit = require('p-limit');
const { yellow, green, red } = require('../helpers/Colorer.js');
const {
  saveAlivesToLog,
  fileIsExist,
  createFile,
  removeFile
} = require('../helpers/logSaver.js');

const checkerLogger = count => {
  let index = 0;
  const stats = { success: 0, failed: 0 };
  return isSuccess => {
    const progress = ((index++ / count) * 100).toFixed(1);
    process.stdout.write(
      yellow('[CHECKER WORKING]') +
      ' Checking count: ' + green(count) +
      yellow('|') +
      'Alive: ' + green((isSuccess ? ++stats.success : stats.success)) +
      yellow('|') +
      'Dead: ' + red((isSuccess ? stats.failed : ++stats.failed)) +
      yellow('|') +
      'Progress: ' + green(progress + '%') + '\r'
    );
    if (count === index) {
      console.log(
        green('[CHECKER COMPLETED]') +
        ' Checking count: ' + green(count) +
        yellow('|') +
        'Alive: ' + green(stats.success) +
        yellow('|') +
        'Dead: ' + red(stats.failed) +
        yellow('|') +
        'Progress: ' +  green('100%')
      );
    }
  };
};

const makeRequest = async (
  proxy,
  logger,
) => {
  const [ip, port] = proxy.split(':');
  const proxySettings = {
    proxy: {
      host: ip,
      port,
    },
    timeout: 10000,
  };

  try {
    const req = await axios.get('http://google.com', proxySettings);
    if (req.status !== 200) return;
    const geoReq = await axios.get(`http://ip-api.com/json/${ip}`, checkerOptions);
    const { countryCode } = geoReq.data;
    saveAlivesToLog(ip, port, countryCode);
    logger(true);
  } catch (err) {
    logger(false);
  }
};

const proxyChecker = async scrapedProxies => {
  const uniqueScrapedProxies = new Set(scrapedProxies);
  const proxiesCount = uniqueScrapedProxies.size;
  const logger = checkerLogger(proxiesCount);
  const threat = parseInt(process.env.CHECKER_THREAT);
  const queue = pLimit(threat);
  const promises = [];

  const logsFile = 'alive_proxies';
  const isExist = fileIsExist(logsFile);
  if (isExist) removeFile(logsFile);
  createFile(logsFile);

  for (const proxy of uniqueScrapedProxies) {
    promises.push(queue(() =>
      makeRequest(proxy, logger)
    ));
  }

  await Promise.all(promises);
  return;
};

module.exports = proxyChecker;
