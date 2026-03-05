import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSubdomain, isValidSubdomain } from '../src/domain.js';

test('generateSubdomain returns valid format', () => {
  const value = generateSubdomain();
  assert.equal(isValidSubdomain(value), true);
});

test('generateSubdomain is unique in small sample', () => {
  const seen = new Set();
  for (let i = 0; i < 100; i += 1) {
    const value = generateSubdomain();
    assert.equal(seen.has(value), false);
    seen.add(value);
  }
});

test('isValidSubdomain handles valid and invalid values', () => {
  assert.equal(isValidSubdomain('happy-tiger-abcdef01'), true);
  assert.equal(isValidSubdomain('bold-ocean-12345678'), true);

  assert.equal(isValidSubdomain(''), false);
  assert.equal(isValidSubdomain('happytigerabcdef01'), false);
  assert.equal(isValidSubdomain('happy-tiger'), false);
  assert.equal(isValidSubdomain('happy-tiger-abcd-ef01'), false);
  assert.equal(isValidSubdomain('bogus-tiger-abcdef01'), false);
  assert.equal(isValidSubdomain('happy-bogus-abcdef01'), false);
  assert.equal(isValidSubdomain('happy-tiger-abcdef0'), false);
  assert.equal(isValidSubdomain('happy-tiger-abcdef012'), false);
  assert.equal(isValidSubdomain('happy-tiger-ABCDEF01'), false);
  assert.equal(isValidSubdomain('happy-tiger-ghijklmn'), false);
});
