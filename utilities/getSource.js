'use strict';
const fs = require('node:fs');
const path = require('node:path');
const sourcesPath = path.join(__dirname, '..', 'sources/');
module.exports = (file) => {
  const filePath = sourcesPath + file;
  try {
    const chunk = fs.readFileSync(filePath, 'utf8');
    const sources = chunk.split('\n');
    return sources;
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
