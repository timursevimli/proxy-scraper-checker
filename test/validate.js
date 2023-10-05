'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { validate } = require('../src/lib');

test('Valid IP:Port formats', () => {
  assert.strictEqual(validate('127.0.0.1:8080'), true);
  assert.strictEqual(validate('192.168.1.1:12345'), true);
  assert.strictEqual(validate('10.0.0.1:80'), true);
  assert.strictEqual(validate('0.0.0.0:0'), true);
});

test('Invalid IP:Port formats', () => {
  assert.strictEqual(validate(''), false);
  assert.strictEqual(validate('192.168.1.1'), false);
  assert.strictEqual(validate('192.168.1.1:'), false);
  assert.strictEqual(validate('192.168.1.1:abc'), false);
  assert.strictEqual(validate('192.168.1.1:123456'), false);
  assert.strictEqual(validate('192.168.1.1.1:8080'), false);
  assert.strictEqual(validate('192.168.1:8080'), false);
  assert.strictEqual(validate('192.168.1.1.1:8080:'), false);
  assert.strictEqual(validate('192.168.1.1:8080:123'), false);
  assert.strictEqual(validate('192.168.1.1:8080:123:'), false);
});

test('Edge cases', () => {
  assert.strictEqual(validate('127.0.0.1:0'), true);
  assert.strictEqual(validate('127.0.0.1:65535'), true);
  assert.strictEqual(validate('127.0.0.1:65536'), false);
  assert.strictEqual(validate('192.168.1.1:123456789'), false);
  assert.strictEqual(validate('255.255.255.255:12345'), true);
});
