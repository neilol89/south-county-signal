# 06 — Tech Stack (Updated March 2026)

This replaces the original 06-TECH-STACK.md with the actual architecture being built.

---

## Architecture Overview

The South County Signal runs on three systems:

1. **Content Pipeline** — Claude Code + custom skills produce the newsletter each week
2. **Distribution** — Beehiiv sends the email and manages subscribers
3. **Web Presence** — Static site on Cloudflare Pages for discovery, archive, and advertiser info

```
┌─────────────────────────────────────────────────────────┐
│                    WEEKLY PIPELINE                        │
│                                                           │
│  sources.json ──→ SCOUT SKILL ──→ raw-events.json        │
│                        ↑                                  │
│            manual-additions.json                          │
│            (advertiser placements,                        │
│             editorial overrides)                          │
│                        ↓                                  │
│  raw-events.json ──→ CURATOR SKILL ──→ curated-events.json│
│                        ↓                                  │
│  curated-events.json → DRAFTER SKILL → draft-content.json │
│                        ↓                                  │
│  draft-content.json → generate-newsletter.js → issue-X.html│
│                        ↓                    ↓             │
│                    BEEHIIV              WEBSITE            │
│                  (email send)       (Cloudflare Pages)     │
└─────────────────────────────────────────────────────────┘
```

---

## Platform 1: Content Pipeline (Claude Code)

### How It Works

Claude Code is the production engine. Three custom skills handle the weekly workflow:

| Skill | Input | Output | What It Does |
|-------|-------|--------|-------------|
| **scs-scout** | `sources.json` + `manual-additions.json` | `raw-events.json` | Scrapes 12+ venue sites, event calendars, and aggregators. Runs web searches. Merges advertiser placements. Flags what needs human review. |
| **scs-curator** | `raw-events.json` | `curated-events.json` | Ranks events by uniqueness, appeal, timeliness. Picks headliner. Enforces category/geographic diversity. Suggests deals and Signal Noise topics. |
| **scs-drafter** | `curated-events.json` | `draft-content.json` | Writes every newsletter section in the Signal voice. Generates subject lines and preview text. |

### Assembly Script

`scripts/generate-newsletter.js` takes `draft-content.json` + `assets/newsletter-template.html` and produces a final `output/issue-X.html` file ready for Beehiiv.

### Dynamic Source Management

`pipeline/sources.json` contains the full list of event sources:
- **12 web sources** — venue calendars, town event pages, Eventbrite, tourism sites, Providence events
- **6 search queries** — broad web searches for coverage gaps
- **7 manual-check sources** — Instagram accounts and Facebook groups that can't be scraped (flagged for human review)

Sources can be added/removed at any time without modifying the skills. When a new venue opens, add one JSON entry. When a venue closes, delete it.

### Manual Additions

`pipeline/manual-additions.json` is edited by the human each week to inject:
- **Sponsored/advertiser lineup items** with `"sponsored": true` flag
- **Forced spotlight, deal, or Signal Noise** picks
- **Editorial notes** that guide curation ("skip Coast Guard House this week")
- **Notes to curator** for tone/theme guidance ("lean into spring outdoor stuff")

### Weekly Human Touchpoints

| Step | What You Do | Time |
|------|------------|------|
| Say "scout this week's events" | Claude scrapes all sources | 1 min |
| Review scout report, check Instagram/Facebook sources | Add anything Claude missed | 15 min |
| Edit `manual-additions.json` | Add advertiser items, editorial notes | 10 min |
| Say "curate this week" | Claude ranks and selects | 1 min |
| Review curated lineup | Swap/override any picks | 10 min |
| Say "draft the newsletter" | Claude writes all sections | 1 min |
| Read and edit the draft | Add local color, tweak voice | 20 min |
| Say "generate the HTML" | Claude assembles final HTML | 1 min |
| Open HTML, sanity check on mobile | Check links, formatting | 5 min |
| Paste into Beehiiv, test send, schedule | Send Thursday 8:30 AM | 10 min |
| **Total** | | **~75 min** |

---

## Platform 2: Beehiiv (Email Distribution)

### Plan Progression

| Stage | Plan | Cost | Trigger |
|-------|------|:---:|---------|
| Launch (0–2,500 subs) | Launch (Free) | $0/mo | — |
| Growth (2,500–10K subs) | Scale | $49/mo | Hit 2,500 subscribers |
| Scale (10K+) | Max | $99+/mo | Need Beehiiv branding removed |

### Setup Checklist

1. Create Beehiiv account
2. Create publication: "The South County Signal"
3. Connect custom domain (DNS via Cloudflare)
4. Configure email authentication: SPF, DKIM, DMARC (Cloudflare DNS)
5. Upload logo and brand colors
6. Upload HTML email template
7. Create custom subscriber fields: `first_name`, `town`, `interests`, `signup_source`
8. Set up 3-email welcome automation
9. Enable referral program (Scale plan)
10. Generate API key for `scripts/beehiiv-client.py`

### Beehiiv + Cloudflare Integration

- **DNS**: Cloudflare manages all DNS records. Beehiiv's required CNAME, TXT (SPF), and DKIM records are added in Cloudflare's DNS dashboard.
- **Website**: `southcountysignal.com` points to Cloudflare Pages (the static site).
- **Newsletter archive**: Beehiiv auto-hosts web versions of each issue at a subdomain or path configured in Beehiiv settings.
- **Signup forms**: Beehiiv provides embeddable signup forms (iframe or JS) that go directly on the Cloudflare-hosted site.

### Key Beehiiv Features to Use

- **Recommendation Network** — cross-promote with other newsletters
- **Embeddable signup forms** — for the website and partner sites
- **3D Analytics (Scale+)** — open rate, click maps, geographic data, device breakdown
- **Beehiiv Ad Network** — passive revenue from their marketplace
- **Boosts** — get paid when you recommend other newsletters
- **Referral program** — readers earn rewards for referring friends

---

## Platform 3: Website (Cloudflare Pages)

### Why Cloudflare Pages

- **Free**: Unlimited sites, 500 builds/month, free SSL, global CDN
- **Fast**: Edge-cached globally, sub-second load times
- **Simple**: Push to git = site deploys automatically
- **No server**: Pure static HTML/CSS/JS — nothing to maintain
- **DNS in one place**: Domain, email auth, and site hosting all managed in Cloudflare

### Site Structure

| Page | Purpose | Key Content |
|------|---------|-------------|
| **Home** | First impression + current newsletter | Hero section, embedded latest issue, subscribe CTA |
| **About** | Who we are, what to expect | Brand story, team, coverage area |
| **Archive** | Past issues | List of all published issues with links |
| **Advertise** | Sell ad placements | Media kit, rate card, audience stats, Calendly booking link |
| **Subscribe** | Dedicated signup | Beehiiv embed form, value proposition |

### Deployment Workflow

1. Site source lives in the git repo (e.g., `website/` directory)
2. Each week after generating the newsletter HTML, the latest issue is copied to the site
3. Push to main branch → Cloudflare Pages auto-deploys
4. Homepage always shows the most recent issue

### Technical Details

- **Framework**: Static HTML/CSS/JS (no build step needed, or optionally a minimal static site generator)
- **Fonts**: Playfair Display (headlines) + Source Sans 3 (body) via Google Fonts
- **Colors**: Brand bible palette (#1B4965, #D4A843, #FAF8F5, #2D2D2D)
- **Responsive**: Mobile-first, same breakpoints as email template (640px)
- **Forms**: Beehiiv embedded signup form (no backend needed)

---

## Full Tool Stack

| Tool | Purpose | Cost | Status |
|------|---------|:---:|--------|
| **Claude Code** | Content pipeline (scout, curate, draft, assemble) | Per usage | Active |
| **Beehiiv** | Email platform, subscriber management, analytics | $0→$49/mo | Setup pending |
| **Cloudflare Pages** | Website hosting, CDN, SSL | $0/mo | Setup pending |
| **Cloudflare DNS** | Domain DNS, email auth records | $0/mo | Setup pending |
| **Namecheap** | Domain registration (southcountysignal.com) | $12/yr | Setup pending |
| **Google Workspace** | Email (hello@southcountysignal.com) | $7/mo | Setup pending |
| **Canva Pro** | Social media graphics, sign-up cards | $13/mo | Setup pending |
| **Later.com** | Social media scheduling | $0→$25/mo | Future |
| **Calendly** | Booking calls with advertisers | $0/mo | Future |
| **Stripe** | Payment processing for ad sales | 2.9% + $0.30/txn | Future |
| **Google Sheets** | Editorial calendar, ad inventory, analytics log | $0 | Setup pending |
| **Git (GitHub)** | Version control, Cloudflare Pages deployment | $0/mo | Active |

### Monthly Costs by Phase

| Phase | Beehiiv | Google | Canva | Domain | Hosting | Total |
|-------|:---:|:---:|:---:|:---:|:---:|:---:|
| **Launch** (0-2,500 subs) | $0 | $7 | $13 | $1 | $0 | **$21/mo** |
| **Growth** (2,500-5K subs) | $49 | $7 | $13 | $1 | $0 | **$70/mo** |
| **Scale** (5K-10K subs) | $99 | $7 | $13 | $1 | $0 | **$120/mo** |

---

## Automation Roadmap

### Now (Launch)
- Claude Code skills handle the full content pipeline
- Manual Beehiiv send (paste HTML, schedule)
- Manual social media posting

### Phase 2 (Month 3-6)
- Automated event scraping script (Node/Python cron job) supplements Claude scout
- Beehiiv welcome email automation live
- Social media scheduling via Later.com

### Phase 3 (Month 6-12)
- Make.com automations: new subscriber → Slack notification, post-send → analytics log
- Beehiiv API integration for subscriber management from Claude Code
- Google Sheets auto-populated from Beehiiv webhooks

### Phase 4 (Year 2)
- Claude Agent SDK for fully autonomous Monday scouting
- Automated social media post generation from newsletter content
- Advertiser self-service booking (Calendly + Stripe)
- Beehiiv referral program + Boost network active

---

## Data Flow Summary

```
MONDAY
  Human checks Instagram/Facebook (15 min)
  Human edits manual-additions.json (10 min)
  Claude: scout → raw-events.json

TUESDAY
  Claude: curate → curated-events.json
  Human reviews curated list (10 min)

WEDNESDAY
  Claude: draft → draft-content.json
  Human edits draft (20 min)
  Claude: generate → output/issue-X.html
  Human reviews HTML (5 min)
  Human creates social posts in Canva (15 min)

THURSDAY
  Human: paste into Beehiiv, test send, schedule 8:30 AM
  Human: post to Instagram, share in Facebook groups
  Human: respond to replies and DMs

FRIDAY
  Human: check Beehiiv analytics, log metrics (5 min)
  Human: post weekend picks to Instagram Stories
```

**Total human time: ~2 hours/week**
**Total Claude time: ~5 minutes of compute**
