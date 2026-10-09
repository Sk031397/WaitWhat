import http from 'node:http';
import { handler } from './handler';

/**
 * Local dev server for the SideKick /ask endpoint. Wraps the Lambda handler
 * so you can test end-to-end against real Bedrock (with AWS creds in your
 * shell) or exercise the seeded fallback offline.
 *
 *   npm run dev        # starts on http://localhost:3000/ask
 *
 * Point the app at it with setAskEndpoint('http://<your-ip>:3000/ask').
 */
const PORT = Number(process.env.PORT ?? 3000);

const server = http.createServer((reqHttp, res) => {
  if (reqHttp.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    });
    res.end();
    return;
  }

  if (reqHttp.method !== 'POST' || !reqHttp.url?.endsWith('/ask')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found. POST /ask' }));
    return;
  }

  let body = '';
  reqHttp.on('data', (chunk) => (body += chunk));
  reqHttp.on('end', async () => {
    const result = await handler({ body });
    res.writeHead(result.statusCode, result.headers);
    res.end(result.body);
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`SideKick /ask dev server listening on http://localhost:${PORT}/ask`);
});
