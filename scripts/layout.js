/**
 * Centralized Layout Component Module — damages.co.il
 * Guarantees 100% unified Header & Footer template harmony across all pages.
 */

function getHeaderHTML(activePage = '') {
    return `<header class="main-header">
<div class="container" style="display:flex;align-items:center;justify-content:space-between">
<div class="header-left" style="display:flex;align-items:center">
<a href="/" class="logo" style="display:flex;flex-direction:column;align-items:flex-start;text-decoration:none;color:inherit">
<div style="font-size:1.8rem;font-weight:800;margin:0">damages<span style="color:var(--accent-gold)">.co.il</span></div>
<span style="font-size:.8rem;color:var(--accent-gold);font-weight:600;margin-top:-3px">פורטל המידע והזכויות בנזיקין בישראל</span>
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
<a href="/articles/" class="${activePage==='articles'?'active':''}" style="color:var(--accent-gold);font-weight:700">📚 כל המאמרים</a>
<a href="/forms/" class="${activePage==='forms'?'active':''}">📄 טפסים</a>
<a href="/lawyers/" class="${activePage==='lawyers'?'active':''}">⚖️ נבחרת עורכי הדין</a>
<a href="/#calculator">🧮 מחשבון</a>
<a href="https://wa.me/972587008133?text=שלום%2C%20אני%20צריך%20עזרה%20דחופה%20בנושא%20נזיקין" target="_blank" class="btn btn-whatsapp pulse" style="padding:6px 16px;font-size:1rem;border-radius:20px;border:2px solid var(--whatsapp-green);background:#25D366;color:#0a0a1e;font-weight:800;white-space:nowrap">
<svg style="width:20px;height:20px;vertical-align:middle;margin-left:6px;fill:#0a0a1e" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.205 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>חירום 24/7
</a>
</nav>

<button class="hamburger-btn" onclick="document.getElementById('mobile-drawer').classList.toggle('open')" aria-label="תפריט ניווט">
☰
</button>
</div>
</header>

<!-- Mobile Drawer Panel -->
<div id="mobile-drawer" class="mobile-drawer">
<div class="mobile-drawer-header">
<div style="font-weight:800;font-size:1.3rem;color:var(--accent-gold)">damages.co.il</div>
<button onclick="document.getElementById('mobile-drawer').classList.remove('open')" style="background:none;border:none;color:white;font-size:1.8rem;cursor:pointer">&times;</button>
</div>
<div class="mobile-drawer-links">
<a href="/" onclick="document.getElementById('mobile-drawer').classList.remove('open')">🏠 דף הבית</a>
<a href="/articles/" onclick="document.getElementById('mobile-drawer').classList.remove('open')">📚 כל המאמרים</a>
<a href="/forms/" onclick="document.getElementById('mobile-drawer').classList.remove('open')">📄 טפסים משפטיים</a>
<a href="/lawyers/" onclick="document.getElementById('mobile-drawer').classList.remove('open')">⚖️ נבחרת עורכי הדין</a>
<a href="/#calculator" onclick="document.getElementById('mobile-drawer').classList.remove('open')">🧮 מחשבון פיצויים</a>
<a href="/privacy/" onclick="document.getElementById('mobile-drawer').classList.remove('open')">🔒 מדיניות פרטיות</a>
<a href="/accessibility/" onclick="document.getElementById('mobile-drawer').classList.remove('open')">♿ הצהרת נגישות</a>
</div>
<div style="margin-top:auto;padding-top:20px">
<a href="https://wa.me/972587008133?text=שלום%2C%20אני%20צריך%20ייעוץ%20משפטי" target="_blank" class="btn btn-whatsapp" style="display:block;text-align:center;padding:12px;border-radius:12px;background:#25D366;color:#0a0a1e;font-weight:800;text-decoration:none">
💬 ייעוץ חירום בווצאפ
</a>
</div>
</div>`;
}

function getFooterHTML() {
    return `<footer class="main-footer" style="border-top:1px solid rgba(212,175,55,.1);padding:40px 0 30px;background:var(--secondary-bg)">
<div class="container" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:30px;margin-bottom:30px">
<div>
<div style="font-size:1.5rem;font-weight:800;color:white;margin-bottom:10px">damages<span style="color:var(--accent-gold)">.co.il</span></div>
<p style="color:var(--text-muted);font-size:0.85rem;line-height:1.6">פורטל המידע והזכויות בנזיקין בישראל — סיוע בלתי תלוי במיצוי זכויות לנפגעי תאונות דרכים, תאונות עבודה, רשלנות רפואית ונזקי גוף.</p>
</div>
<div>
<div style="color:var(--accent-gold);font-size:1.1rem;font-weight:700;margin-bottom:12px">תחומי התמחות</div>
<a href="/justice/torts/car-accidents/whiplash-compensation/" style="display:block;color:#e5e7eb;font-size:0.85rem;padding:3px 0;text-decoration:none">תאונות דרכים</a>
<a href="/defense/evidence/work-accident-national-insurance-claims/" style="display:block;color:#e5e7eb;font-size:0.85rem;padding:3px 0;text-decoration:none">תאונות עבודה & ביטוח לאומי</a>
<a href="/justice/torts/medical-malpractice/medical-malpractice-basics/" style="display:block;color:#e5e7eb;font-size:0.85rem;padding:3px 0;text-decoration:none">רשלנות רפואית</a>
<a href="/justice/torts/insurance-claims/insurance-claim-guide/" style="display:block;color:#e5e7eb;font-size:0.85rem;padding:3px 0;text-decoration:none">תביעות ביטוח</a>
</div>
<div>
<div style="color:var(--accent-gold);font-size:1.1rem;font-weight:700;margin-bottom:12px">מידע משפטי & AI</div>
<a href="/defense/legislation/tort-ordinance-overview/" style="display:block;color:#e5e7eb;font-size:0.85rem;padding:3px 0;text-decoration:none">פקודת הנזיקין</a>
<a href="/defense/precedents/supreme-court/landmark-tort-rulings-israel/" style="display:block;color:#e5e7eb;font-size:0.85rem;padding:3px 0;text-decoration:none">פסקי דין מובילים</a>
<a href="/forms/" style="display:block;color:#e5e7eb;font-size:0.85rem;padding:3px 0;text-decoration:none">📄 מרכז הטפסים המשפטיים</a>
<a href="/llms.txt" target="_blank" style="display:block;color:var(--accent-gold);font-size:0.85rem;padding:3px 0;text-decoration:none;font-weight:600">🤖 תצוגת מכונות (llms.txt)</a>
</div>
<div>
<div style="color:var(--accent-gold);font-size:1.1rem;font-weight:700;margin-bottom:12px">יצירת קשר & משפטי</div>
<a href="https://wa.me/972587008133" target="_blank" style="display:block;color:#25D366;font-size:0.9rem;padding:3px 0;text-decoration:none;font-weight:700">💬 ווצאפ — 058-700-8133</a>
<div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.05)">
<a href="/privacy/" style="display:block;color:#e5e7eb;font-size:0.8rem;padding:2px 0;text-decoration:none">מדיניות פרטיות</a>
<a href="/terms/" style="display:block;color:#e5e7eb;font-size:0.8rem;padding:2px 0;text-decoration:none">תנאי שימוש</a>
<a href="/accessibility/" style="display:block;color:#e5e7eb;font-size:0.8rem;padding:2px 0;text-decoration:none">♿ הצהרת נגישות</a>
</div>
</div>
</div>
<div class="container" style="border-top:1px solid rgba(255,255,255,0.05);padding-top:20px;text-align:center;font-size:0.8rem;color:var(--text-muted)">
<p>© 2026 HUB האב מערכות מתקדמות בע"מ — כל הזכויות שמורות</p>
<p style="margin-top:5px;opacity:0.7">המידע באתר אינו מהווה ייעוץ משפטי ואינו תחליף להתייעצות אישית עם עורך דין.</p>
</div>
</footer>`;
}

module.exports = {
    getHeaderHTML,
    getFooterHTML
};
