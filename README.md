# damages.co.il ⚖️

> פורטל הנזיקין והפיצויים מס' 1 בישראל  
> © HUB האב מערכות מתקדמות בע"מ

## Architecture

Pure static site. Zero JS frameworks. Zero runtime dependencies.

```
public/              ← Web root (deploy this)
├── content/         ← Markdown source files (16 articles)
├── law/             ← Generated HTML (SSG output)
├── justice/
├── defense/
├── privacy/
├── terms/
├── accessibility/
├── sitemap.xml      ← Auto-generated
├── robots.txt       ← Auto-generated
├── 404.html
└── index.html       ← Homepage

scripts/
├── build_static.js      ← SSG: Markdown → HTML + sitemap + robots + legal pages
└── build_search_index.js ← Search index generator
```

## Commands

```bash
# Full build (articles + search + sitemap + legal pages)
npm run build

# Local dev server
npm run serve
```

## Adding Content

1. Create a `.md` file in `public/content/{pillar}/{category}/`
2. Add frontmatter (title, title_he, description, keywords, etc.)
3. Run `npm run build`
4. `git add -A && git commit -m "..." && git push`

## Deploy (xCloud)

Web Root: `/public`  
Build Command: `npm run build`  
Branch: `master`

## Standards

- WCAG 2.1 AA ♿
- GDPR + Israeli Privacy Law 🔒
- Schema.org (LegalService + FAQ)
- Open Graph (WhatsApp/Facebook/Twitter)
- RTL Hebrew native
