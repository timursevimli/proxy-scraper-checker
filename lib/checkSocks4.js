'use strict';
const net = require('node:net');
const { Queue, getGeoInfo, logger, getDuration } = require('../utilities/');

const logFile = __dirname + '/../logs/checkSocks4.log';
const log = logger(logFile)(JSON.stringify)('ProxyChecker')('checkSocks4');
const infoLog = log('info');
const errorLog = log('error');

module.exports = (proxies, timeout = 10000) =>
  new Promise((resolve) => {
    const queue = Queue.channels(30)
      .timeout(timeout)
      .process((proxy, cb) => {
        const [host, port] = proxy.split(':');
        const socket = new net.Socket();

        const socks4Request = Buffer.from([
          0x04, // Version SOCKS4
          0x01, // Command CONNECT
          port >> 8, port & 0xff, // Port divided 2 Byte
          0x00, 0x00, 0x00, 0x01, // ipAdress - 0.0.0.1
          0x00 // UserId (empyt)
        ]);

        const connectionTimeout = setTimeout(() => {
          socket.destroy();
          const err = 'Socks4 connection timed out!';
          cb(err);
        }, timeout - 1);

        const startTime = getDuration();

        socket.connect(Number(port), host, () => {
          clearTimeout(connectionTimeout);
          socket.write(socks4Request);
        });

        socket.on('data', (data) => {
          const [version, status] = data;
          if (version === 0x00 && status === 0x5a) {
            const duration = startTime();
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
            const err = 'Socks4 proxy is offine!';
            cb(err);
          }
          socket.end();
        });

        socket.on('error', (err) => {
          socket.end();
          cb(err);
        });
      })
      .success((res) => {
        console.log({ res });
        infoLog(res);
      })
      .failure((err) => {
        console.log({ err });
        errorLog(err);
      })
      .drain(() => {
        console.log('CheckSocks4 done!');
        resolve();
      });

    proxies.forEach((proxy) => queue.add(proxy));
  });
