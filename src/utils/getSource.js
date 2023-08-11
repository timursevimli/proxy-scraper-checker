'use strict';

const fsp = require('node:fs/promises');
const path = require('node:path');

const sourcesPath = path.join(__dirname, '..', '../sources/');

module.exports = async (file) => {
  const filePath = path.join(sourcesPath, file);
  const exists = await fsp.access(filePath).then(
    () => true,
    () => false,
  );
  if (!exists) throw new Error(`File name with ${file} not exist!`);
  const data = await fsp.readFile(filePath, 'utf8');
  const sources = data.split('\n');
  return sources;
};
