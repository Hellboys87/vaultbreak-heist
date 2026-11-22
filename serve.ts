// A pocket static server for trying VAULTBREAK locally: it serves this
// repo's game/ folder (and nothing else) on http://localhost:8080.
// Node standard library only. Run: node serve.ts

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'game');
const port = 8080;

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const wanted = url.pathname === '/' ? '/index.html' : url.pathname;
    const filePath = normalize(join(root, wanted));
    if (!filePath.startsWith(root)) {
      response.writeHead(403).end('forbidden');
      return;
    }
    const body = await readFile(filePath);
    response.writeHead(200, { 'content-type': MIME[extname(filePath)] ?? 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404).end('not found');
  }
});

server.listen(port, () => {
  console.log(`VAULTBREAK is up at http://localhost:${port}`);
});
