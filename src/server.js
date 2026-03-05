import http from 'node:http';
import { URL } from 'node:url';
import { TunnelStore } from './tunnels.js';

const port = Number(process.env.PORT || 8080);
const domain = process.env.DOMAIN || 'localhost';
const store = new TunnelStore(domain);

function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    return sendJson(res, 200, { ok: true, runtime: 'nodejs' });
  }

  if (req.method === 'GET' && url.pathname === '/tunnels') {
    return sendJson(res, 200, { tunnels: store.list() });
  }

  if (req.method === 'POST' && url.pathname === '/tunnels') {
    try {
      const body = await parseBody(req);
      const localPort = Number(body.localPort || 3000);
      if (!Number.isInteger(localPort) || localPort < 1 || localPort > 65535) {
        return sendJson(res, 400, { error: 'localPort must be an integer between 1 and 65535' });
      }
      return sendJson(res, 201, store.create(localPort));
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  if (req.method === 'DELETE' && url.pathname.startsWith('/tunnels/')) {
    const subdomain = decodeURIComponent(url.pathname.replace('/tunnels/', ''));
    if (!subdomain) return sendJson(res, 400, { error: 'missing subdomain' });
    if (!store.delete(subdomain)) return sendJson(res, 404, { error: 'tunnel not found' });
    return sendJson(res, 204, {});
  }

  return sendJson(res, 404, { error: 'Not found' });
});

server.listen(port, () => {
  console.log(`MekongTunnel Node.js server listening on :${port}`);
});
