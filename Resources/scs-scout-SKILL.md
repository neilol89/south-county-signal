---
name: scs-scout
description: "Scout and scrape event data from South County RI venues, calendars, and aggregators for The South County Signal newsletter. Use this skill when the user says 'scout events', 'find events this week', 'scrape this week', 'what's happening in South County', 'run the Monday scout', or any variation of gathering raw event data for the newsletter pipeline. This skill reads pipeline/sources.json for the current source list, fetches events from all reachable web sources, runs supplementary web searches, merges with pipeline/manual-additions.json for advertiser and editorial overrides, and outputs pipeline/raw-events.json ready for the curator skill."
---

# SCS Scout — Event Scouting for The South County Signal

## Overview

This skill automates the Monday morning event scouting step. It scrapes venue websites, event calendars, and aggregator platforms across South County Rhode Island, then combines everything with manual editorial additions into a structured `raw-events.json` file.

The scout does NOT curate or rank — that's the curator skill's job. The scout casts a wide net and captures everything worth considering.

## Inputs

The scout reads two files from the pipeline directory:

1. **`pipeline/sources.json`** — The dynamic source list. Contains web URLs to fetch, search queries to run, and manual-check sources to flag. This file is updated over time as venues open/close or new sources are discovered.

2. **`pipeline/manual-additions.json`** (optional) — Editorial overrides from the human editor. Contains forced lineup items (advertiser placements), forced spotlight/deal/signal noise, and editorial notes that guide curation.

## Scouting Process

Follow these steps in order:

### Step 1: Load Sources

Read `pipeline/sources.json`. This file contains three sections:

- **`web_sources`** — URLs to fetch with WebFetch. Each has a name, URL, extraction prompt, priority, town, and expected categories.
- **`search_queries`** — General web searches to run with WebSearch for broader coverage.
- **`manual_check_sources`** — Instagram accounts and Facebook groups that require human checking. These are NOT fetched — they're listed in the output as a reminder.

### Step 2: Fetch Web Sources

For each entry in `web_sources`:

1. Use **WebFetch** with the entry's `url` and `prompt`
2. If a fetch fails (404, timeout, empty response), log it as a failed source and continue
3. If a source has a `notes` field with a fallback URL, try the fallback
4. Extract structured event data from each successful fetch

**Fetch all high-priority sources first, then medium, then low.** Run fetches in parallel where possible for speed.

For each event extracted, capture:
- `name` — Event name
- `date` — Date (normalize to "Day, Month Date" format, e.g., "Friday, March 20")
- `time` — Start time (and end time if available)
- `venue` — Venue name
- `town` — Town (use the source's town field as default, override if the event specifies differently)
- `description` — Raw description from the source
- `link` — URL to the event page or ticket page
- `source` — Which source this came from (use the source's `name` field)
- `category_suggestion` — Best guess at category based on the source's `categories` field and event content
- `headliner_candidate` — Boolean. True if the event seems notable, unique, or has a compelling narrative hook.
- `notes` — Any additional context (ticket prices, "almost sold out", "new venue", etc.)

### Step 3: Run Web Searches

For each entry in `search_queries`:

1. Append the current month and year to the query (e.g., "South County Rhode Island events this week March 2026")
2. Use **WebSearch** to find results
3. For any promising results that aren't already covered by web_sources, use **WebFetch** to extract event details
4. Add unique events to the raw list (deduplicate against what's already been found)

### Step 4: Discover New Sources

While scouting, watch for:
- **New venues** appearing in event listings that aren't in sources.json
- **New event series** (recurring events at known venues that should be tracked)
- **New aggregator pages** that list South County events

Log any discoveries in the output under `new_sources_discovered`. The human can then decide whether to add them to sources.json.

### Step 5: Merge Manual Additions

Read `pipeline/manual-additions.json` if it exists:

1. Add all `forced_items` to the raw events list with `"source": "manual/editorial"` and `"forced": true`
2. Note any `editorial_notes` — these will be passed through to the output for the curator to consider
3. If `forced_spotlight`, `forced_deal`, or `forced_signal_noise` are set, include them in the output as-is

### Step 6: Deduplicate

Before outputting, scan for duplicates:
- Same event name at same venue = duplicate (keep the version with the most detail)
- Same performer at same venue on same date = duplicate
- Events from Eventbrite that also appeared on the venue's own site = keep venue site version (usually better link)

### Step 7: Output

Write `pipeline/raw-events.json` with this structure:

```json
{
  "scout_date": "2026-03-16",
  "scout_week": "March 16-22, 2026",
  "sources_checked": [
    { "name": "United Theatre — Coming Soon", "status": "success", "events_found": 5 },
    { "name": "Ocean Mist — Events", "status": "failed", "reason": "Calendar didn't render" },
    "..."
  ],
  "raw_events": [
    {
      "name": "Event Name",
      "date": "Saturday, March 21",
      "time": "7:30 PM",
      "venue": "Venue Name",
      "town": "Westerly",
      "description": "Raw description from source",
      "source": "unitedtheatre.org/coming-soon-events",
      "link": "https://...",
      "category_suggestion": "music",
      "headliner_candidate": true,
      "forced": false,
      "sponsored": false,
      "notes": "First event at this venue under new management"
    },
    "..."
  ],
  "manual_additions_merged": true,
  "editorial_notes": [
    "The Ocean Mist has a new breakfast menu — could be spotlight material",
    "..."
  ],
  "forced_spotlight": null,
  "forced_deal": null,
  "forced_signal_noise": null,
  "upcoming_notable": [
    {
      "name": "Event next week worth teasing",
      "date": "March 28",
      "venue": "...",
      "notes": "Could tease in this week's issue"
    }
  ],
  "new_sources_discovered": [
    {
      "name": "Pump House Music Works",
      "url": "unknown — found via Eventbrite",
      "town": "Wakefield",
      "suggestion": "Add to sources.json as venue_calendar if they have a website"
    }
  ],
  "sources_that_need_manual_check": [
    {
      "name": "Ocean Mist Instagram",
      "handle": "@oceanmistbar",
      "reason": "Website calendar didn't render — check Instagram for this week's lineup"
    },
    "..."
  ],
  "scout_summary": {
    "total_events_found": 15,
    "sources_succeeded": 8,
    "sources_failed": 2,
    "manual_additions": 1,
    "needs_human_check": 7
  }
}
```

### Step 8: Report to Human

After writing the file, print a concise summary:

```
SCOUT COMPLETE — Week of March 16-22, 2026
Found: 15 events from 8 sources
Failed: 2 sources (Ocean Mist calendar, South County Tourism)
Manual additions: 1 forced item (Shelter Harbor Inn — sponsored)
Headliner candidates: 3 flagged

NEEDS YOUR CHECK (~15 min):
- @oceanmistbar (Instagram) — website calendar didn't render
- @matunuckoysterbar — specials/events
- @perksandcorks — wine events
- Facebook groups — community events

NEW SOURCES FOUND:
- Pump House Music Works (Wakefield) — consider adding to sources.json

Next step: Review raw-events.json, then run the curator.
```

## Handling Source Changes

**Adding a source:** Edit `pipeline/sources.json` directly. Add a new entry to `web_sources`, `search_queries`, or `manual_check_sources`. The scout will pick it up on the next run.

**Removing a source:** Delete the entry from `pipeline/sources.json`. Optionally add a note to the `notes` field explaining why (e.g., "venue closed 2026-08").

**Seasonal sources:** Some sources are seasonal (e.g., farmers markets only May-October). Add a `"seasonal": "may-oct"` field to the source entry. The scout should skip sources outside their season.

## Edge Cases

**Slow week / few results:** If fewer than 8 events are found from web sources, expand web searches to include neighboring weeks and broader geographic terms. Also try fetching from low-priority sources that might normally be skipped.

**Source site redesign:** If a previously working source returns garbage or no events, log it as failed with a note suggesting the extraction prompt may need updating. Don't silently return bad data.

**Duplicate events across sources:** Eventbrite and venue sites often list the same event. Always prefer the venue's own listing (better link, more accurate details). Use event name + venue + date as the dedup key.

**Rate limiting:** If a WebFetch call is rate-limited, wait and retry once. If it fails again, log as failed and move on. Don't let one failed source block the entire scout.
