const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
app.get('/health', (req, res) => res.json({ status: "backend running" }));
app.get('/', (req, res) => res.send('Realtime Chat Backend'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', ws => {
  console.log('Client connected');
  ws.send(JSON.stringify({ system: 'Welcome', ts: Date.now() }));
  ws.on('message', message => {
    // broadcast to all
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(message);
    });
  });
  ws.on('close', () => console.log('Client disconnected'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Backend listening on', PORT));
