import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { generateSubdomain, isValidSubdomain } from './domain.js';

function normalizeDomain(domain) {
  return String(domain || 'localhost')
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');
}

export class TunnelStore {
  constructor({ domain, dataFile } = {}) {
    this.domain = normalizeDomain(domain);
    this.dataFile = dataFile;
    this.tunnels = new Map();

    if (this.dataFile) {
      this.load();
    }
  }

  load() {
    if (!fs.existsSync(this.dataFile)) return;

    const raw = fs.readFileSync(this.dataFile, 'utf8');
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed.tunnels)) return;

    for (const tunnel of parsed.tunnels) {
      if (!tunnel?.subdomain || !isValidSubdomain(tunnel.subdomain)) continue;
      this.tunnels.set(tunnel.subdomain, tunnel);
    }
  }

  save() {
    if (!this.dataFile) return;

    fs.mkdirSync(path.dirname(this.dataFile), { recursive: true });
    fs.writeFileSync(
      this.dataFile,
      JSON.stringify({ tunnels: this.list() }, null, 2),
      'utf8'
    );
  }

  create({ localPort, localHost = '127.0.0.1' }) {
    let subdomain = generateSubdomain();
    while (this.tunnels.has(subdomain)) {
      subdomain = generateSubdomain();
    }

    const tunnel = {
      id: crypto.randomUUID(),
      subdomain,
      publicUrl: `https://${subdomain}.${this.domain}`,
      localHost,
      localPort,
      createdAt: new Date().toISOString()
    };

    this.tunnels.set(subdomain, tunnel);
    this.save();
    return tunnel;
  }

  list() {
    return [...this.tunnels.values()];
  }

  get(subdomain) {
    return this.tunnels.get(subdomain);
  }

  delete(subdomain) {
    const deleted = this.tunnels.delete(subdomain);
    if (deleted) this.save();
    return deleted;
  }
}
