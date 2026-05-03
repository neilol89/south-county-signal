# Scouting Runbook — The South County Signal

**Purpose:** This is the step-by-step playbook for finding events each week. It's designed to be repeatable by anyone (or any AI) with no prior context. Follow it top to bottom.

**When to run:** Every Monday (or early in the week). Output goes to `pipeline/raw-events.json`.

---

## Step 1: Determine the Target Week

Figure out the upcoming Thursday-to-Wednesday range. For example, if today is Monday March 18, the target week is **March 18-24, 2026**. All events should fall within this window (plus notable items worth teasing for the following week).

---

## Step 2: Fetch Web Sources

Read `pipeline/sources.json` for the full source list. Fetch each URL using the prompt specified in the source entry. **Prioritize in this order: high → medium → low.** Run fetches in parallel when possible.

### Tier 1 — High Priority (always fetch these)

| Source | URL | Town | What to look for |
|--------|-----|------|------------------|
| **United Theatre — Coming Soon** | unitedtheatre.org/coming-soon-events/ | Westerly | Concerts, dance nights, film events, SoupyFest series |
| **United Theatre — Now Playing** | unitedtheatre.org/now-playing/ | Westerly | Current films with showtimes |
| **Pump House Music Works** | pumphousemusicworks.com/event-calendar | Wakefield | Live music, all ages. Reliable calendar. |
| **Greenwich Odeum** | greenwichodeum.com/calendar/ | East Greenwich | Major concerts, classic film screenings, comedy |
| **Ocean Mist** | oceanmist.net/live-music-and-events/ | Matunuck | Live music, nightlife. **Calendar often fails to render** — use Eventbrite as fallback |
| **Eventbrite — Narragansett** | eventbrite.com/d/ri--narragansett-pier/events--this-week/ | Various | Broad coverage. Catches events from smaller venues too. |
| **Narragansett Chamber** | narragansettcoc.com/event-calendar/ | Narragansett | Community events, restaurant week, seasonal events |
| **South County Tourism** | southcountyri.com/events/ | Various | Aggregator. Sometimes returns empty template — try anyway. |

### Tier 2 — Medium Priority

| Source | URL | Town | What to look for |
|--------|-----|------|------------------|
| **Ocean Mist — Box Office** | oceanmist.net/live-music-and-events-1/ | Matunuck | Fallback for main Ocean Mist page |
| **Eventbrite — South Kingstown** | eventbrite.com/d/ri--south-kingstown/events--this-weekend/ | Various | Weekend-specific events |
| **Courthouse Center for the Arts** | courthousearts.org | South Kingstown | Performances, exhibits. Season runs ~March-May. |
| **Ocean Chamber (Westerly)** | oceanchamber.org/events | Westerly | Community events, business events, theatre |

### Tier 3 — Low Priority / Worth the Drive

| Source | URL | Town | What to look for |
|--------|-----|------|------------------|
| **GoProvidence** | goprovidence.com/events/ | Providence | Only include events worth a 30-45 min drive |
| **Visit Rhode Island** | visitrhodeisland.com/events/ | Various | Filter for South County / Washington County |

### Known Issues & Workarounds

- **Ocean Mist calendar** rarely renders. Always cross-reference with Eventbrite. Also check Instagram (@oceanmistbar).
- **South County Tourism** page sometimes returns only template code. Try anyway but don't rely on it.
- **Eventbrite** is the best fallback for any venue whose own site doesn't render.
- **Greenwich Odeum** doesn't always show ticket prices or times on the calendar page. May need to click into individual events.

---

## Step 3: Run Web Searches

Run these searches (append current month/year to each):

1. `South County Rhode Island events this week [Month Year]`
2. `Westerly Rhode Island events this weekend [Month Year]`
3. `Narragansett Rhode Island events this weekend [Month Year]`
4. `Wakefield South Kingstown RI events this week [Month Year]`
5. `Charlestown Rhode Island events [Month Year]`
6. `East Greenwich Rhode Island events this week [Month Year]`

For any promising results not already covered by web sources, fetch the page and extract event details.

---

## Step 4: Check for New Venues & Sources

While scouting, watch for:
- **New venue names** appearing in Eventbrite or search results that aren't in `sources.json`
- **New recurring event series** at known venues
- **New aggregator pages** or community calendars

Log any discoveries in `raw-events.json` under `new_sources_discovered`. If a new venue has a reliable calendar page, add it to `sources.json` for next week.

### Recently Discovered (add more as found):
- **Pump House Music Works** (Wakefield) — discovered 2026-03-18. Active live music venue, reliable website.
- **Greenwich Odeum** (East Greenwich) — discovered 2026-03-18. Historic theatre, major acts.
- **NURTURE Holistic Wellness** (East Greenwich) — wellness events via Eventbrite.

---

## Step 5: Manual Instagram Checks (Human Required)

These accounts post events to Instagram only — no web calendar. **The human editor should quick-check these (~10 min):**

| Account | What to look for |
|---------|-----------------|
| **@oceanmistbar** | Weekly live music lineup, trivia nights, specials |
| **@matunuckoysterbar** | Events, seasonal specials, live music |
| **@coastguardhouseri** | Seasonal events (skip if between chefs/off-season) |
| **@perksandcorks** | Wine tastings, wine dinners |
| **@fantasticumbrellafactory** | Markets, artisan events |
| **@themaltedbarleys** | Trivia nights, live music |
| **Facebook Groups** | "South County RI Community", "Narragansett Neighbors", "Westerly/Pawcatuck Area" — auth wall, manual only |

Add any events found to `pipeline/manual-additions.json` or tell the scout to include them.

---

## Step 6: Merge Manual Additions

Read `pipeline/manual-additions.json` if it exists. This file contains:
- **Forced lineup items** — advertiser placements that must appear
- **Forced spotlight / deal / signal noise** — editorial overrides
- **Editorial notes** — guidance for the curator (e.g., "skip Coast Guard House this week")

Merge these into the raw events with `"forced": true` and `"sponsored": true` as appropriate.

---

## Step 7: Deduplicate

Before outputting, scan for duplicates:
- Same event name + same venue = duplicate (keep the version with most detail)
- Same performer + same venue + same date = duplicate
- Eventbrite listing that also appeared on venue's own site = keep venue site version

---

## Step 8: Output

Write `pipeline/raw-events.json` following the schema documented in `Resources/scs-scout-SKILL.md`. Include:
- All raw events with structured fields
- Source status (success/failed/partial)
- Editorial notes
- Upcoming notable events worth teasing
- New sources discovered
- Sources needing manual check
- Scout summary stats

---

## Step 9: Report

Print a summary for the editor:
```
SCOUT COMPLETE — Week of [dates]
Found: X events from Y sources
Failed: Z sources (list them)
Headliner candidates: N flagged
Needs your check: Instagram accounts + Facebook groups (~10 min)
New sources found: (list any)
Next step: Review raw-events.json, then run the curator.
```

---

## Tips for Good Scouting

- **Cast a wide net.** The curator's job is to filter. The scout's job is to not miss things.
- **Flag headliner candidates** — events that are unique, have a narrative hook, or would get someone off the couch.
- **Note urgency** — "almost sold out", "last weekend", "first time ever" — these help the drafter write compelling copy.
- **Capture next-week teasers** — if something big is coming up the following week, note it so we can tease it.
- **Update sources.json** after each scout with any new reliable sources discovered.
- **Seasonal awareness** — farmers markets (May-Oct), beach events (June-Sept), holiday markets (Nov-Dec). Adjust search queries seasonally.
