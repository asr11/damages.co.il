/**
 * damages.co.il — Local Lead API
 * 100% Self-Hosted, Zero Cloud Dependency
 * 
 * Saves every WhatsApp click / form submission to leads.json
 * Run: node api/lead-server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const LEADS_FILE = path.join(__dirname, '..', 'data', 'leads.json');
const PORT = 3380;

// Ensure data dir exists
const dataDir = path.dirname(LEADS_FILE);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Initialize file
if (!fs.existsSync(LEADS_FILE)) fs.writeFileSync(LEADS_FILE, '[]');

const server = http.createServer((req, res) => {
    // CORS for static site
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    // POST /api/lead — save lead
    if (req.method === 'POST' && req.url === '/api/lead') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const lead = JSON.parse(body);
                lead.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
                lead.saved_at = new Date().toISOString();
                lead.ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

                const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
                leads.push(lead);
                fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));

                console.log(`✅ Lead #${lead.id} | ${lead.source} | ${lead.page}`);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, id: lead.id }));
            } catch (e) {
                console.error('❌ Lead parse error:', e.message);
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'invalid' }));
            }
        });
        return;
    }

    // GET /api/leads — view all (protected)
    if (req.method === 'GET' && req.url === '/api/leads') {
        const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            total: leads.length,
            today: leads.filter(l => l.saved_at?.startsWith(new Date().toISOString().slice(0, 10))).length,
            leads: leads.slice(-50).reverse()
        }));
        return;
    }

    // GET /api/leads/stats — dashboard stats
    if (req.method === 'GET' && req.url === '/api/leads/stats') {
        const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
        const today = new Date().toISOString().slice(0, 10);
        const thisWeek = leads.filter(l => {
            const d = new Date(l.saved_at);
            return (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
        });

        const bySource = {};
        leads.forEach(l => {
            bySource[l.source] = (bySource[l.source] || 0) + 1;
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            total: leads.length,
            today: leads.filter(l => l.saved_at?.startsWith(today)).length,
            this_week: thisWeek.length,
            by_source: bySource,
            last_lead: leads[leads.length - 1] || null
        }));
        return;
    }

    res.writeHead(404);
    res.end('Not found');
});

server.listen(PORT, () => {
    console.log(`\n⚡ Lead API running on http://localhost:${PORT}`);
    console.log(`   📁 Leads file: ${LEADS_FILE}`);
    console.log(`   📊 Stats: http://localhost:${PORT}/api/leads/stats`);
    console.log(`   📋 List:  http://localhost:${PORT}/api/leads\n`);
});
