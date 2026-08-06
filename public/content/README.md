# Akasha Knowledge Vault — Content Standards

> **© All Rights Reserved — HUB האב מערכות מתקדמות בע"מ**  
> The Akasha Knowledge Vault system is the exclusive intellectual property of HUB Advanced Systems Ltd.

---

## Directory Structure (SEO/W3C English URLs → Hebrew Content)

| English Slug | Sefira | Hebrew Name | Content |
|---|---|---|---|
| `law/constitutional/` | כתר (Keter) | חוק יסוד | Basic Laws, Constitution |
| `law/jewish-law/` | חכמה (Chokhmah) | משפט עברי | Talmud, Rambam, Shulchan Aruch |
| `law/comparative-law/` | בינה (Binah) | משפט השוואתי | Hammurabi, Roman, Common Law |
| `justice/human-rights/` | חסד (Chesed) | זכויות אדם | UN Declaration, Basic Rights |
| `justice/criminal-law/` | גבורה (Gevurah) | דין פלילי | Criminal offenses, Penalties |
| `justice/torts/` | **תפארת (Tiferet)** | **נזיקין** | **★ Core Domain ★** |
| `defense/precedents/` | נצח (Netzach) | תקדימים | Landmark rulings |
| `defense/legislation/` | הוד (Hod) | חקיקה | Laws, Regulations, Orders |
| `defense/evidence/` | יסוד (Yesod) | ראיות | Evidence law, Procedure |
| `defense/live-rulings/` | מלכות (Malkhut) | פסיקה חיה | Current rulings, Updates |

## Content Standards Compliance

### SEO (Search Engine Optimization)
- URLs: English slugs, lowercase, hyphens (`/justice/torts/whiplash-compensation`)
- `<title>` + `<meta description>` per document
- Schema.org JSON-LD markup (LegalService, Article, FAQPage)
- Canonical URLs, hreflang tags

### GEO (Generative Engine Optimization)
- Structured FAQ sections for AI extraction
- Clear H1→H2→H3 hierarchy
- Concise expert answers in first paragraph
- Citation of legal sources (חוק, סעיף, פסק דין)

### AEO (Answer Engine Optimization)
- Position 0 / Featured Snippet format
- Question-Answer pairs in frontmatter
- "People Also Ask" keyword targeting
- Structured data for voice search

### W3C Compliance
- Valid HTML5 semantic markup
- WCAG 2.1 AA accessibility
- lang="he" dir="rtl" attributes
- Proper heading hierarchy

## Frontmatter Schema v2.0

```yaml
---
# === SEO Core ===
title: "Whiplash Compensation in Car Accidents"
title_he: "פיצוי על צליפת שוט בתאונת דרכים"
slug: "whiplash-compensation"
description: "Complete guide to maximum compensation for whiplash injuries"
description_he: "המדריך המלא לפיצוי מקסימלי על צליפת שוט"
keywords: "whiplash, car accident, compensation, insurance, tort"
keywords_he: "צליפת שוט, תאונת דרכים, פיצויים, ביטוח, נזיקין"
canonical: "https://damages.co.il/justice/torts/car-accidents/whiplash-compensation"

# === Akasha Metadata ===
sefira: "תפארת"
pillar: "מ-משפט"
category: "תאונות דרכים"
era: "contemporary"
source: "פקודת הנזיקין [נוסח חדש]"

# === GEO/AEO ===
faq:
  - q: "כמה פיצוי מגיע על צליפת שוט?"
    a: "הפיצוי נע בין 10,000 ל-150,000 ש״ח בהתאם לחומרת הפגיעה."
  - q: "כמה זמן לוקח לקבל פיצוי?"
    a: "התהליך אורך בין 6 חודשים ל-3 שנים."
schema_type: "Article"
schema_legal_type: "LegalService"

# === Quality Control ===
verified: false
author: "HUB Content Engine"
reviewed_by: ""
published: false
copyright: "© HUB האב מערכות מתקדמות בע״מ"
version: "1.0"
created: "2026-08-06"
updated: "2026-08-06"
---
```

## Version
- **v2.0** — 2026-08-06 — English SEO URLs + GEO/AEO/W3C standards
