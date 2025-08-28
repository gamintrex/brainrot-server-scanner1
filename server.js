// server.js
const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const REPORT_SECRET = process.env.REPORT_SECRET || 'changeme';
const servers = new Map();

// Accept reports from the game
app.post('/report', (req, res) => {
  if (req.headers['x-api-key'] !== REPORT_SECRET) return res.status(401).json({error:'unauthorized'});
  const { jobId, placeId, brainrots, ts } = req.body;
  if (!jobId) return res.status(400).json({error:'missing jobId'});
  servers.set(jobId, { placeId, brainrots: brainrots || [], ts: ts || Date.now() });
  return res.json({ok:true});
});

// Query which servers have the target brainrots
app.get('/search', (req, res) => {
  const q = (req.query.brainrots || '').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
  if (!q.length) return res.status(400).json({error:'need brainrots query'});
  const now = Date.now();
  const hits = [];
  for (const [jobId, data] of servers.entries()) {
    if (now - (data.ts || 0) > 1000*60*6) continue; // skip stale reports
    const names = (data.brainrots || []).map(x=>String(x).toLowerCase());
    if (q.some(t => names.includes(t))) {
      hits.push({ jobId, placeId: data.placeId, brainrots: data.brainrots, ts: data.ts });
    }
  }
  return res.json({ hits });
});

app.listen(PORT, ()=>console.log('Reporter backend running on port', PORT));
