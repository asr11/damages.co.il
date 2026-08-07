/**
 * Akasha Static Site Generator — Pre-Render .md → .html
 * © HUB האב מערכות מתקדמות בע"מ
 * 
 * Converts Markdown content to pure static HTML pages.
 * Output: Clean URLs with zero JS dependency.
 * 
 * /content/law/comparative-law/code-of-hammurabi.md
 *   → /law/comparative-law/code-of-hammurabi/index.html
 * 
 * URL: damages.co.il/law/comparative-law/code-of-hammurabi
 * No query params. No .md. No /article. Pure iron.
 */

const fs = require('fs');
const path = require('path');
const { getHeaderHTML, getFooterHTML } = require('./layout');

const contentDir = path.join(__dirname, '../public/content');
const outputDir = path.join(__dirname, '../public');
const DOMAIN = 'https://damages.co.il';
const YEAR = '2026';

function scanMd(dir, files = []) {
    if (!fs.existsSync(dir)) return files;
    fs.readdirSync(dir).forEach(f => {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory() && f !== '_index') {
            scanMd(full, files);
        } else if (f.endsWith('.md') && f !== 'README.md') {
            files.push(full);
        }
    });
    return files;
}

function parseFrontmatter(raw) {
    const m = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!m) return { meta: {}, body: raw };
    const meta = {};
    m[1].split('\n').forEach(line => {
        const i = line.indexOf(':');
        if (i > -1) {
            const k = line.substring(0, i).trim();
            const v = line.substring(i + 1).trim().replace(/^"|"$/g, '');
            if (k && v) meta[k] = v;
        }
    });
    return { meta, body: raw.slice(m[0].length).trim() };
}

function mdToHtml(md) {
    return md
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^> (.*$)/gm, '<blockquote><p>$1</p></blockquote>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^\- (.*$)/gm, '<li>$1</li>')
        .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
        .replace(/\|([^\n]+)\|/g, (match) => {
            const cells = match.split('|').filter(c => c.trim());
            if (cells.every(c => c.trim().match(/^[-:]+$/))) return '';
            return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
        })
        .replace(/^---$/gm, '<hr>')
        .replace(/\n\n/g, '</p>\n<p>')
        .replace(/(<li>[\s\S]*?<\/li>(\n)?)+/g, '<ul>$&</ul>')
        .replace(/(<tr>[\s\S]*?<\/tr>(\n)?)+/g, '<table>$&</table>');
}

function buildPage(meta, bodyHtml, slug, allArticles) {
    const title = meta.title_he || meta.title || 'מאמר';
    const desc = meta.description_he || meta.description || '';
    const canonical = `https://damages.co.il/${slug}/`;
    
    // Schema.org JSON-LD
    const schema = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": desc,
        "url": canonical,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonical
        },
        "author": {
            "@type": "Organization",
            "name": "damages.co.il - פורטל הפיצויים והזכויות בנזיקין"
        },
        "publisher": {
            "@type": "Organization",
            "name": "HUB האב מערכות מתקדמות בע\"מ",
            "logo": {
                "@type": "ImageObject",
                "url": "https://damages.co.il/assets/favicon.png"
            }
        },
        "datePublished": meta.created || "2026-08-06",
        "dateModified": meta.updated || "2026-08-06"
    });

    // Breadcrumb Schema
    const slugParts = slug.split('/');
    const breadcrumbItems = [
        { name: 'דף הבית', url: 'https://damages.co.il/' }
    ];
    let breadcrumbPath = '';
    for (let i = 0; i < slugParts.length - 1; i++) {
        breadcrumbPath += slugParts[i] + '/';
        breadcrumbItems.push({ name: slugParts[i], url: `https://damages.co.il/${breadcrumbPath}` });
    }
    breadcrumbItems.push({ name: title, url: canonical });
    const breadcrumbSchema = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems.map((item, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": item.name,
            "item": item.url
        }))
    });

    return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title} | damages.co.il</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="he" href="${canonical}">
<link rel="icon" type="image/png" href="/assets/favicon.png">
<link rel="apple-touch-icon" href="/assets/favicon.png">
<meta name="theme-color" content="#0a0a1e">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="damages.co.il">
<meta property="og:image" content="https://damages.co.il/assets/hero_bg.webp">
<meta property="og:locale" content="he_IL">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
<script type="application/ld+json">${schema}</script>
<script type="application/ld+json">${breadcrumbSchema}</script>
<style>
.article-wrap{max-width:800px;margin:100px auto 60px;padding:40px;background:var(--secondary-bg);border-radius:16px;border:1px solid rgba(212,175,55,.2)}
.article-wrap h1{color:var(--accent-gold);font-size:2.2rem;border-bottom:2px solid var(--accent-gold);padding-bottom:15px}
.article-wrap h2{color:var(--accent-gold);font-size:1.6rem;margin-top:30px}
.article-wrap h3{color:var(--text-light);font-size:1.3rem;margin-top:20px}
.article-wrap p{color:var(--text-muted);line-height:1.8;margin:10px 0}
.article-wrap blockquote{border-right:4px solid var(--accent-gold);padding:10px 20px;margin:20px 0;background:rgba(212,175,55,.05);border-radius:0 8px 8px 0}
.article-wrap blockquote p{color:var(--text-light);font-style:italic}
.article-wrap table{width:100%;border-collapse:collapse;margin:20px 0}
.article-wrap th,.article-wrap td{padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.05);color:var(--text-muted);text-align:right}
.article-wrap th{background:rgba(212,175,55,.15);color:var(--accent-gold)}
.article-wrap ul,.article-wrap ol{color:var(--text-muted);padding-right:20px}
.article-wrap li{margin:8px 0;line-height:1.7}
.article-wrap hr{border:none;border-top:1px solid rgba(255,255,255,.1);margin:30px 0}
.meta-bar{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:25px}
.meta-tag{background:rgba(212,175,55,.1);color:var(--accent-gold);padding:6px 16px;border-radius:20px;font-size:.85rem;text-decoration:none;display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(212,175,55,.2);cursor:pointer;transition:all .2s ease}
.meta-tag:hover{background:rgba(212,175,55,.25);border-color:var(--accent-gold);transform:translateY(-1px);box-shadow:0 4px 12px rgba(212,175,55,.15)}
.back-link{display:inline-flex;align-items:center;gap:8px;color:var(--accent-gold);margin-bottom:20px;font-weight:600;text-decoration:none}
.back-link:hover{text-decoration:underline}
.copy-footer{text-align:center;color:var(--text-muted);font-size:.85rem;margin-top:30px;padding-top:20px;border-top:1px solid rgba(255,255,255,.05)}
</style>
</head>
${getHeaderHTML('articles')}
<main class="article-wrap">
<a href="/" class="back-link">→ חזרה לדף הבית</a>
<div class="meta-bar">
${(() => {
    // Build smart links for meta-tags — link to related article in same category/sefira
    const tags = [];
    const findByCategory = (cat) => {
        if (!cat || !allArticles) return '/#knowledge';
        const match = allArticles.find(a => (a.meta.category === cat) && a.rel !== slug);
        return match ? `/${match.rel}/` : '/#knowledge';
    };
    const findBySefira = (sef) => {
        if (!sef || !allArticles) return '/#knowledge';
        const match = allArticles.find(a => (a.meta.sefira === sef) && a.rel !== slug);
        return match ? `/${match.rel}/` : '/#knowledge';
    };
    if (meta.sefira) tags.push(`<a href="${findBySefira(meta.sefira)}" class="meta-tag">✨ עיון בהלכות: ${meta.sefira}</a>`);
    if (meta.category) tags.push(`<a href="${findByCategory(meta.category)}" class="meta-tag">📖 מדריך קשור: ${meta.category}</a>`);
    if (meta.era) tags.push(`<a href="${findByCategory(meta.category)}" class="meta-tag">📅 תקדים מעודכן: ${meta.era}</a>`);
    if (meta.source) tags.push(`<a href="${findByCategory(meta.category)}" class="meta-tag">📜 חקיקה ופסיקה: ${meta.source}</a>`);
    return tags.join('\n');
})()}
</div>
${bodyHtml}
<div style="margin-top:40px;padding:25px;background:rgba(212,175,55,0.08);border:1px solid var(--accent-gold);border-radius:14px;text-align:center">
<h3 style="color:var(--accent-gold);margin-bottom:10px;font-size:1.3rem">⚖️ נפגעת באירוע דומה? לרוב מגיע לך פיצוי כספי</h3>
<p style="color:var(--text-light);font-size:0.95rem;margin-bottom:20px">עורכי דין בפורטל עומדים לרשותך לבדיקת זכאות ראשונית ללא התחייבות.</p>
<a href="https://wa.me/972587008133?text=שלום%2C%20קראתי%20את%20המדריך%20ואני%20מעוניין%20בבדיקת%20זכאות." target="_blank" class="btn btn-whatsapp pulse" style="display:inline-flex;align-items:center;gap:10px;padding:12px 30px;border-radius:25px;background:#25D366;color:#0a0a1e;font-weight:800;text-decoration:none;font-size:1.05rem">
💬 בדיקת זכאות חינם בווצאפ עכשיו
</a>
</div>
<div class="copy-footer">© HUB האב מערכות מתקדמות בע"מ — כל הזכויות שמורות</div>
</main>
${getFooterHTML()}

<div id="a11y-panel" class="a11y-panel" role="dialog" aria-label="תפריט נגישות">
<button class="a11y-close" onclick="this.parentElement.classList.remove('open')" aria-label="סגור תפריט נגישות">&times;</button>
<div class="a11y-title">♿ נגישות</div>
<div class="a11y-section">גודל טקסט</div>
<button class="a11y-btn" onclick="toggleA11y(this,'a11y-big-font','a11y-bigger-font')" data-feature="big-font">🔤 הגדלת טקסט</button>
<button class="a11y-btn" onclick="toggleA11y(this,'a11y-bigger-font','a11y-big-font')" data-feature="bigger-font">🔠 טקסט גדול מאוד</button>
<div class="a11y-section">תצוגה</div>
<button class="a11y-btn" onclick="toggleA11y(this,'a11y-high-contrast')" data-feature="contrast">🌓 ניגודיות גבוהה</button>
<button class="a11y-btn" onclick="toggleA11y(this,'a11y-highlight-links')" data-feature="links">🔗 הדגשת קישורים</button>
<button class="a11y-btn" onclick="toggleA11y(this,'a11y-big-cursor')" data-feature="cursor">🖱️ סמן מוגדל</button>
<div class="a11y-section">קריאה</div>
<button class="a11y-btn" onclick="toggleA11y(this,'a11y-reading-guide')" data-feature="guide">📏 סרגל קריאה</button>
<div style="margin-top:25px;padding-top:15px;border-top:1px solid rgba(212,175,55,.15)">
<button class="a11y-btn" onclick="resetA11y()" style="background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.3);color:#ef4444">🔄 איפוס הגדרות</button>
<a href="/accessibility/" class="a11y-btn" style="text-decoration:none;justify-content:center;margin-top:4px">📄 הצהרת נגישות מלאה</a>
</div>
</div>

<button id="a11y-fab" onclick="document.getElementById('a11y-panel').classList.toggle('open')" aria-label="פתח תפריט נגישות" title="נגישות" style="position:fixed;bottom:20px;left:20px;width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,#1a1a3e,#0a0a1e);border:2px solid var(--accent-gold);color:var(--accent-gold);font-size:1.6rem;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:9999;box-shadow:0 4px 20px rgba(212,175,55,.3)">
<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>
</button>

<script>
function toggleA11y(btn, cls, removeCls) {
    if (removeCls) document.body.classList.remove(removeCls);
    document.body.classList.toggle(cls);
    btn.classList.toggle('active');
    saveA11y();
}
function resetA11y() {
    document.body.className = document.body.className.replace(/a11y-[\w-]+/g, '').trim();
    document.querySelectorAll('.a11y-btn.active').forEach(b => b.classList.remove('active'));
    localStorage.removeItem('a11y');
}
function saveA11y() {
    const classes = [...document.body.classList].filter(c => c.startsWith('a11y-'));
    localStorage.setItem('a11y', JSON.stringify(classes));
}
try {
    const saved = JSON.parse(localStorage.getItem('a11y') || '[]');
    saved.forEach(c => document.body.classList.add(c));
} catch(e) {}

function trackLead(source, extra) {
    const lead = { ts: new Date().toISOString(), source: source || 'unknown', page: location.pathname, referrer: document.referrer || 'direct', extra: extra || null, ua: navigator.userAgent };
    try { navigator.sendBeacon('/api/lead', JSON.stringify(lead)); } catch(e) {
        const leads = JSON.parse(localStorage.getItem('dmg_leads') || '[]'); leads.push(lead); localStorage.setItem('dmg_leads', JSON.stringify(leads));
    }
}
document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href*="wa.me"]');
    if (link) trackLead('whatsapp-click', 'article:${slug}');
});
</script>
<script src="/script.js"></script>
</body>
</html>`;
}

// ── Main ──
console.log('⚡ Akasha SSG — Building static HTML pages...\n');

const files = scanMd(contentDir);

// First pass: collect all articles metadata
const allArticles = files.map(file => {
    const raw = fs.readFileSync(file, 'utf-8');
    const { meta, body } = parseFrontmatter(raw);
    const rel = path.relative(contentDir, file).replace(/\\/g, '/').replace(/\.md$/, '');
    const pillar = rel.split('/')[0]; // law, justice, defense
    return { file, meta, body, rel, pillar };
});

// Second pass: build pages with related articles
let built = 0;
allArticles.forEach(article => {
    const bodyHtml = mdToHtml(article.body);
    
    // Find related articles (same pillar, different article)
    const related = allArticles
        .filter(a => a.pillar === article.pillar && a.rel !== article.rel)
        .slice(0, 4);
    
    // Build related section HTML
    let relatedHtml = '';
    if (related.length > 0) {
        relatedHtml = `
<hr>
<div style="margin-top:30px">
<h3 style="color:var(--accent-gold);margin-bottom:15px">📚 קריאה נוספת</h3>
${related.map(r => `<a href="/${r.rel}/" style="display:block;padding:10px 15px;margin:8px 0;background:rgba(212,175,55,0.05);border-radius:8px;border:1px solid rgba(212,175,55,0.1);text-decoration:none;color:var(--text-muted);transition:all 0.2s">
<strong style="color:var(--text-light)">${r.meta.title_he || r.meta.title}</strong>
<span style="display:block;font-size:0.85rem;margin-top:4px;opacity:0.7">${r.meta.category || ''} | ${r.meta.era || ''}</span>
</a>`).join('\n')}
</div>
<div style="text-align:center;margin-top:30px;padding:20px;background:rgba(212,175,55,0.05);border-radius:12px;border:1px solid rgba(212,175,55,0.15)">
<p style="color:var(--text-light);margin-bottom:12px;font-weight:600">נפגעת? מגיע לך פיצוי.</p>
<a href="https://wa.me/972587008133?text=שלום%2C%20קראתי%20על%20${encodeURIComponent(article.meta.title_he || '')}%20ואני%20מעוניין%20בייעוץ" target="_blank" style="display:inline-block;padding:10px 30px;background:var(--accent-gold);color:#0a0a1e;border-radius:25px;text-decoration:none;font-weight:700">
💬 ייעוץ חינם בווצאפ
</a>
</div>`;
    }
    const outDir = path.join(outputDir, article.rel);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
        path.join(outDir, 'index.html'),
        buildPage(article.meta, bodyHtml + relatedHtml, article.rel, allArticles)
    );
    
    built++;
    console.log(`   ✅ /${article.rel}/`);
});

// ── Auto-generate /articles/ Blog Category Index Page ──
const blogCardsHtml = allArticles.map(art => {
    const cat = art.meta.category || 'כללי';
    const title = art.meta.title_he || art.meta.title;
    const desc = art.meta.description_he || art.meta.description || '';
    const era = art.meta.era || '2026';
    return `
    <a href="/${art.rel}/" style="text-decoration:none;color:inherit;display:flex" class="blog-card-link">
        <article style="background:var(--secondary-bg);border:1px solid rgba(212,175,55,0.2);border-radius:14px;padding:24px;display:flex;flex-direction:column;justify-content:space-between;width:100%;transition:all 0.2s ease" class="blog-card">
            <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                    <span style="background:rgba(212,175,55,0.15);color:var(--accent-gold);padding:4px 12px;border-radius:15px;font-size:0.8rem;font-weight:700">${cat}</span>
                    <span style="font-size:0.75rem;color:var(--text-muted)">📅 ${era}</span>
                </div>
                <h3 style="margin:0 0 10px 0;font-size:1.25rem;color:white">${title}</h3>
                <p style="margin:0 0 15px 0;font-size:0.9rem;color:var(--text-muted);line-height:1.6">${desc.substring(0, 110)}...</p>
            </div>
            <span style="color:var(--accent-gold);font-weight:700;font-size:0.9rem">קרא את המדריך המלא ←</span>
        </article>
    </a>`;
}).join('\n');

const blogIndexHtml = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>אינדקס מדריכים ומאמרים משפטיים | damages.co.il</title>
<meta name="description" content="מאגר המאמרים, המדריכים והפסיקות המקיף בישראל בתחומי הנזיקין, תאונות דרכים, רשלנות רפואית ותביעות ביטוח.">
<link rel="canonical" href="${DOMAIN}/articles/">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
</head>
<body>
<header class="main-header">
<div class="container" style="display:flex;align-items:center;justify-content:space-between">
<div class="header-left" style="display:flex;align-items:center">
<a href="/" class="logo" style="display:flex;flex-direction:column;align-items:flex-start;text-decoration:none;color:inherit">
<div style="font-size:1.8rem;font-weight:800;margin:0">damages<span style="color:var(--accent-gold)">.co.il</span></div>
<span style="font-size:.8rem;color:var(--accent-gold);font-weight:600;margin-top:-3px">פורטל הנזיקין והפיצויים מס' 1 בישראל</span>
</a>
</div>

<div class="header-center" style="flex:1;max-width:350px;margin:0 20px;display:none;position:relative" id="desktop-search">
<div class="search-bar" style="position:relative;width:100%">
<input type="text" id="searchInput" placeholder="חפש פסיקות, מאמרים או שאלות..." autocomplete="off" style="width:100%;padding:10px 40px 10px 15px;border-radius:20px;border:1px solid rgba(255,255,255,0.2);background:rgba(0,0,0,0.3);color:white;font-family:inherit;font-size:0.9rem;transition:var(--transition-fast)">
<svg style="position:absolute;right:12px;top:50%;transform:translateY(-50%);width:18px;height:18px;fill:var(--text-muted)" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
</div>
<div id="searchResults" style="display:none;position:absolute;top:45px;right:0;left:0;background:var(--secondary-bg);border-radius:8px;border:1px solid var(--accent-gold);max-height:300px;overflow-y:auto;z-index:1001;box-shadow:0 10px 25px rgba(0,0,0,0.5)"></div>
</div>

<nav class="nav-links">
<div style="display:inline-flex;background:rgba(255,255,255,0.08);border-radius:20px;padding:2px;border:1px solid rgba(212,175,55,0.3);font-size:0.8rem;margin-left:10px">
<span style="background:var(--accent-gold);color:#0a0a1e;border-radius:16px;padding:3px 10px;font-weight:800;cursor:default">👤 Human</span>
<a href="/llms.txt" target="_blank" style="color:var(--text-muted);text-decoration:none;padding:3px 10px;display:inline-block;font-weight:700">🤖 Machine</a>
</div>
<a href="/articles/" style="color:var(--accent-gold);font-weight:700">📚 כל המאמרים</a>
<a href="/">דף הבית</a>
<a href="/#calculator">מחשבון פיצויים</a>
<a href="https://wa.me/972587008133" target="_blank" class="btn btn-whatsapp" style="padding:6px 16px;font-size:1rem;border-radius:20px">חירום 24/7</a>
</nav>
</div>
</header>

<main style="max-width:1100px;margin:100px auto 60px;padding:0 20px" role="main">
<div style="text-align:center;margin-bottom:40px">
<h1 style="color:var(--accent-gold);font-size:2.4rem;margin-bottom:10px">📚 מאגר המדריכים והמאמרים המשפטיים</h1>
<p style="color:var(--text-muted);font-size:1.1rem">כל הפסיקות, החוקים והזכויות בתחומי הנזיקין והפיצויים בישראל</p>
</div>

<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:24px">
${blogCardsHtml}
</div>
</main>

<footer class="main-footer" style="border-top:1px solid rgba(212,175,55,.1);padding:30px 0;background:var(--secondary-bg)">
<div class="container" style="text-align:center;font-size:.85rem;color:var(--text-muted)">
<div><a href="/privacy/" style="color:var(--accent-gold);margin:0 10px">מדיניות פרטיות</a> | <a href="/terms/" style="color:var(--accent-gold);margin:0 10px">תנאי שימוש</a> | <a href="/accessibility/" style="color:var(--accent-gold);margin:0 10px">הצהרת נגישות</a></div>
<p style="margin-top:10px">© ${YEAR} HUB האב מערכות מתקדמות בע"מ — כל הזכויות שמורות</p>
</div>
</footer>
<script src="/script.js"></script>
</body>
</html>`;

const articlesIndexDir = path.join(outputDir, 'articles');
fs.mkdirSync(articlesIndexDir, { recursive: true });
fs.writeFileSync(path.join(articlesIndexDir, 'index.html'), blogIndexHtml);
console.log('   ✅ /articles/ — generated blog index page');

console.log(`\n⚡ Built ${built} static HTML pages with cross-links. Pure iron.`);

// ── Auto-generate sitemap.xml ──
const today = new Date().toISOString().split('T')[0];
const sitemapEntries = [
    { loc: '/', freq: 'weekly', priority: '1.0' },
    { loc: '/articles/', freq: 'weekly', priority: '0.9' },
    { loc: '/forms/', freq: 'weekly', priority: '0.9' },
    { loc: '/lawyers/', freq: 'weekly', priority: '0.9' },
    { loc: '/lawyer/login.html', freq: 'monthly', priority: '0.5' },
    ...allArticles.map(a => ({
        loc: `/${a.rel}/`,
        freq: a.pillar === 'defense' && a.rel.includes('live-rulings') ? 'weekly' : 'monthly',
        priority: a.rel.includes('car-accidents') || a.rel.includes('medical-malpractice') ? '0.85' : (a.pillar === 'justice' ? '0.8' : '0.7')
    })),
    { loc: '/privacy/', freq: 'yearly', priority: '0.3' },
    { loc: '/terms/', freq: 'yearly', priority: '0.3' },
    { loc: '/accessibility/', freq: 'yearly', priority: '0.3' },
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map(e => `  <url>
    <loc>https://damages.co.il${e.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.freq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemapXml);
console.log(`   🗺️  sitemap.xml — ${sitemapEntries.length} URLs`);

// ── Auto-generate robots.txt ──
const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://damages.co.il/sitemap.xml

# Akasha Vault — ${allArticles.length} articles indexed
# Auto-generated ${today}
# © HUB האב מערכות מתקדמות בע"מ
`;
fs.writeFileSync(path.join(outputDir, 'robots.txt'), robotsTxt);
console.log(`   🤖 robots.txt — updated`);

// ── Auto-generate llms.txt and llms-full.txt for Machine/AI View ──
const llmsTxtContent = `# damages.co.il — הקרן והמאגר הלאומי לדיני נזיקין ופיצויים בישראל
> המאגר הסטטי והמקיף בישראל לתקדימים, חוקים, פסיקות ומחשבוני פיצויים בתחומי הנזיקין, תאונות דרכים, רשלנות רפואית ותביעות ביטוח.

## עמודי הליבה (Core Pages)
- [דף הבית והמחשבון](https://damages.co.il/): מחשבון משוער לפיצויים ותחומי התמחות.
- [מאגר המאמרים והבלוג](https://damages.co.il/articles/): אינדקס מקיף של כל המדריכים והפסיקות.
- [הנחיות מלאות למכונות ול-LLMs](https://damages.co.il/llms-full.txt): הטקסט המלא של כל המאמרים בפורמט Markdown נקי.

## עמודי מפתחות ומשאבים
- [מרכז הטפסים המשפטיים הרשמיים](https://damages.co.il/forms/): טפסים להורדה ואישורים רשמיים בתאונות דרכים, עבודה וביטוח לאומי.
- [אינדקס עורכי הדין המומחים בנזיקין](https://damages.co.il/lawyers/): נבחרת עורכי הדין המאומתים בתחומי הנזיקין והפיצויים.
- [פורטל עורכי דין שותפים](https://damages.co.il/lawyer/login.html): אזור התחברות ופרסום מאמרים תחת שם עוה"ד.

## מאמרים ומדריכים משפטיים (Articles Archive)
${allArticles.map(a => `- [${a.meta.title_he || a.meta.title}](https://damages.co.il/${a.rel}/): ${a.meta.description_he || a.meta.description || ''}`).join('\n')}

## פרטי ליצירת קשר וייעוץ
- ווצאפ חירום 24/7: https://wa.me/972587008133
- בעלים ומפעילים: HUB האב מערכות מתקדמות בע"מ
`;
fs.writeFileSync(path.join(outputDir, 'llms.txt'), llmsTxtContent);
console.log(`   🤖 llms.txt — generated for AI agents`);

const llmsFullTxtContent = allArticles.map(a => `---
Title: ${a.meta.title_he || a.meta.title}
URL: https://damages.co.il/${a.rel}/
Category: ${a.meta.category || ''}
Source: ${a.meta.source || ''}
Era: ${a.meta.era || ''}
---

${a.rawBody}
`).join('\n\n========================================\n\n');

fs.writeFileSync(path.join(outputDir, 'llms-full.txt'), llmsFullTxtContent);
console.log(`   🤖 llms-full.txt — generated (${allArticles.length} full Markdown documents)`);

// ── Auto-generate legal pages ──
const MONTH_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'][new Date().getMonth()];
const UPDATED = `${MONTH_HE} ${YEAR}`;

function legalShell(title, desc, canonical, bodyHtml) {
    return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title} | damages.co.il</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${DOMAIN}${canonical}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
<style>
.legal-wrap{max-width:800px;margin:100px auto 60px;padding:40px;background:var(--secondary-bg);border-radius:16px;border:1px solid rgba(212,175,55,.2)}
.legal-wrap h1{color:var(--accent-gold);font-size:2rem;border-bottom:2px solid var(--accent-gold);padding-bottom:15px;margin-bottom:25px}
.legal-wrap h2{color:var(--accent-gold);font-size:1.4rem;margin-top:30px}
.legal-wrap p,.legal-wrap li{color:var(--text-muted);line-height:1.8;margin:10px 0}
.legal-wrap ul{padding-right:20px}
.legal-wrap li{margin:8px 0}
.legal-wrap strong{color:var(--text-light)}
.legal-meta{font-size:.85rem;color:var(--text-muted);opacity:.7;margin-bottom:20px}
.check-item{display:flex;align-items:flex-start;gap:10px;margin:12px 0}
.check-icon{color:#4caf50;font-size:1.2rem;min-width:24px}
</style>
</head>
<body>
<header class="main-header">
<div class="container">
<a href="/" style="text-decoration:none;color:inherit"><h1 style="margin:0;font-size:1.8rem">damages<span style="color:var(--accent-gold)">.co.il</span></h1></a>
<nav class="nav-links">
<a href="/">דף הבית</a>
<a href="https://wa.me/972587008133" target="_blank" class="btn btn-whatsapp" style="padding:6px 16px;font-size:1rem;border-radius:20px">חירום 24/7</a>
</nav>
</div>
</header>
<main class="legal-wrap" role="main">
<a href="/" style="color:var(--accent-gold);text-decoration:none;font-weight:600">→ חזרה לדף הבית</a>
${bodyHtml}
<div style="margin-top:30px;text-align:center;font-size:.85rem;color:var(--text-muted);opacity:.7">© ${YEAR} HUB האב מערכות מתקדמות בע"מ — כל הזכויות שמורות</div>
</main>
<footer class="main-footer"><p>© HUB האב מערכות מתקדמות בע"מ — כל הזכויות שמורות</p></footer>
</body>
</html>`;
}

// Privacy Policy
const privacyBody = `
<h1>מדיניות פרטיות</h1>
<p class="legal-meta">עדכון אחרון: ${UPDATED} | חל על: damages.co.il ושירותיו</p>
<h2>1. מבוא</h2>
<p>אתר damages.co.il (להלן: <strong>"האתר"</strong>) מופעל על ידי <strong>HUB האב מערכות מתקדמות בע"מ</strong>. אנו מחויבים להגנה על פרטיותך בהתאם לחוק הגנת הפרטיות, התשמ"א-1981, תקנות הגנת הפרטיות (אבטחת מידע), התשע"ז-2017, ורגולציה בינלאומית כולל ה-GDPR.</p>
<h2>2. מידע שאנו אוספים</h2>
<ul>
<li><strong>מידע שנמסר מרצון:</strong> כאשר פונים אלינו בווצאפ, שם ומספר הטלפון נשמרים לצורך מתן שירות.</li>
<li><strong>מידע טכני:</strong> כתובת IP, סוג דפדפן, מערכת הפעלה — לצורכי אבטחה וניתוח תעבורה בלבד.</li>
<li><strong>שימוש במחשבון:</strong> נתוני חישוב הפיצויים מחושבים בדפדפן שלך בלבד ולא נשמרים בשרתים.</li>
</ul>
<h2>3. מטרת עיבוד המידע</h2>
<ul><li>ניתוב פניות למשרד עורכי הדין המתאים</li><li>שיפור חוויית המשתמש</li><li>ניתוח סטטיסטי אגרגטיבי</li><li>מילוי חובות חוקיות</li></ul>
<h2>4. שיתוף מידע</h2>
<p>אנו <strong>לא מוכרים, משכירים או מסחרים</strong> במידע האישי שלך. מידע יועבר לצד שלישי אך ורק למשרד עורכי דין שאליו נותב הטיפול (בהסכמתך), בכפוף לצו בית משפט, או לספקי שירות טכניים.</p>
<h2>5. אבטחת מידע</h2>
<p>אנו נוקטים באמצעי אבטחה מתקדמים כולל הצפנת SSL/TLS, גישה מוגבלת למידע, וניטור שוטף.</p>
<h2>6. עוגיות (Cookies)</h2>
<p>האתר משתמש בעוגיות טכניות חיוניות בלבד. <strong>אין אנו משתמשים בעוגיות מעקב או פרסום.</strong></p>
<h2>7. זכויותיך (חוק הגנת הפרטיות + GDPR)</h2>
<ul><li><strong>עיון:</strong> לדעת אילו נתונים אנו מחזיקים</li><li><strong>תיקון:</strong> לתקן מידע שגוי</li><li><strong>מחיקה:</strong> "הזכות להישכח"</li><li><strong>התנגדות:</strong> להתנגד לעיבוד</li><li><strong>ניידות:</strong> לקבל מידע בפורמט מובנה</li></ul>
<p>לכל בקשה: <a href="https://wa.me/972587008133" style="color:var(--accent-gold)">פנו אלינו בווצאפ</a>.</p>
<h2>8. שמירת מידע</h2>
<p>מידע אישי נשמר לא יותר מ-7 שנים, אלא אם נדרש אחרת על פי חוק.</p>
<h2>9. קטינים</h2>
<p>האתר אינו מיועד מתחת לגיל 18 ללא ליווי מבוגר.</p>
<h2>10. שינויים</h2>
<p>החברה שומרת לעצמה את הזכות לעדכן מדיניות זו. שינויים יפורסמו באתר עם תאריך עדכון.</p>
<h2>11. יצירת קשר</h2>
<p><strong>HUB האב מערכות מתקדמות בע"מ</strong> | ווצאפ: <a href="https://wa.me/972587008133" style="color:var(--accent-gold)">058-700-8133</a></p>`;

fs.mkdirSync(path.join(outputDir, 'privacy'), { recursive: true });
fs.writeFileSync(path.join(outputDir, 'privacy', 'index.html'),
    legalShell('מדיניות פרטיות', 'מדיניות הפרטיות של damages.co.il — הגנה על המידע האישי שלך', '/privacy/', privacyBody));
console.log('   🔒 /privacy/ — generated');

// Terms of Service
const termsBody = `
<h1>תנאי שימוש</h1>
<p class="legal-meta">עדכון אחרון: ${UPDATED}</p>
<h2>1. כללי</h2>
<p>השימוש באתר damages.co.il מהווה הסכמה לתנאים אלו. האתר מופעל על ידי <strong>HUB האב מערכות מתקדמות בע"מ</strong>.</p>
<h2>2. המידע אינו ייעוץ משפטי</h2>
<p>המידע המוצג באתר, לרבות מאמרים ותוצאות מחשבון הפיצויים — <strong>אינו מהווה ייעוץ משפטי או תחליף להתייעצות עם עורך דין מוסמך</strong>.</p>
<h2>3. מחשבון הפיצויים</h2>
<ul><li>הסכומים הם <strong>הערכה סטטיסטית בלבד</strong></li><li>החישוב מתבצע בדפדפן ואינו שמור בשרתים</li></ul>
<h2>4. קניין רוחני</h2>
<p>כל התוכן באתר — ${allArticles.length} מאמרים, עיצוב, קוד ותשתיות — מוגן בזכויות יוצרים של <strong>HUB האב מערכות מתקדמות בע"מ</strong>. אין להעתיק ללא אישור.</p>
<h2>5. שימוש מותר</h2>
<ul><li>צפייה לשימוש אישי</li><li>שיתוף קישורים</li><li>ציטוט בציון מקור</li></ul>
<h2>6. הגבלת אחריות</h2>
<p>החברה אינה אחראית לנזק הנובע מהסתמכות על מידע באתר ואינה מתחייבת לזמינות רציפה.</p>
<h2>7. ניתוב למשרדי עורכי דין</h2>
<p>האתר משמש כפלטפורמת ניתוב. <strong>אין יחסי עורך דין-לקוח</strong> בינך לבין החברה.</p>
<h2>8. דין חל</h2>
<p>תנאים אלו כפופים לדין הישראלי. סמכות השיפוט: בתי המשפט בחיפה.</p>
<h2>9. יצירת קשר</h2>
<p><strong>HUB האב מערכות מתקדמות בע"מ</strong> | ווצאפ: <a href="https://wa.me/972587008133" style="color:var(--accent-gold)">058-700-8133</a></p>`;

fs.mkdirSync(path.join(outputDir, 'terms'), { recursive: true });
fs.writeFileSync(path.join(outputDir, 'terms', 'index.html'),
    legalShell('תנאי שימוש', 'תנאי השימוש באתר damages.co.il', '/terms/', termsBody));
console.log('   📋 /terms/ — generated');

// Accessibility Statement
const a11yBody = `
<h1>♿ הצהרת נגישות</h1>
<p class="legal-meta">עדכון אחרון: ${UPDATED} | תקן WCAG 2.1 Level AA</p>
<h2>1. מחויבות</h2>
<p><strong>HUB האב מערכות מתקדמות בע"מ</strong> מחויבת לנגישות דיגיטלית בהתאם ל:</p>
<ul>
<li><strong>חוק שוויון זכויות לאנשים עם מוגבלות</strong>, התשנ"ח-1998</li>
<li><strong>תקנות נגישות לשירות</strong>, התשע"ג-2013</li>
<li><strong>תקן ישראלי 5568</strong></li>
<li><strong>WCAG 2.1 Level AA</strong></li>
<li><strong>Section 508</strong> (USA)</li>
<li><strong>EN 301 549</strong> (EU)</li>
</ul>
<h2>2. התאמות שבוצעו</h2>
<div class="check-item"><span class="check-icon">✅</span><p><strong>מבנה סמנטי:</strong> HTML5 (header, main, nav, footer)</p></div>
<div class="check-item"><span class="check-icon">✅</span><p><strong>שפה ו-RTL:</strong> lang="he", dir="rtl"</p></div>
<div class="check-item"><span class="check-icon">✅</span><p><strong>ניגודיות צבעים:</strong> יחס ≥4.5:1</p></div>
<div class="check-item"><span class="check-icon">✅</span><p><strong>תיאורי תמונות:</strong> תגיות alt</p></div>
<div class="check-item"><span class="check-icon">✅</span><p><strong>ניווט מקלדת:</strong> Tab, Enter, Escape</p></div>
<div class="check-item"><span class="check-icon">✅</span><p><strong>ARIA:</strong> תגיות aria-label</p></div>
<div class="check-item"><span class="check-icon">✅</span><p><strong>Skip Navigation:</strong> דילוג לתוכן הראשי</p></div>
<div class="check-item"><span class="check-icon">✅</span><p><strong>גודל טקסט:</strong> תמיכה בהגדלה עד 200%</p></div>
<h2>3. תוכן</h2>
<p>האתר מכיל כעת <strong>${allArticles.length} מאמרים</strong> ב-<strong>${[...new Set(allArticles.map(a => a.pillar))].length} תחומים</strong>, כולם בפורמט HTML סטטי נגיש.</p>
<h2>4. דיווח על בעיה</h2>
<p>ווצאפ: <a href="https://wa.me/972587008133?text=דיווח%20על%20בעיית%20נגישות%20באתר%20damages.co.il" style="color:var(--accent-gold)">058-700-8133</a></p>
<h2>5. רכז נגישות</h2>
<p><strong>HUB האב מערכות מתקדמות בע"מ</strong> | ווצאפ: <a href="https://wa.me/972587008133" style="color:var(--accent-gold)">058-700-8133</a></p>`;

fs.mkdirSync(path.join(outputDir, 'accessibility'), { recursive: true });
fs.writeFileSync(path.join(outputDir, 'accessibility', 'index.html'),
    legalShell('הצהרת נגישות', 'הצהרת הנגישות של damages.co.il — WCAG 2.1 AA', '/accessibility/', a11yBody));
console.log('   ♿ /accessibility/ — generated');

console.log(`\n🏗️  Build complete: ${built} articles + 3 legal pages + sitemap + robots.txt`);
console.log(`📅 Generated: ${today}\n`);
