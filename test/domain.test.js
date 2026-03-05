import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSubdomain, isValidSubdomain } from '../src/domain.js';

test('generated subdomain is valid', () => {
  assert.equal(isValidSubdomain(generateSubdomain()), true);
});

test('validator accepts and rejects expected values', () => {
  assert.equal(isValidSubdomain('happy-tiger-abcdef01'), true);
  assert.equal(isValidSubdomain('happy-tiger-ABCDEF01'), false);
  assert.equal(isValidSubdomain('bad-tiger-abcdef01'), false);
});
