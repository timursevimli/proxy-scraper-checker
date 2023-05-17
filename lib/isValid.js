'use strict';
module.exports = (s) => {
  const parts = s.split(':');
  if (parts.length !== 2) {
    return false;
  }
  const ipAddress = parts[0];
  const ipParts = ipAddress.split('.');
  if (ipParts.length !== 4) {
    return false;
  }
  for (const part of ipParts) {
    const num = Number(part);
    if (isNaN(num) || num < 0 || num > 255) {
      return false;
    }
  }
  const port = Number(parts[1]);
  if (isNaN(port) || port < 1 || port > 65535) {
    return false;
  }
  return true;
};
