'use strict';

const fs = require('node:fs');
const path = require('node:path');

const sourcesPath = path.join(process.cwd(), './sources/');

const getSourceSync = (file) => {
  const filePath = path.join(sourcesPath, file);
  const data = fs.readFileSync(filePath, 'utf8');
  const lines = data.split('\n').filter((line) => !!line);
  return lines;
};

module.exports = { getSourceSync };
