-- ═══════════════════════════════════════════════════
--  damages.co.il — Tables for hub-core D1
--  Prefixed with dmg_ to avoid conflicts
-- ═══════════════════════════════════════════════════

-- 1. Users & Permissions (site-level auth)
CREATE TABLE IF NOT EXISTS dmg_users (
  id         TEXT    PRIMARY KEY,
  email      TEXT    UNIQUE NOT NULL,
  name       TEXT    NOT NULL,
  role       TEXT    NOT NULL DEFAULT 'viewer',
  password   TEXT    NOT NULL,
  phone      TEXT,
  status     TEXT    NOT NULL DEFAULT 'ACTIVE',
  last_login INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 2. Leads (WhatsApp clicks, calculator, forms)
CREATE TABLE IF NOT EXISTS dmg_leads (
  id         TEXT    PRIMARY KEY,
  source     TEXT    NOT NULL DEFAULT 'unknown',
  page       TEXT,
  article    TEXT,
  referrer   TEXT,
  ip         TEXT,
  ua         TEXT,
  phone      TEXT,
  name       TEXT,
  notes      TEXT,
  status     TEXT    NOT NULL DEFAULT 'NEW',
  assigned_to TEXT,
  value      INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 3. Page Views
CREATE TABLE IF NOT EXISTS dmg_pageviews (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  path       TEXT    NOT NULL,
  referrer   TEXT,
  ip         TEXT,
  ua         TEXT,
  session_id TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 4. Events
CREATE TABLE IF NOT EXISTS dmg_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  type       TEXT    NOT NULL,
  page       TEXT,
  data       TEXT,
  ip         TEXT,
  session_id TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dmg_leads_status     ON dmg_leads(status);
CREATE INDEX IF NOT EXISTS idx_dmg_leads_source     ON dmg_leads(source);
CREATE INDEX IF NOT EXISTS idx_dmg_leads_created    ON dmg_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_dmg_pageviews_path   ON dmg_pageviews(path);
CREATE INDEX IF NOT EXISTS idx_dmg_pageviews_created ON dmg_pageviews(created_at);
CREATE INDEX IF NOT EXISTS idx_dmg_events_type      ON dmg_events(type);
CREATE INDEX IF NOT EXISTS idx_dmg_events_created   ON dmg_events(created_at);

-- Seed admin user
INSERT OR IGNORE INTO dmg_users (id, email, name, role, password)
VALUES ('admin_001', 'admin@damages.co.il', 'מנהל ראשי', 'admin',
  '$placeholder_change_on_first_login');
