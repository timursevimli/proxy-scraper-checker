'use strict';

const fs = require('node:fs');
const path = require('node:path');

const SOURCES_PATH = 'sources';

const isExist = async (fileName) => {
  const toBool = [() => true, () => false];
  const exist = await fs.promises.access(fileName).then(...toBool);
  return exist;
};

const getSource = async (fileName) => {
  const filePath = path.join(SOURCES_PATH, fileName);
  const exists = await isExist(filePath);
  if (!exists) return [];
  let datas = '';
  const rs = fs.createReadStream(filePath, 'utf8');
  for await (const chunk of rs) datas += chunk;
  const lines = datas.split('\n').filter((line) => !!line);
  return lines;
};

module.exports = { getSource };
