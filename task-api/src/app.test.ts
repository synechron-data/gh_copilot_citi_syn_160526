import { once } from 'node:events';
import type { AddressInfo } from 'node:net';

import { afterEach, describe, expect, it } from 'vitest';

import { createApp } from './app.js';

describe('createApp', () => {
  const activeServers: Array<{ close: () => void }> = [];

  afterEach(() => {
    for (const server of activeServers.splice(0)) {
      server.close();
    }
  });

  it('serves the health endpoint', async () => {
    const app = createApp();
    const server = app.listen(0);

    activeServers.push(server);
    await once(server, 'listening');

    const address = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${address.port}/health`);
    const body = (await response.json()) as { status: string; uptime: number };

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.uptime).toBeGreaterThanOrEqual(0);
  });
});
