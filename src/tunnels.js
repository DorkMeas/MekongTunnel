import crypto from 'node:crypto';
import { generateSubdomain } from './domain.js';

export class TunnelStore {
  constructor(domain) {
    this.domain = domain;
    this.tunnels = new Map();
  }

  create(localPort) {
    let subdomain = generateSubdomain();
    while (this.tunnels.has(subdomain)) {
      subdomain = generateSubdomain();
    }

    const tunnel = {
      id: crypto.randomUUID(),
      subdomain,
      publicUrl: `https://${subdomain}.${this.domain}`,
      localPort,
      createdAt: new Date().toISOString()
    };
    this.tunnels.set(subdomain, tunnel);
    return tunnel;
  }

  list() {
    return [...this.tunnels.values()];
  }

  delete(subdomain) {
    return this.tunnels.delete(subdomain);
  }
}
