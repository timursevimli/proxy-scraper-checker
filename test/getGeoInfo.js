'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { getGeoInfo } = require('../src/lib');

test('Check country codes', () => {
  assert.strictEqual(getGeoInfo('8.8.8.8'), 'US');
  assert.strictEqual(getGeoInfo('14.125.53.231'), 'CN');
  assert.strictEqual(getGeoInfo('212.22.69.50'), 'RU');
  assert.strictEqual(getGeoInfo('31.41.62.123'), 'RU');
  assert.strictEqual(getGeoInfo('193.110.106.48'), 'UA');
  assert.strictEqual(getGeoInfo('176.234.130.223'), 'TR');
});
