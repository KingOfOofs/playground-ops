import Anthropic from '@anthropic-ai/sdk';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3457;

// Load .env manually (no dependency needed)
try {
  const env = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  }
} catch {}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3456');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'POST' && req.url === '/api/generate-mission') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { equipment } = JSON.parse(body);
        const equipmentList = equipment.map(e => `- ${e.name} (id: ${e.id})`).join('\n');

        const message = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 800,
          messages: [{
            role: 'user',
            content: `You are a mission designer for a kids' playground spy game called Playground Ops.
Generate a fun, creative mission for a playground with this equipment:
${equipmentList}

Return ONLY valid JSON (no markdown) matching this exact structure:
{
  "title": "Operation [Cool Name]",
  "startPoint": "brief description of where to start",
  "endPoint": "brief description of where to finish",
  "objectives": [
    { "equipmentId": "equipment-id-here", "instruction": "Action the player should do at this piece of equipment." }
  ]
}

Rules:
- Use 3 to 5 objectives
- Each equipmentId must be one of the ids listed above
- Instructions should be action-oriented and fun for kids aged 6-12
- The mission should have a coherent spy/adventure theme
- startPoint and endPoint should reference actual equipment`
          }]
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(message.content[0].text.trim());
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404); res.end();
});

server.listen(PORT, () => console.log(`Mission API running on http://localhost:${PORT}`));
