'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');

const sourcesPath = path.join(__dirname, '..', '../sources/');

module.exports = async (file) => {
  const filePath = sourcesPath + file;
  let exists;
  try {
    exists = await fs.access(filePath).then(() => true, () => false);
  } catch (err) {
    throw err;
  }
  if (!exists) throw new Error(`File name with ${file} not exist!`);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const sources = data.split('\n');
    return sources;
  } catch (err) {
    throw err;
  }
};
