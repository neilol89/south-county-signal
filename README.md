# The South County Signal

A free weekly email newsletter curating the best events, food, music, nightlife, and things to do in Southern Rhode Island. Sends every Thursday at 8:30 AM EST.

> "Everything worth doing in South County. One email a week."

---

## Current status

- **Live site:** https://southcountysignal.com
- **Issues published:** 3 (issue #3 = week of May 7, 2026; previous: March 18, March 15)
- **Send platform:** Buttondown (migrated from Beehiiv on `fd4ec20`)
- **Hosting:** Netlify (deployed via API — `git push` does NOT auto-deploy, see "Publish" step below)
- **Repo:** github.com/neilol89/south-county-signal (public)

---

## How it works

```
┌──────────┐  ┌─────────┐  ┌────────┐  ┌─────────┐  ┌─────────┐  ┌──────┐
│  Scout   │→ │ Curate  │→ │ Draft  │→ │ Generate│→ │ Publish │→ │ Send │
└──────────┘  └─────────┘  └────────┘  └─────────┘  └─────────┘  └──────┘
  raw-events    curated-     this-      issue-N.html  site/        Buttondown
  .json         events.json  week.json                issues/      campaign
```

Each stage outputs a JSON file the next stage reads. The curator and drafter apply editorial logic from skill files in `Resources/`. The final HTML lands in two places:

1. `output/issue-N.html` — paste into Buttondown for the actual email send
2. `site/issues/issue-N.html` — wrapped in site chrome, deployed to the web archive

---

## Project structure

```
.
├── pipeline/                       # Working files, regenerated weekly
│   ├── sources.json                # Event sources (venues, calendars, search queries)
│   ├── manual-additions.json       # Editorial overrides, advertiser placements
│   ├── raw-events.json             # Output of scout
│   ├── curated-events.json         # Output of curator
│   └── this-week.json              # Output of drafter (consumed by generate-newsletter.js)
│
├── assets/
│   └── newsletter-template.html    # Email HTML template with [PLACEHOLDER] tokens
│
├── scripts/
│   ├── generate-newsletter.js      # this-week.json + template → output/issue-N.html
│   ├── publish-to-site.js          # Wraps issue HTML in site chrome → site/issues/
│   ├── deploy-netlify.py           # Deploys site/ folder to Netlify via API
│   └── beehiiv-client.py           # Beehiiv API wrapper (legacy — Beehiiv kept for subscriber data)
│
├── output/                         # Generated email-ready HTML — paste into Buttondown
│   └── issue-N.html
│
├── site/                           # Public website (deployed to southcountysignal.com)
│   ├── index.html                  # Marketing/signup landing page
│   ├── latest.html                 # Redirect to newest issue
│   └── issues/
│       ├── index.html              # Archive list page (auto-generated)
│       ├── issue-N.html            # Each issue, wrapped in site chrome
│       └── issues.json             # Manifest used to build the archive list
│
├── Resources/                      # Planning docs, skill definitions, brand bible
│   ├── SCOUTING-RUNBOOK.md         # Step-by-step guide for the scout stage
│   ├── scs-scout-SKILL.md          # Scout skill definition (for AI agents)
│   ├── scs-curator-SKILL.md        # Curator skill definition
│   ├── scs-drafter-SKILL.md        # Drafter skill definition
│   ├── 02-BRAND-BIBLE.md           # Voice, tone, language rules
│   └── ...                         # Business plan, monetization, audience strategy, etc.
│
├── archive/                        # Past issues (informational)
├── .github/workflows/              # GitHub Actions (currently dormant — Netlify is the real deploy)
├── CLAUDE.md                       # Codebase guide for Claude Code agents
└── README.md                       # This file
```

---

## Weekly workflow

Run weekly, ideally Monday or Tuesday so the editor has time before Thursday's send.

### 1. Scout

Read `Resources/SCOUTING-RUNBOOK.md` and follow it. Outputs `pipeline/raw-events.json`.

The scout fetches every URL in `pipeline/sources.json`, runs supplementary web searches, merges with `pipeline/manual-additions.json`, and produces a wide net of ~15–30 events for the target Thursday-to-Wednesday window.

```bash
# Done by an AI agent with web access — no shell command yet
```

### 2. Manual additions

Update `pipeline/manual-additions.json` with:
- Advertiser placements ("forced_items")
- Editorial overrides (forced spotlight, forced deal, forced signal noise)
- Notes for the curator

### 3. Curate

Apply curator skill logic (`Resources/scs-curator-SKILL.md`) to rank, filter, and select 1 headliner + 5–8 lineup picks + spotlight + signal noise. Outputs `pipeline/curated-events.json`.

### 4. Draft

Apply drafter skill logic (`Resources/scs-drafter-SKILL.md`) to write copy for every section in the brand voice. Outputs `pipeline/this-week.json`.

### 5. Generate the email HTML

```bash
node scripts/generate-newsletter.js
# → output/issue-N.html (where N comes from this-week.json's issue_number field)
```

### 6. Publish to the website

```bash
node scripts/publish-to-site.js
# → site/issues/issue-N.html (wrapped in site chrome)
# → site/issues/index.html  (rebuilt archive list)
# → site/latest.html        (redirect to newest)
```

### 7. Deploy the website

```bash
python scripts/deploy-netlify.py
# Uploads site/ to Netlify. Reads NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID from .env.
```

Then commit the static files for version control:

```bash
git add site/ pipeline/ output/
git commit -m "Issue #N — Week of [date]"
git push
```

(Note: `git push` does NOT trigger a deploy because Netlify isn't connected to the repo. The `python scripts/deploy-netlify.py` step is what makes things live.)

### 8. Send the email via Buttondown

1. Open Buttondown → New email
2. Paste the contents of `output/issue-N.html` into the HTML editor
3. Set the subject line (3 candidates are in `pipeline/this-week.json` under `subject_lines`)
4. Set preview text (in `pipeline/this-week.json` under `preview_text`)
5. Set "View in Browser" URL to `https://southcountysignal.com/issues/issue-N`
6. Schedule for Thursday 8:30 AM ET

---

## Setup (first-time)

### Prerequisites

- Node.js 18+
- Python 3.9+ with `requests` and `python-dotenv`
- A Netlify account with deploy token (https://app.netlify.com/user/applications#personal-access-tokens)
- A Buttondown account with API key

### Environment variables

Copy the structure and fill in your own values. The `.env` file is gitignored.

```bash
# .env
BEEHIIV_API_KEY=...                 # Legacy — kept for subscriber data export
BEEHIIV_PUBLICATION_ID=pub_...      # Legacy
BUTTONDOWN_API_KEY=...              # Primary newsletter sending
NETLIFY_AUTH_TOKEN=nfp_...          # For scripts/deploy-netlify.py
NETLIFY_SITE_ID=...                 # The site UUID — find in Netlify dashboard
```

### Install

```bash
pip install requests python-dotenv
# Node dependencies: none — generate-newsletter.js and publish-to-site.js use only stdlib
```

---

## Tech stack

| Layer | Tool | Notes |
|---|---|---|
| Newsletter sending | Buttondown | Migrated from Beehiiv on commit `fd4ec20` |
| Hosting | Netlify | Site ID `d42ceedd-e6d2-44e2-988c-fbe9f59a43f8`. Domain on Netlify DNS. |
| Domain | southcountysignal.com | Custom domain on Netlify with HTTPS |
| Repo | GitHub (public) | github.com/neilol89/south-county-signal |
| HTML generation | Vanilla Node.js | No build tools, no frameworks |
| Site frontend | Vanilla HTML/CSS | Playfair Display + Source Sans 3 fonts |
| Email pipeline | Node.js (CLI scripts) + JSON | Each stage = a JSON file |
| Editorial intelligence | Claude (via skill files) | scout / curator / drafter stages can be run by AI agents |

---

## Live URLs

| URL | What it is |
|---|---|
| https://southcountysignal.com | Marketing/signup landing page |
| https://southcountysignal.com/issues/ | Archive of all issues (newest first) |
| https://southcountysignal.com/issues/issue-N | Individual issue permalink |
| https://southcountysignal.com/latest | Redirects to newest issue |

---

## Known issues / limitations

- **Ocean Mist calendar doesn't render** — known scraping issue. Cross-reference Eventbrite + Instagram. Worth manual check each week.
- **South County Tourism site returns template** — sometimes intermittent, low signal. Skip if empty.
- **Narragansett.gov town events are PDF-only** — would need a PDF scraping step.
- **Instagram + Facebook are not yet scraped** — see `Resources/SOCIAL-SCRAPING-PLAN.md` for the plan to fix this.
- **`manual-additions.json` is easy to forget to refresh** — currently still references March 19, 2026 with an "Example:" placeholder. Should be cleaned weekly.
- **`output/` and `site/` files are committed to git** — large binary churn. Consider gitignoring if/when this becomes a problem.
- **`.github/workflows/deploy-pages.yml` is dormant** — runs on every push but deploys to GitHub Pages, which the domain doesn't point at. Could be removed.

---

## Roadmap

In priority order:

1. **Social scraping** — automate the Instagram/Facebook check that currently takes ~10 min/week of manual editor time. See `Resources/SOCIAL-SCRAPING-PLAN.md`.
2. **Refresh `pipeline/manual-additions.json` template** — it's stale and confusing in its current form (literal "Example:" placeholders).
3. **`sources.json` additions** discovered during the May 7 scout: Patch (high value), Contemporary Theater Company, Surf Exchange Cafe, Misquamicut Drive-In (seasonal), Kinney Azalea Gardens (seasonal).
4. **Bump GitHub Actions versions** in `deploy-pages.yml` — Node 20 deprecation by Sept 2026 (or remove the workflow entirely since Netlify is the real deploy).
5. **Image hosting for headliner cards** — currently text-only; could pull venue photos for visual interest.
6. **Open rate / click-through analytics** — wire up Buttondown's stats feedback into the editorial loop.
7. **Sponsor/advertiser placements UI** — replace `manual-additions.json` editing with a small admin form.

---

## Brand voice

Warm, confident, irreverent, honest, local. Like your most plugged-in friend who always knows what's happening. See `Resources/02-BRAND-BIBLE.md` for the full guide.

Words to avoid: "exciting," "amazing," "incredible," "don't miss," "dear readers," "we're thrilled to announce."

---

## Adding event sources

Edit `pipeline/sources.json`. The scout reads it dynamically each run. You can add:
- `web_sources` — URLs to fetch directly
- `search_queries` — broader web searches to run
- `manual_check_sources` — Instagram/Facebook accounts that require human review

Once a source is in `sources.json`, the scout will pick it up next time without code changes.

---

## Contact

This is a one-person operation run by Neil Bryant. For editorial questions or partnership inquiries: hello@southcountysignal.com.
