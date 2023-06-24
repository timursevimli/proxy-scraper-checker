'use strict';

module.exports = (proxy) => {
  const ipPort = proxy.split(':');
  if (ipPort.length !== 2) return false;
  const [ip, port] = ipPort;
  if (ip.length > 19 || ip.length < 7) return false;
  if (port.length > 5 || port.length < 1) return false;
  const octets = ip.split('.');
  if (octets.length !== 4) return false;
  for (const octet of octets) {
    const intOctet = parseInt(octet);
    if (isNaN(intOctet) || intOctet > 255 || intOctet < 0) {
      return false;
    }
  }
  const intPort = parseInt(port);
  if (isNaN(intPort) || intPort > 65535 || intPort < 0) {
    return false;
  }
  return true;
};
