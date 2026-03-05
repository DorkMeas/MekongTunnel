import http from 'node:http';
import { generateSubdomain, isValidSubdomain } from './domain.js';

const port = Number(process.env.PORT || 8080);

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method === 'POST' && req.url === '/tunnels') {
    const subdomain = generateSubdomain();
    res.writeHead(201, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ subdomain, valid: isValidSubdomain(subdomain) }));
    return;
  }

  res.writeHead(404, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(port, () => {
  console.log(`mekongtunnel-nodejs listening on :${port}`);
});
