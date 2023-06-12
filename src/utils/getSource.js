'use strict';
const fs = require('node:fs');
const path = require('node:path');
const sourcesPath = path.join(__dirname, '..', '../sources/');
module.exports = (file) => {
  const filePath = sourcesPath + file;
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const sources = data.split('\n');
    return sources;
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
