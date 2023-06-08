'use strict';
const test = require('node:test');
const assert = require('node:assert');
const validateProxy = require('../src/utilities/validateProxy.js');

test('Valid IP:Port formats', () => {
  assert.strictEqual(validateProxy('127.0.0.1:8080'), true);
  assert.strictEqual(validateProxy('192.168.1.1:12345'), true);
  assert.strictEqual(validateProxy('10.0.0.1:80'), true);
});

test('Invalid IP:Port formats', () => {
  assert.strictEqual(validateProxy(''), false);
  assert.strictEqual(validateProxy('192.168.1.1'), false);
  assert.strictEqual(validateProxy('192.168.1.1:'), false);
  assert.strictEqual(validateProxy('192.168.1.1:abc'), false);
  assert.strictEqual(validateProxy('192.168.1.1:123456'), false);
  assert.strictEqual(validateProxy('192.168.1.1.1:8080'), false);
  assert.strictEqual(validateProxy('192.168.1:8080'), false);
  assert.strictEqual(validateProxy('192.168.1.1.1:8080:'), false);
  assert.strictEqual(validateProxy('192.168.1.1:8080:123'), false);
  assert.strictEqual(validateProxy('192.168.1.1:8080:123:'), false);
});

test('Edge cases', () => {
  assert.strictEqual(validateProxy('127.0.0.1:0'), true);
  assert.strictEqual(validateProxy('127.0.0.1:65535'), true);
  assert.strictEqual(validateProxy('127.0.0.1:65536'), false);
  assert.strictEqual(validateProxy('192.168.1.1:123456789'), false);
  assert.strictEqual(validateProxy('255.255.255.255:12345'), true);
});
