'use strict';

const fs = require('node:fs');
const path = require('node:path');

const sourcesPath = path.join(process.cwd(), './sources/');

const isExist = async (file) => {
  const toBool = [() => true, () => false];
  const exist = await fs.promises.access(file).then(...toBool);
  return exist;
};

module.exports = async (file) => {
  const filePath = path.join(sourcesPath, file);
  const exists = await isExist(filePath);
  if (!exists) throw new Error(`File name with ${file} not exist!`);
  let datas = '';
  const rs = fs.createReadStream(filePath, 'utf8');
  rs.on('data', (chunk) => void (datas += chunk));
  return new Promise((resolve) => {
    rs.on('end', () => void resolve(datas.split('\n')));
  });
};
