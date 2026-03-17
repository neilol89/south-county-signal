---
name: scs-curator
description: "Curate and rank raw event data for The South County Signal weekly newsletter. Use this skill whenever you need to: filter and rank a list of local events for Southern Rhode Island, select a headliner event from a batch of candidates, assign event categories (music, food, outdoor, arts, nightlife, family, wellness), ensure geographic and category diversity in a weekly newsletter lineup, evaluate whether Providence events are 'worth the drive', or generate a structured curated-events.json from raw scraped event data. Also trigger this skill when the user says 'curate this week', 'pick the lineup', 'what's the headliner', 'rank these events', 'filter events for the Signal', or provides a raw event list and wants newsletter-ready selections."
---

# SCS Curator — Event Curation for The South County Signal

## Overview

This skill transforms a raw list of 15–30 scraped local events into a curated, ranked, newsletter-ready selection of 8–12 picks. It applies the South County Signal's editorial criteria to select a headliner, build a diverse lineup, identify Providence "worth the drive" candidates, and suggest Insider Deal and Signal Noise topics.

The curator does NOT write newsletter copy — that's the drafter skill's job. The curator selects and structures. Think of it as the editorial meeting where you decide what goes in the issue.

## Inputs

The curator expects one of these:

1. **A `raw-events.json` file** — structured array of scraped events (preferred)
2. **A pasted list of events** — unstructured text the user dumps in (the skill normalizes it)
3. **A URL or file path** — pointing to event data to be loaded

### Raw Event Schema (expected input per event)

```json
{
  "source": "unitedtheatre.org",
  "name": "Roots Music Stomp ft. Austin Scelzo",
  "date": "2026-03-20",
  "day_of_week": "Friday",
  "time": "8:00 PM",
  "venue": "United Theatre",
  "town": "Westerly",
  "description_raw": "Original description scraped from source...",
  "link": "https://...",
  "is_free": false,
  "price_range": "$15-20",
  "geo": "south_county"
}
```

If the input is unstructured text, normalize it into this schema before proceeding.

## Curation Process

Follow these steps in order:

### Step 1: Clean & Deduplicate

- Remove events that have already passed (compare dates to today)
- Remove events outside the target week (this Thursday through next Wednesday)
- Merge duplicates (same event listed on multiple platforms — keep the best link/description)
- Flag any events with missing critical fields (date, venue, or town) and attempt to fill from context

### Step 2: Categorize

Assign each event exactly one primary category:

| Category | Slug | Matches |
|----------|------|---------|
| Live Music | `music` | Concerts, open mics, DJ nights, music festivals, album releases |
| Food & Drink | `food` | Happy hours, wine dinners, tastings, food festivals, pop-ups, new menu launches |
| Beach & Outdoor | `outdoor` | Surf events, beach cleanups, paddleboard, farmers markets, hikes, bike rides |
| Arts & Culture | `arts` | Gallery openings, theater, comedy shows, film screenings, literary events, museum exhibits |
| Nightlife | `nightlife` | Bar events, trivia, karaoke, dance nights, themed bar nights |
| Family Friendly | `family` | Events that work well for adults with kids (not just "kids stuff") |
| Fitness & Wellness | `wellness` | Outdoor yoga, group runs, fitness classes, wellness workshops |

When an event could fit multiple categories, pick the one that best serves lineup diversity. For example, "trivia at a brewery" could be `food` or `nightlife` — check what categories you're short on.

### Step 3: Score & Rank

Score each event 1–10 on these weighted criteria:

| Criterion | Weight | Description |
|-----------|:---:|-------------|
| Uniqueness | 30% | Is this special or is it a generic recurring event? Themed nights, limited tickets, notable performers, seasonal specials score high. "Monday trivia" scores low unless there's something special about it. |
| Appeal breadth | 25% | Would this interest a wide range of Signal readers? Niche events can still score well if they're genuinely compelling. |
| Timeliness | 20% | Is this time-sensitive? Opening nights, last chance, seasonal first, holiday-adjacent events score higher. |
| Venue quality | 15% | Established, beloved, or notable venues score higher. A known quantity like Ocean Mist, United Theatre, or Matunuck Oyster Bar gets a boost. |
| Social potential | 10% | Would someone share this or talk about it? Instagram-worthy moments, conversation starters, and "I was there" events score high. |

### Step 4: Select the Lineup

Apply these rules to build the final selections:

**Headliner ("This Week's Move"):**
- The single highest-scoring event, with a bias toward events that have a compelling narrative hook
- Should be something where you can write 3–4 sentences with personality
- If two events score similarly, prefer the one on Friday or Saturday (weekend = more people can go)

**Lineup (5–8 picks):**
- Select the next highest-scoring events after the headliner
- Enforce **category diversity**: minimum 4 different categories. If you have 3 music events and 0 outdoor events, drop the weakest music pick.
- Enforce **geographic spread**: no more than 3 events from the same town. South County is Narragansett, Wakefield/South Kingstown, Westerly, Charlestown, North Kingstown, East Greenwich, Wickford.
- Include at least 1 family-friendly event per issue (but it should still appeal to adults)
- Maximum 2 events at the same venue

**Providence picks ("Worth the Drive"):**
- Events with `geo: "providence"` — only include if they score 7+ AND there's no equivalent in South County
- Maximum 2 Providence picks per issue
- If nothing qualifies, output an empty array — skipping this section is better than forcing it

**Insider Deal candidate:**
- Flag any event that involves a deal, discount, special offer, or promotion
- Or suggest a relevant local business that could offer a deal tied to the week's theme

**Signal Noise candidate:**
- Suggest 1–2 poll/debate topics inspired by this week's content
- Format: question + 3–4 short options
- Keep it fun, local, and engagement-friendly

### Step 5: Output

Generate a `curated-events.json` file matching this schema. Read `references/output-schema.md` for the complete schema definition.

```json
{
  "issue_week": "March 19, 2026",
  "curated_at": "2026-03-16T09:00:00Z",
  "headliner": { "...event object with score and selection_reason..." },
  "lineup": [ "...5-8 event objects with scores..." ],
  "pvd_events": [ "...0-2 providence picks..." ],
  "deal_candidate": { "...suggested deal or null..." },
  "signal_noise_candidates": [ "...1-2 poll/debate suggestions..." ],
  "dropped": [ "...events that were considered but cut, with reason..." ],
  "diversity_check": {
    "categories_used": ["music", "food", "outdoor", "arts", "nightlife", "family"],
    "towns_represented": ["Westerly", "Matunuck", "Narragansett", "Charlestown"],
    "weekend_vs_weekday": "5 weekend / 3 weekday"
  }
}
```

Always include the `dropped` array with brief reasons — this helps the human editor understand what was left on the floor and override if needed.

Always include the `diversity_check` object — this is a self-audit that makes it easy to spot if the lineup is lopsided.

## Geographic Context

For category and selection purposes, here's the South County geography:

**Core towns (always relevant):**
- Narragansett (includes Point Judith, Galilee, Scarborough, Bonnet Shores)
- South Kingstown (includes Wakefield, Matunuck, Peace Dale, Kingston)
- Westerly (includes Watch Hill, Misquamicut)
- Charlestown (includes Ninigret Park, Quonochontaug)

**Extended coverage:**
- North Kingstown (includes Wickford)
- East Greenwich
- Exeter / West Kingston (URI area)

**Worth the Drive only:**
- Providence
- Newport (rare — truly exceptional events only)

## Edge Cases

**Slow weeks:** If the raw event list has fewer than 10 events (common in January/February), lower the lineup target to 4–5 picks. Quality over quantity. Never pad with weak events.

**Festival/holiday weeks:** If there's one dominant event (e.g., Rhythm & Roots, 4th of July), it's fine to make it the headliner and have the lineup be supporting acts/parties/events around it.

**All events from one source:** If a single source dominates the raw list, search for supplementary events from other sources before curating. The lineup shouldn't look like a single venue's calendar.

## Reference Files

- `references/output-schema.md` — Complete JSON schema for curated output with field descriptions
- `references/venues.md` — Known South County venues with location, vibe, and typical event types
