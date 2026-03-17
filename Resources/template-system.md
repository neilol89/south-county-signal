# Newsletter Template System

## Overview

The South County Signal uses a modular HTML template with 8 content sections. Each section has a defined purpose, format, and optional ad placement. The template is designed for email clients and renders well in Beehiiv's editor.

## Template Structure

```
┌─────────────────────────────────┐
│  HEADER                         │  Brand, tagline, date, issue #
├─────────────────────────────────┤
│  OPENER                         │  2-3 sentences, conversational hook
├─────────────────────────────────┤
│  THIS WEEK'S MOVE (Headliner)   │  1 event, featured card, CTA
│  [Sponsorable: $150-250/week]   │
├─────────────────────────────────┤
│  THE LINEUP (Roundup)           │  5-8 picks, category tagged
│  [1 Featured slot: $75-125/wk]  │
├─────────────────────────────────┤
│  MID-NEWSLETTER AD              │  Sponsor block
│  [$150/week]                    │
├─────────────────────────────────┤
│  FOOD & DRINK SPOTLIGHT         │  1 restaurant/bar profile
│  [Primary paid feature: $100-200]│
├─────────────────────────────────┤
│  WORTH THE DRIVE (Providence)   │  1-2 PVD events (optional)
├─────────────────────────────────┤
│  INSIDER DEAL                   │  1 deal with code
│  [Paid placement: $50-100/wk]   │
├─────────────────────────────────┤
│  SIGNAL NOISE                   │  Hot take / poll / debate
├─────────────────────────────────┤
│  FOOTER                         │  Social, CTA, sponsor, unsub
│  [Footer sponsor: $75-100/wk]   │
└─────────────────────────────────┘
```

## Section Specifications

### 1. Header
- **Brand name**: "THE SOUTH COUNTY SIGNAL"
- **Tagline**: "Your Weekly Cheat Sheet for Southern RI"
- **Date line**: "Week of [DATE] · Issue #[NUMBER]"
- Colors: Deep ocean blue (#1B4965) background, off-white text, gold (#D4A843) tagline

### 2. Opener
- **Length**: 2-3 sentences
- **Tone**: Conversational, warm, insider-y
- **Content**: Reference weather, season, local vibe, trending topic
- **No links** in this section

### 3. This Week's Move (Headliner)
- **Length**: 3-4 sentence description
- **Fields**: Event name, date, time, venue, town, description, link
- **Visual**: Dark card (ocean blue bg) with gold accents
- **CTA button**: "Get Details →"
- **Sponsor tag** (optional): "Presented by [SPONSOR]"

### 4. The Lineup (Roundup)
- **Count**: 5-8 events
- **Per event**: Category tag, name (linked), date/time, venue/town, 1-2 sentence description
- **Categories** (with CSS classes):
  - `music` — Live Music / DJ (purple #6B3FA0)
  - `food` — Food & Drink (red #C4572A)
  - `outdoor` — Beach & Outdoor (green #2E7D4F)
  - `arts` — Arts & Culture (gold #B8860B)
  - `nightlife` — Nightlife (magenta #8B2252)
  - `family` — Family Friendly (blue #3A7CA5)
  - `wellness` — Fitness & Wellness (sage #5F8575)
- **One sponsored slot** allowed, marked with "Featured" tag

### 5. Mid-Newsletter Ad
- **Format**: Bordered card, centered, "Our Sponsor" label
- **Content**: 2-3 sentences + link
- Remove entire section if unsold

### 6. Food & Drink Spotlight
- **Length**: 3-4 sentences
- **Fields**: Name, town/location, description
- **Visual**: Warm gradient card with gold left border
- **Focus**: What makes it worth going NOW

### 7. Worth the Drive (Providence)
- **Count**: 1-2 events maximum
- **Per event**: Name, date/time, venue, 1-2 sentence description
- **Badge**: "Providence" tag
- **CRITICAL**: Omit this entire section if nothing qualifies. Don't force it.

### 8. Insider Deal
- **Fields**: Business name, offer headline, details/restrictions, code
- **Visual**: Dark card (ocean blue) with deal code in dashed border box
- **Deal code format**: `CODE: [SIGNAL20]`

### 9. Signal Noise
- **Format**: Rotating — hot take, poll, debate, reader question
- **Length**: 1-2 sentences + interactive element
- **Poll buttons**: 2-3 options, linked to poll tool or mailto
- **Purpose**: Community building, engagement, reply generation

### 10. Footer
- Social links (Instagram, Facebook, TikTok)
- "Know something we should feature? Hit reply."
- "Advertise With Us" button
- Footer sponsor slot
- Preferences / Unsubscribe / View in Browser links

## Content JSON Schema

When generating a newsletter from structured data, expect this format:

```json
{
  "issue_number": 15,
  "week_of": "March 19, 2026",
  "opener": "The ocean hit 68° this week...",
  "headliner": {
    "name": "Summer Solstice Beach Party",
    "date": "Saturday, June 21",
    "time": "4:00 PM - 10:00 PM",
    "venue": "Scarborough State Beach",
    "town": "Narragansett",
    "description": "Description text here...",
    "link": "https://...",
    "sponsor": null
  },
  "lineup": [
    {
      "category": "music",
      "category_label": "Live Music",
      "name": "Roots & Blues Night",
      "date": "Friday, March 20",
      "time": "8:00 PM",
      "venue": "The Ocean Mist",
      "town": "Matunuck",
      "description": "Description...",
      "link": "https://...",
      "sponsored": false
    }
  ],
  "mid_ad": {
    "sponsor_name": "Narragansett Beer",
    "copy": "Ad copy here...",
    "link": "https://..."
  },
  "spotlight": {
    "name": "Matunuck Oyster Bar",
    "town": "South Kingstown",
    "location_detail": "Succotash Road, right on the water",
    "description": "Description..."
  },
  "pvd_events": [
    {
      "name": "Providence Food Truck Festival",
      "date": "Saturday, March 22",
      "time": "11:00 AM - 6:00 PM",
      "venue": "Kennedy Plaza",
      "description": "Description..."
    }
  ],
  "deal": {
    "business": "Perks & Corks",
    "offer": "Buy One Get One Free Craft Cocktails",
    "details": "Valid Mon-Thu through March 31. Show this email.",
    "code": "SIGNAL2FOR1"
  },
  "signal_noise": {
    "type": "poll",
    "question": "Best lobster roll in South County?",
    "options": ["Aunt Carrie's", "Matunuck Oyster Bar", "Champlin's"]
  },
  "ads": {
    "headliner_sponsor": null,
    "mid_sponsor": { "name": "Narragansett Beer", "copy": "...", "link": "..." },
    "footer_sponsor": { "name": "South County Tourism", "copy": "..." }
  }
}
```

## Generating HTML from JSON

The assembly process:
1. Load the base HTML template from `assets/newsletter-template.html`
2. Replace all `[PLACEHOLDER]` tokens with content from the JSON
3. For sections with null/empty content (e.g., `pvd_events: []`), remove the entire section div
4. For unsold ad slots (`null`), remove the sponsor tags or entire ad sections
5. Validate the final HTML (no remaining `[PLACEHOLDER]` tokens)
6. Output to a file or clipboard for pasting into Beehiiv

## Email Subject Line Formula

Format: `[Hook] + [Count/Promise] + [Emoji]`

Examples:
- "This Week's Move: Live Music at The Mist 🎵"
- "8 Things to Do This Weekend in South County 🌊"
- "The Insider Deal You'll Want to Use Before Saturday 🍹"
- "Summer's Here Early — Your Weekend Cheat Sheet ☀️"

Preview text formula: "Plus [X] more events, [deal mention], and [Signal Noise tease]"
