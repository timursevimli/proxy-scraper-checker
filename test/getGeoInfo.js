'use strict';

const test = require('node:test');
const assert = require('node:assert');
const geoGeoInfo = require('../src/utils/getGeoInfo.js');

test('Check country codes', () => {
  assert.strictEqual(geoGeoInfo('8.8.8.8'), 'US');
  assert.strictEqual(geoGeoInfo('14.125.53.231'), 'CN');
  assert.strictEqual(geoGeoInfo('212.22.69.50'), 'RU');
  assert.strictEqual(geoGeoInfo('31.41.62.123'), 'RU');
  assert.strictEqual(geoGeoInfo('193.110.106.48'), 'UA');
  assert.strictEqual(geoGeoInfo('176.234.130.223'), 'TR');
});
