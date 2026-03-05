import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { TunnelStore } from '../src/tunnels.js';
import { createApp } from '../src/server.js';

function makeTempFile(name) {
  return path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'mekong-')), name);
}

test('creates and lists tunnel', () => {
  const store = new TunnelStore({ domain: 'example.com' });
  const tunnel = store.create({ localHost: '127.0.0.1', localPort: 3000 });

import { TunnelStore } from '../src/tunnels.js';

test('creates and lists tunnel', () => {
  const store = new TunnelStore('example.com');
  const tunnel = store.create(3000);
  assert.equal(tunnel.localPort, 3000);
  assert.match(tunnel.publicUrl, /^https:\/\//);
  assert.equal(store.list().length, 1);
});

test('deletes tunnel', () => {
  const store = new TunnelStore({ domain: 'example.com' });
  const tunnel = store.create({ localHost: '127.0.0.1', localPort: 3000 });
  assert.equal(store.delete(tunnel.subdomain), true);
  assert.equal(store.delete(tunnel.subdomain), false);
});

test('persists tunnels to file', () => {
  const file = makeTempFile('tunnels.json');
  const a = new TunnelStore({ domain: 'example.com', dataFile: file });
  const tunnel = a.create({ localHost: '127.0.0.1', localPort: 4000 });

  const b = new TunnelStore({ domain: 'example.com', dataFile: file });
  assert.equal(b.list().length, 1);
  assert.equal(b.get(tunnel.subdomain).localPort, 4000);
});

test('proxy endpoint forwards to local target', async () => {
  const upstream = http.createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, path: req.url }));
  });

  await new Promise((resolve) => upstream.listen(0, resolve));
  const upstreamPort = upstream.address().port;

  const app = createApp({ port: 0, domain: 'example.com', dataFile: makeTempFile('db.json') });
  await new Promise((resolve) => app.listen(resolve));
  const appPort = app.server.address().port;

  const createRes = await fetch(`http://127.0.0.1:${appPort}/tunnels`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ localHost: '127.0.0.1', localPort: upstreamPort })
  });
  assert.equal(createRes.status, 201);
  const tunnel = await createRes.json();

  const proxyRes = await fetch(`http://127.0.0.1:${appPort}/proxy/${tunnel.subdomain}/hello?x=1`);
  assert.equal(proxyRes.status, 200);
  const payload = await proxyRes.json();
  assert.equal(payload.ok, true);
  assert.equal(payload.path, '/hello?x=1');

  await new Promise((resolve) => app.server.close(resolve));
  await new Promise((resolve) => upstream.close(resolve));
});


test('ignores corrupted persistence file gracefully', () => {
  const file = makeTempFile('bad.json');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, '{bad json', 'utf8');

  const store = new TunnelStore({ domain: 'example.com', dataFile: file });
  assert.equal(store.list().length, 0);
});

  const store = new TunnelStore('example.com');
  const tunnel = store.create(3000);
  assert.equal(store.delete(tunnel.subdomain), true);
  assert.equal(store.delete(tunnel.subdomain), false);
});

