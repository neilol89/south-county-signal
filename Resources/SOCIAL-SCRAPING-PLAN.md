# Social Scraping Plan — Instagram & Facebook

**Status:** Planning. Nothing built yet.
**Last updated:** 2026-05-03
**Owner:** Neil

---

## The problem

A handful of South County venues post their event lineups *only* to Instagram (mostly Stories, sometimes feed) or Facebook (often Pages, sometimes Groups). Today the scout flags these in `sources_that_need_manual_check` and the editor checks them by hand each week.

Today's manual-check list (~10 min/week of human time):

| Account | Platform | Why we want it |
|---|---|---|
| @oceanmistbar | Instagram | Weekly band lineup (their website calendar is broken) |
| @matunuckoysterbar | Instagram | Specials, events, seasonal menu changes |
| @coastguardhouseri | Instagram | Seasonal events when they're between chefs |
| @perksandcorks | Instagram | Wine tastings and dinners |
| @fantasticumbrellafactory | Instagram | Markets, artisan events |
| @themaltedbarleys | Instagram | Trivia nights, live music |
| South County RI Community | Facebook Group | Community-posted events (auth wall) |
| Narragansett Neighbors | Facebook Group | Community events |
| Westerly/Pawcatuck Area | Facebook Group | Community events |

**What "good" looks like:** every week, those accounts have produced new event content; that content has been extracted as structured JSON and merged into `pipeline/raw-events.json` ready for the curator. Editor time on this drops from ~10 min to under 2 min.

---

## Why this is harder than scraping a website

**Instagram:**
- The official Graph API only works for accounts you own (Business/Creator) — useless for scraping competitors.
- Public profile HTML is JS-rendered and rate-limited. Anonymous scraping breaks every few weeks when Meta changes the page.
- Stories (24-hour ephemeral) require a logged-in account to view — so any Stories scraper has to authenticate, which violates Instagram's ToS and gets accounts banned.
- Libraries like `instagrapi` work but are explicitly against ToS and unreliable.

**Facebook:**
- Pages: harder than Instagram. The Graph API closed off most public-page access in 2018.
- Groups: behind an auth wall. No anonymous scraping at all.
- Marketplace/Events APIs: deprecated or restricted to advertisers.

**The bottom line:** there's no clean "always works, free, ToS-compliant, fully automated" path for either platform. Every option has a tradeoff between cost, reliability, and effort.

---

## Three tiers of approach

### Tier 1 — Screenshot + AI vision (recommended first)

**How it works:**
1. Editor opens IG/FB on phone, takes 6–10 screenshots of relevant feeds/Stories (~2 min)
2. Screenshots get dropped into a folder (or emailed via iPhone Shortcut)
3. A script runs Claude's vision API over each image, extracts events into structured JSON
4. Output gets merged into `pipeline/raw-events.json` (or `manual-additions.json`)

**Pros:**
- Doesn't violate any ToS (humans take screenshots all the time)
- Reliable — Instagram can't break "looking at a screenshot"
- Captures Stories (which the editor already views logged in)
- Cost: a few cents per scout (~$0.50/month)
- Implementable in 1-2 hours

**Cons:**
- Still requires the human to take screenshots (the part that costs time)
- But: the *cognitive* load drops — no transcribing dates, no formatting venue names, no manually copying descriptions

**Honest assessment:** this is the best 80/20 solution. The screenshots step is the irreducible human cost; everything after that gets automated.

### Tier 2 — Paid scraping service (Apify, Bright Data, Phantombuster)

**How it works:**
- Sign up for Apify or similar
- Pick an "actor" (pre-built scraper) like "Instagram Profile Scraper" or "Facebook Page Posts"
- Configure target accounts and schedule
- Apify handles the cat-and-mouse with Meta and delivers JSON

**Pros:**
- Fully automated (zero human time)
- They handle the breakage when Meta changes things
- Decent reliability (~95%+ uptime on most actors)

**Cons:**
- Costs $20–50/month for a handful of accounts at weekly cadence
- Stories typically NOT included (still public-feed only on most actors)
- Some legal grey area — Meta's ToS forbids scraping; lawsuits have happened against scraping services. As a small newsletter you're not a target, but it's not zero risk.
- Still need to filter their raw output for "is this an event" vs. promotional/personal posts

**When to consider:** When the project has 1,000+ subscribers and the editor's time is the bottleneck. Probably not at the current stage.

### Tier 3 — Direct scraping with `instagrapi` etc. (avoid)

**How it works:** Run a Python lib that mimics a logged-in IG client. Authenticates with a real account.

**Why avoid:**
- Explicitly violates IG ToS
- Account gets shadow-banned or permanently banned
- Breaks every few weeks anyway
- If the project ever wants to use IG officially (ads, shop, business profile), having a banned-from-scraping history is bad

Don't go here.

---

## Recommended plan: Build Tier 1 in 3 phases

### Phase 1 (this week, ~2 hours)

Build the screenshot-to-JSON pipeline.

**Files to create:**
- `scripts/extract-from-screenshots.js` — reads images from `pipeline/social-screenshots/`, sends to Claude vision API, writes structured events to `pipeline/social-events.json`
- `pipeline/social-screenshots/` — gitignored folder where the editor drops images
- `pipeline/social-events.json` — structured output (matching `raw_events` schema in the scout's output)
- Update `scripts/deploy-netlify.py` workflow doc to mention this
- Update `Resources/SCOUTING-RUNBOOK.md` to reference this step

**Editor workflow:**
1. Sunday or Monday: open each manual-check account on phone
2. Screenshot any post/Story that looks event-y
3. AirDrop or sync screenshots to laptop into `pipeline/social-screenshots/`
4. Run `node scripts/extract-from-screenshots.js`
5. Review `pipeline/social-events.json` and merge interesting items into `pipeline/raw-events.json` (or trust the merge automatically)

**Cost estimate:** $0.01–0.03 per screenshot via Claude vision API. ~10 screenshots/week = $0.10–0.30/week.

### Phase 2 (when Phase 1 is reliable, ~1 hour)

Streamline the screenshot-collection step.

**Option A (iPhone Shortcut):** Create an iPhone Shortcut that prompts "take screenshot, label which account it's from, send to laptop." Reduces friction from "remember to AirDrop" to "tap once."

**Option B (Email-to-folder):** Set up a dedicated email address (e.g., `signal-scrape@yourdomain.com`) that auto-saves attachments to a Dropbox/Drive folder synced to `pipeline/social-screenshots/`. Editor emails screenshots from phone.

**Option C (Just a shared iCloud folder):** iCloud Drive folder synced to laptop. Editor drops screenshots into "Photos > Signal Scout" album, an Automator script copies to laptop folder.

Pick one based on what feels lowest friction.

### Phase 3 (deferred until subscriber count justifies cost)

Evaluate Apify or similar for fully-automated coverage of the public feeds. Keep screenshot workflow for Stories.

**Trigger to revisit:** when subscriber count > 1,000 or when editor reports "screenshots are the bottleneck."

---

## Implementation sketch — Phase 1

### Schema for `pipeline/social-events.json`

```json
{
  "extracted_at": "2026-05-03T18:00:00Z",
  "screenshot_count": 8,
  "events": [
    {
      "name": "Wine Down Wednesday",
      "date": "Wednesday, May 13",
      "time": "5:00 PM",
      "venue": "Perks & Corks",
      "town": "Westerly",
      "description": "Half-off select wines and a cheese flight, all night.",
      "source": "instagram:@perksandcorks",
      "source_screenshot": "perks-001.jpg",
      "confidence": "high",
      "category_suggestion": "food",
      "notes": "Story post, ephemeral"
    }
  ],
  "skipped": [
    {
      "screenshot": "ocean-mist-002.jpg",
      "reason": "Promotional post, not a specific event"
    }
  ]
}
```

### Pseudocode for `scripts/extract-from-screenshots.js`

```js
// 1. Read all image files from pipeline/social-screenshots/
// 2. For each image:
//    - Read as base64
//    - Send to Claude API (claude-haiku-4-5 — cheaper, fast, vision-capable)
//    - Prompt: "Extract any event listings from this Instagram/Facebook screenshot.
//       Return JSON with date, time, venue, description. If this is a promotional
//       post (no specific event), return null."
//    - Parse the response
// 3. Write all extracted events to pipeline/social-events.json
// 4. Move processed screenshots to pipeline/social-screenshots/processed/
// 5. Print summary: "Extracted N events from M screenshots, skipped K."
```

### Prompt to use with Claude vision

```
You are extracting event listings from a social media screenshot for a local
events newsletter in South County, Rhode Island.

The screenshot is from one of these accounts: @oceanmistbar, @matunuckoysterbar,
@coastguardhouseri, @perksandcorks, @fantasticumbrellafactory, @themaltedbarleys,
or a similar South County venue.

Extract any specific upcoming events you can see. Return JSON in this format:

{
  "is_event": true | false,
  "events": [
    {
      "name": "...",
      "date": "Day, Month Date" (or null if unclear),
      "time": "..." (or null),
      "venue": "..." (the venue's name),
      "town": "..." (best guess),
      "description": "1-2 sentences",
      "category": "music | food | nightlife | arts | outdoor | family | wellness",
      "confidence": "high | medium | low"
    }
  ]
}

If the screenshot shows a promotional post, a personal photo, or non-event content,
return { "is_event": false, "events": [] }.

If a date is shown like "FRIDAY 5/8" assume the current year (2026) unless context
indicates otherwise. Today is [DATE_TODAY].
```

---

## Open questions

1. **Should `social-events.json` auto-merge into `raw-events.json` or stay separate?**
   - Auto-merge: less editor effort, but harder to audit what came from where
   - Separate: editor reviews and copies in, clearer provenance
   - **Recommendation:** keep separate for Phase 1. Revisit after 4-6 weeks of use.

2. **What's the OCR fallback for low-quality screenshots?**
   - Claude vision is robust, but if it consistently fails on a venue's font/style, we may need to flag those screenshots for manual entry.

3. **Where do Facebook Groups fit in?**
   - Same screenshot workflow works. The editor is already in those groups; screenshots are equally feasible.

4. **Multiple events in one screenshot?**
   - The schema supports it (`events` is an array). The prompt handles it. Should be fine.

5. **What if the venue posts a flyer image in their post?**
   - Claude vision reads text in flyers reliably. Works the same way.

6. **Should we cache the extraction results?**
   - If we re-run the script on the same screenshots, we'd re-pay the API cost and might get slightly different results. Worth adding a cache keyed on file hash. Phase 1.5 nice-to-have.

---

## Cost summary

| Approach | Setup time | Weekly time | Monthly cost |
|---|---|---|---|
| Current (manual transcribing) | 0 | ~10 min | $0 |
| Tier 1 (screenshot + AI) | ~2 hr | ~2 min screenshots + auto-extract | ~$0.50 |
| Tier 2 (Apify) | ~1 hr | 0 | $20–50 |
| Tier 3 (instagrapi) | ~3 hr | breakage debugging | $0 + ToS risk |

---

## Decision

**Go with Tier 1 (screenshot + AI vision).** Build it next. Re-evaluate Tier 2 once subscribers > 1,000.
