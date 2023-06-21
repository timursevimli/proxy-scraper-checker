'use strict';

const net = require('node:net');
const { getGeoInfo, getDuration } = require('../utils/');

const checkSocks4 = (proxy, cb) => {
  const socket = new net.Socket();
  const [host, port] = proxy.split(':');
  const nPort = parseInt(port);
  const timeout = 10000;

  const socks4Handshake = Buffer.from([
    0x04, // Version SOCKS4
    0x01, // Command CONNECT
    nPort >> 8, nPort & 0xff, // Port divided 2 Byte
    0x00, 0x00, 0x00, 0x01, // ipAdress - 0.0.0.1
    0x00 // UserId (empyt)
  ]);

  const connectionTimeout = setTimeout(() => {
    socket.destroy();
    const err = new Error('Socks4 connection timed out!');
    cb(err);
  }, timeout - 1);

  const begin = getDuration();

  socket.connect(nPort, host, () => {
    clearTimeout(connectionTimeout);
    socket.write(socks4Handshake);
  });

  socket.on('data', (data) => {
    const [version, status] = data;
    if (version === 0x00 && status === 0x5a) {
      const duration = getDuration(begin);
      getGeoInfo(proxy)
        .then(
          (res) => {
            res.duration = duration;
            cb(null, res);
          },
          (reason) => cb(reason)
        )
        .catch((err) => cb(err));
    } else {
      const err = 'Socks4 connection failed!';
      cb(err);
    }
    socket.end();
  });

  socket.on('error', (err) => {
    socket.end();
    cb(err);
  });
};

module.exports = checkSocks4;
