'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { dateParser, timeParser } = require('./dates.js');

const fileIsExist = filename => {
  const defaultPath = path.join(__dirname, '../..', `/logs/${filename}.log`);
  const isExist = fs.existsSync(defaultPath);
  return isExist;
};

const removeFile = filename => {
  const defaultPath = path.join(__dirname, '../..', `/logs/${filename}.log`);
  fs.unlinkSync(defaultPath);
};

const writeFile = (filename, data) => {
  const defaultPath = path.join(__dirname, '../..', `/logs/${filename}.log`);
  fs.appendFileSync(defaultPath, data + '\n', 'utf8');
};

const createFile = async filename => {
  const defaultPath = path.join(__dirname, '../..', `/logs/${filename}.log`);
  const title = dateParser() + ' | ' + timeParser() + ' | Alesko | https://github.com/Alesko43/proxy-scraper-checker\n\n';
  fs.writeFileSync(defaultPath, title, 'utf8');
};

const saveErrorsToLog = errors => {
  const errorFileName = 'errors';
  const isExist = fileIsExist(errorFileName);

  if (isExist) removeFile(errorFileName);
  createFile(errorFileName);

  for (const key in errors) {
    const value = errors[key];
    const error = 'URL: ' + key + ' | Error: ' + value;
    writeFile(errorFileName, error);
  }
};

const saveAlivesToLog = (ip, port, countryCode) => {
  const aliveFileName = 'alive_proxies';
  const parsedData = `${countryCode} | ${ip}:${port}`;
  writeFile(aliveFileName, parsedData);
};
module.exports = {
  saveErrorsToLog,
  saveAlivesToLog,
  createFile,
  removeFile,
  fileIsExist
};
