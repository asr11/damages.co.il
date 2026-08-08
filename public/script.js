document.addEventListener('DOMContentLoaded', () => {
    // 1. Intersection Observer for fade-in animations on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing once it's visible
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in-up');
    fadeElements.forEach(el => observer.observe(el));

    // 2. Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 3. (Removed Lead Form Submission - Now WhatsApp Only)

    // 4. Handle Calculator Logic
    const calcForm = document.getElementById('calc-form');
    if (calcForm) {
        calcForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const age = parseInt(document.getElementById('calcAge').value, 10);
            const type = document.getElementById('calcType').value;
            const severity = document.getElementById('calcSeverity').value;

            // Simple mock frontend calculation reflecting backend logic
            let baseAmount = 0;
            switch(type) {
                case 'car_accident': baseAmount = 30000; break;
                case 'medical':     baseAmount = 60000; break;
                case 'work':        baseAmount = 35000; break;
                case 'slip':        baseAmount = 20000; break;
                case 'assault':     baseAmount = 25000; break;
                case 'property':    baseAmount = 15000; break;
                case 'insurance':   baseAmount = 20000; break;
                default:            baseAmount = 18000;
            }
            
            const severityMultiplier = { 'low': 1, 'medium': 2.5, 'high': 5 };
            baseAmount *= (severityMultiplier[severity] || 1);
            
            if (age >= 18 && age <= 45) {
                baseAmount *= 1.3;
            } else if (age > 45 && age <= 65) {
                baseAmount *= 1.1;
            }
            
            const finalAmount = Math.floor(baseAmount);
            
            // Format number to ILS currency string
            const formatter = new Intl.NumberFormat('he-IL', {
                style: 'currency',
                currency: 'ILS',
                maximumFractionDigits: 0
            });
            
            document.getElementById('calcAmount').innerText = formatter.format(finalAmount);
            
            // Show result with animation
            const resultDiv = document.getElementById('calcResult');
            resultDiv.style.display = 'block';
            resultDiv.classList.add('pulse');
            setTimeout(() => resultDiv.classList.remove('pulse'), 2000);
            
            // Update WhatsApp Buttons with detailed calculation data + URL
            const typeNames = {'car_accident':'תאונת דרכים','medical':'רשלנות רפואית','work':'תאונת עבודה','slip':'החלקה/נפילה','assault':'תקיפה/אלימות','property':'נזק לרכוש','insurance':'תביעות ביטוח','other':'אחר'};
            const severityNames = {'low':'קלה','medium':'בינונית','high':'קשה'};
            const typeName = typeNames[type] || type;
            const severityName = severityNames[severity] || severity;
            const currentUrl = window.location.href;

            const message = `שלום, ביצעתי חישוב במחשבון הפיצויים:\n• סכום משוער: ${formatter.format(finalAmount)}\n• סוג פגיעה: ${typeName}\n• חומרה: ${severityName}\n• גיל הנפגע: ${age}\n• מגיע מדף: ${currentUrl}\nאני מעוניין בבדיקת זכאות חינם למימוש הפיצוי.`;
            const encodedMessage = encodeURIComponent(message);
            const waUrl = `https://wa.me/972587008133?text=${encodedMessage}`;
            
            const calcBtn = document.getElementById('calcWhatsappBtn');
            if (calcBtn) calcBtn.href = waUrl;

            const ceoBtn = document.getElementById('whatsapp-ceo-btn');
            if (ceoBtn) ceoBtn.href = waUrl;
            
            const heroBtns = document.querySelectorAll('.btn-whatsapp:not(#calcWhatsappBtn)');
            heroBtns.forEach(btn => btn.href = waUrl);
        });
    }

    // 5. Client-Side Search Engine
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (searchInput && searchResults) {
        // Fetch the index only when search input is focused (lazy-load)
        let searchIndex = [];
        let searchIndexLoaded = false;
        
        function loadSearchIndex() {
            if (searchIndexLoaded) return;
            searchIndexLoaded = true;
            fetch('/search_index.json')
                .then(res => res.json())
                .then(data => { searchIndex = data; })
                .catch(err => console.error('Failed to load search index:', err));
        }
        
        searchInput.addEventListener('focus', loadSearchIndex, { once: true });
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length < 2) {
                searchResults.style.display = 'none';
                return;
            }

            const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
            
            const results = searchIndex.filter(item => {
                const haystack = [
                    item.title || '',
                    item.title_he || '',
                    item.description || '',
                    item.description_he || '',
                    item.keywords || '',
                    item.keywords_he || '',
                    item.category || '',
                    item.source || '',
                    item.era || '',
                    item.content_text || ''
                ].join(' ').toLowerCase();

                return tokens.some(token => haystack.includes(token));
            });

            if (results.length > 0) {
                searchResults.innerHTML = results.slice(0, 5).map(item => `
                    <a href="${item.url}" style="display: block; padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: white;">
                        <h4 style="margin: 0 0 5px 0; color: var(--accent-gold); font-size: 1rem;">${item.title_he || item.title}</h4>
                        <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">${(item.description_he || item.description || '').substring(0, 80)}...</p>
                        <span style="font-size: 0.75rem; color: rgba(212,175,55,0.6);">${item.category || ''}</span>
                    </a>
                `).join('');
                searchResults.style.display = 'block';
            } else {
                const encodedQuery = encodeURIComponent(`שלום, חפשתי באתר בנושא: "${query}" ואני מעוניין בייעוץ משפטי מול עורך דין.`);
                searchResults.innerHTML = `
                    <div style="padding: 15px; text-align: center;">
                        <p style="margin: 0 0 10px 0; color: var(--text-muted); font-size: 0.9rem;">רוצה להתייעץ על "${query}" מול עורך דין מומחה?</p>
                        <a href="https://wa.me/972587008133?text=${encodedQuery}" target="_blank" style="display: inline-block; padding: 8px 18px; background: #25D366; color: #0a0a1e; border-radius: 20px; font-weight: 700; text-decoration: none; font-size: 0.85rem;">
                            💬 ייעוץ חירום בווצאפ
                        </a>
                    </div>`;
                searchResults.style.display = 'block';
            }
        });

        // Hide results on click outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });
        
        // Show results on focus if there's a query
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim().length >= 2) {
                searchResults.style.display = 'block';
            }
        });
    }

    // ── 6. Analytics & Lead Tracking ──────────────────
    const sessionId = sessionStorage.getItem('dmg_sid') || (() => {
        const sid = Date.now().toString(36) + Math.random().toString(36).slice(2);
        sessionStorage.setItem('dmg_sid', sid);
        return sid;
    })();

    // Track page view
    try {
        navigator.sendBeacon('/api/analytics', JSON.stringify({
            path: location.pathname,
            referrer: document.referrer || 'direct',
            session_id: sessionId,
        }));
    } catch(e) {}

    // Track WhatsApp clicks → lead
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href*="wa.me"]');
        if (link) {
            const h1 = document.querySelector('h1');
            try {
                navigator.sendBeacon('/api/lead', JSON.stringify({
                    source: 'whatsapp-click',
                    page: location.pathname,
                    article: h1 ? h1.textContent.trim() : '',
                    referrer: document.referrer || 'direct',
                    session_id: sessionId,
                }));
            } catch(e) {}
        }
    });

    // Track calculator submissions → event
    const calcForm = document.getElementById('calc-form');
    if (calcForm) {
        calcForm.addEventListener('submit', function() {
            try {
                navigator.sendBeacon('/api/analytics', JSON.stringify({
                    path: location.pathname,
                    referrer: document.referrer || 'direct',
                    session_id: sessionId,
                    event: 'calculator_submit',
                    data: {
                        type: document.getElementById('calcType')?.value,
                        severity: document.getElementById('calcSeverity')?.value,
                    },
                }));
            } catch(e) {}
        });
    }
});
