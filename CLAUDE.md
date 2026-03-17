# The South County Signal

A free weekly email newsletter curating the best events, food, music, nightlife, and things to do in Southern Rhode Island. Sends every Thursday at 8:30 AM EST via Beehiiv.

## Project Structure

```
pipeline/          — Working files, regenerated weekly
  sources.json     — Dynamic list of event sources (venues, calendars, aggregators)
  manual-additions.json — Editorial overrides, advertiser placements, forced items
  raw-events.json  — Output of scout (raw scraped events)
  curated-events.json — Output of curator (ranked, filtered selections)
  draft-content.json — Output of drafter (written newsletter content)
assets/            — Templates and reference files
  newsletter-template.html — The HTML email template
scripts/           — Generation and API scripts
  generate-newsletter.js — Assembles JSON content into HTML
  beehiiv-client.py — Beehiiv API wrapper
output/            — Generated newsletter HTML (issue-X.html)
archive/           — Past issues
Resources/         — Planning docs, skill files, brand bible
```

## Weekly Workflow

1. **Scout**: Scrape event sources → `pipeline/raw-events.json`
2. **Manual additions**: Editor adds advertiser placements and editorial overrides to `pipeline/manual-additions.json`
3. **Curate**: Rank and filter events → `pipeline/curated-events.json`
4. **Draft**: Write all newsletter sections → `pipeline/draft-content.json`
5. **Assemble**: `node scripts/generate-newsletter.js` → `output/issue-X.html`
6. **Send**: Paste HTML into Beehiiv, schedule for Thursday 8:30 AM

## Key Commands

- **Scout events**: Read `pipeline/sources.json`, fetch all web sources, run search queries, merge with manual-additions.json, output raw-events.json
- **Curate this week**: Read raw-events.json, apply curator skill logic, output curated-events.json
- **Draft the newsletter**: Read curated-events.json, apply drafter skill logic, output draft-content.json
- **Generate HTML**: `node scripts/generate-newsletter.js --content pipeline/draft-content.json --template assets/newsletter-template.html --output-dir output/`

## Brand Voice

Warm, confident, irreverent, honest, local. Like your most plugged-in friend who always knows what's happening. See `Resources/02-BRAND-BIBLE.md` for full guidelines.

## Adding Event Sources

Edit `pipeline/sources.json` to add or remove venues, calendars, or search queries. The scout reads this file dynamically each run.
