import test from 'node:test';
import assert from 'node:assert/strict';
import { TunnelStore } from '../src/tunnels.js';

test('creates and lists tunnel', () => {
  const store = new TunnelStore('example.com');
  const tunnel = store.create(3000);
  assert.equal(tunnel.localPort, 3000);
  assert.match(tunnel.publicUrl, /^https:\/\//);
  assert.equal(store.list().length, 1);
});

test('deletes tunnel', () => {
  const store = new TunnelStore('example.com');
  const tunnel = store.create(3000);
  assert.equal(store.delete(tunnel.subdomain), true);
  assert.equal(store.delete(tunnel.subdomain), false);
});
