import http from 'node:http';
import { URL, pathToFileURL } from 'node:url';
import { TunnelStore } from './tunnels.js';

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
        req.destroy();
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

function validateLocalTarget(localHost, localPort) {
  const host = String(localHost || '127.0.0.1').trim();
  const port = Number(localPort || 3000);

  if (!/^[a-zA-Z0-9.-]+$/.test(host)) {
    return { ok: false, error: 'localHost contains invalid characters' };
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { ok: false, error: 'localPort must be an integer between 1 and 65535' };
  }

  return { ok: true, host, port };
}

async function proxyRequest(req, res, tunnel, pathname) {
  const targetUrl = new URL(`http://${tunnel.localHost}:${tunnel.localPort}${pathname}`);
  targetUrl.search = new URL(req.url || '/', 'http://localhost').search;

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === 'string' && k.toLowerCase() !== 'host') headers.set(k, v);
  }

  const method = req.method || 'GET';
  const body = method === 'GET' || method === 'HEAD' ? undefined : req;

  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body,
      duplex: body ? 'half' : undefined
    });

    res.writeHead(upstream.status, Object.fromEntries(upstream.headers.entries()));
    if (upstream.body) {
      for await (const chunk of upstream.body) {
        res.write(chunk);
      }
    }
    res.end();
  } catch {
    sendJson(res, 502, {
      error: 'Failed to reach local target',
      target: `${tunnel.localHost}:${tunnel.localPort}`
    });
  }
}

export function createApp({ port = Number(process.env.PORT || 8080), domain = process.env.DOMAIN || 'localhost', dataFile = process.env.DATA_FILE || '.data/tunnels.json' } = {}) {
  const store = new TunnelStore({ domain, dataFile });

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
        const target = validateLocalTarget(body.localHost, body.localPort);
        if (!target.ok) return sendJson(res, 400, { error: target.error });

        const tunnel = store.create({ localHost: target.host, localPort: target.port });
        return sendJson(res, 201, tunnel);
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    if (req.method === 'DELETE' && url.pathname.startsWith('/tunnels/')) {
      const subdomain = decodeURIComponent(url.pathname.replace('/tunnels/', ''));
      if (!subdomain) return sendJson(res, 400, { error: 'missing subdomain' });
      if (!store.delete(subdomain)) return sendJson(res, 404, { error: 'tunnel not found' });
      res.writeHead(204);
      res.end();
      return;
    }

    if (url.pathname.startsWith('/proxy/')) {
      const parts = url.pathname.split('/').filter(Boolean);
      const subdomain = parts[1];
      const rest = `/${parts.slice(2).join('/')}`;
      const tunnel = store.get(subdomain);
      if (!tunnel) return sendJson(res, 404, { error: 'tunnel not found' });
      return proxyRequest(req, res, tunnel, rest === '/' ? '/' : rest);
    }

    return sendJson(res, 404, { error: 'Not found' });
  });

  return {
    server,
    store,
    listen(cb) {
      return server.listen(port, cb);
    }
  };
}

const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  const app = createApp();
  app.listen(() => {
    console.log(`MekongTunnel Node.js server listening on :${process.env.PORT || 8080}`);
  });
}
