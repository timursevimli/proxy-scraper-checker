'use strict';

const fs = require('node:fs');
const path = require('node:path');

module.exports = (file) => new Promise((resolve) => {
  let chunks = '';
  const basename = path.basename(file, '.log');
  const dir = path.dirname(file);
  const jsonFile = basename + '.json';
  const rs = fs.createReadStream(file, 'utf8');
  const ws = fs.createWriteStream(path.join(dir, jsonFile));
  ws.on('close', resolve);
  rs.on('data', (chunk) => void (chunks += chunk));
  rs.on('end', () => {
    const lines = chunks.split('\n');
    const proxyData = lines
      .filter((line) => !!line)
      .map((line) => line.split('\t')[1]);
    for (const proxy of proxyData) {
      const [protocol, ipPort, country, delay] = proxy.trim().split(' ');
      const [ip, port] = ipPort.split(':');
      const res = { protocol, ip, port, country, delay };
      ws.write(JSON.stringify(res) + '\n');
    }
    ws.close();
  });
});
