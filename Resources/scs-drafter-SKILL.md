---
name: scs-drafter
description: "Write newsletter copy for The South County Signal weekly email. Use this skill whenever you need to: write an opener, headliner description, lineup event descriptions, food/drink spotlight, Worth the Drive blurbs, Insider Deal copy, Signal Noise poll/debate, email subject lines, or preview text for the newsletter. Also trigger when the user says 'write this week's issue', 'draft the newsletter', 'write the Signal', provides a curated-events.json and wants newsletter copy, or asks you to write in the South County Signal's voice. This skill contains the complete voice guide, section-by-section writing rules, and output format for producing a draft-content.json that feeds into the HTML assembly pipeline."
---

# SCS Drafter — Newsletter Copy for The South County Signal

## Overview

This skill writes all newsletter copy for The South County Signal weekly email. It takes curated event selections (from the `scs-curator` skill or manual input) and produces publication-ready copy for every section of the newsletter.

The drafter writes in the Signal's voice: warm, confident, irreverent, local. It produces structured output that feeds directly into the HTML assembly pipeline.

## Inputs

The drafter expects:

1. **A `curated-events.json` file** — output from the curator skill (preferred)
2. **A list of pre-selected events** — with at least: name, date, time, venue, town, category, and a raw description or context for each
3. **Optional overrides** from the user: specific opener angle, spotlight restaurant, signal noise topic, sponsored content to include

If a spotlight restaurant isn't specified, the drafter should select one based on the week's content theme or flag it for the user to decide.

## Voice & Tone

Read `references/voice-guide.md` for the complete voice reference. Here's the essential summary:

**Who we sound like:** Your most plugged-in friend who lives in South County year-round. Smart but not pretentious. Opinionated but not preachy. Equally comfortable recommending a $200 tasting menu and a $5 dive bar burger.

**Core voice rules:**
- Lead with the hook, not the event name
- One sentence can be a paragraph
- Use em dashes — not semicolons
- Contractions always
- Address the reader as "you"
- Opinions are encouraged: "legitimately one of the best in the state" > "they serve Bloody Marys"
- If a section doesn't have strong enough content, skip it rather than filling it with weak copy

**Words to avoid:** "exciting," "amazing," "incredible," "don't miss," "dear readers," "we're thrilled to announce"

## Section-by-Section Writing Rules

### Section 1: THE OPENER

**Length:** 2–3 sentences
**Tone:** Conversational, seasonal, insider-y
**Content:** Reference the weather, the season, a local vibe, or a thematic hook connecting the week's events.

**Rules:**
- Write this LAST — after all other sections are done, you'll have a feel for the week's story
- No links
- No event names (save that for the sections below)
- Can reference the time of year, a local inside joke, or the general energy

**Template patterns:**

*Seasonal hook + promise:*
"[Seasonal observation]. [Local detail]. Here's what's worth your time this week."

*Weather + attitude:*
"[Weather fact] and [consequence for locals]. [Transition to the content]."

*Direct address + energy:*
"If you've been [seasonal behavior], this is your week to [action]. [What makes this week special]."

**Examples:**

Good: "The vernal equinox hits Friday and South County is already acting like it's spring. The Knick is back from its renovation hiatus, the St. Pat's energy is building all week, and if you've been hibernating since January — this is your week to come out."

Good: "First hoodie weather of the year. The tourists are gone, the locals have their beach back, and the restaurant scene gets interesting again."

Bad: "Welcome to this week's edition of The South County Signal! We're excited to share some great events with you." (Generic, corporate, zero personality)

Bad: "Hello readers! March is here and there are so many amazing things happening!" (Filler, no specificity, banned words)

---

### Section 2: THIS WEEK'S MOVE (Headliner)

**Length:** 3–4 sentences
**Tone:** Enthusiastic, specific, persuasive
**Structure:** [Why this matters] → [What makes it special] → [Who should go / what to expect] → [Urgency if applicable]

**Rules:**
- Open with the hook, not the event name (the name is in the card header above)
- Be specific — name the performers, the dish, the view, the feeling
- Include a reason to act ("sells out fast," "first one of the season," "they only do this once a year")
- Write like you're convincing a friend to come with you

**Example:**

Good: "The Knick is officially back. After months of renovations and its new partnership with the United Theatre, the legendary 91-year-old venue reopens its storied dance floor for a proper swing night with The Hoolios. This is the first public dance event under the new programming — and if you've ever set foot on that Starlight Ballroom floor, you know there's nothing else like it in South County. Dress sharp, dance hard, get there early."

Bad: "The Hoolios will be performing at the Knickerbocker Music Center. This is a swing dance night. Tickets are available." (No personality, no hook, no reason to care)

---

### Section 3: THE LINEUP (Event Descriptions)

**Length:** 1–2 sentences per event
**Tone:** Punchy, varied, opinionated

**Rules:**
- Each description should make the reader feel something — curiosity, FOMO, hunger, excitement
- Vary the sentence structure across events — don't start every one the same way
- Include at least one opinion or insider detail per description
- Don't just describe the event — sell the experience

**Variety patterns (rotate across the lineup):**

*The insider tip:* "Get there early — the Mist doesn't do reservations and the parking lot tells you everything you need to know."

*The opinion:* "The sommelier actually knows what she's talking about, which is more than we can say for most."

*The dare:* "Liquid courage is $5 during happy hour. The song book is deep. Your dignity is optional."

*The sell:* "If you like your Friday nights with fiddle strings and foot stomping, this is your room."

*The context:* "Part of the 2026 SoupyFest series — and way more interesting than the name suggests."

*The family angle:* "Kids love the emus. Adults love the gift shop. Everyone loves that it exists."

---

### Section 4: FOOD & DRINK SPOTLIGHT

**Length:** 3–4 sentences
**Tone:** Warm, specific, personal recommendation

**Rules:**
- Focus on what makes it worth going NOW — not a generic review
- Include at least one specific menu item, drink, or detail
- Write like you've been there (or researched thoroughly)
- End with a practical tip: when to go, where to sit, what to order

**Example:**

Good: "Yes, it's a beach bar. Yes, you probably already know it. But here's what you might not know: they serve breakfast daily until 2pm, the Bloody Mary is legitimately one of the best in the state, and the kitchen stays open until 10pm every night — not just summer. The deck hangs over the actual ocean. Go on a weeknight, sit at the bar, order the Benedicts, and remember why you live here."

---

### Section 5: WORTH THE DRIVE (Providence)

**Length:** 1–2 sentences per event
**Tone:** Concise, compelling — justify the drive in one line

**Rules:**
- Only write this section if the curator provided `pvd_events`
- If the array is empty, do NOT generate this section — output `null`
- The description should answer: "Why would I leave South County for this?"

---

### Section 6: INSIDER DEAL

**Length:** 3 fields: business name, offer headline, details
**Tone:** Clear, enticing, actionable

**Rules:**
- The offer headline should be punchy and scannable: "15% Off Sunday Brunch for Two"
- Details should include: validity dates, redemption method, restrictions
- The code should be memorable and Signal-branded: SIGNAL15, SIGNALMIST, etc.
- If no deal is available, output `null`

---

### Section 7: SIGNAL NOISE

**Length:** 1–2 sentences + poll options
**Tone:** Playful, provocative, community-building

**Rules:**
- The question should be something people have opinions about
- Keep it local — South County references, venue debates, food comparisons
- 3–4 short options for polls
- For hot takes, write the take and end with "Agree or disagree? Hit reply."

---

### Section 8: SUBJECT LINE & PREVIEW TEXT

**Subject line rules:**
- Under 50 characters (mobile-friendly)
- Format: `[Hook] + [Count/Promise] + [Emoji]`
- Lead with the most compelling content from the issue
- One emoji at the end — rotate: 🌊 ☀️ 🍹 🎵 💃 🦞 🎭 🏖️ 🍺

**Preview text rules:**
- Complements the subject line (doesn't repeat it)
- Format: "Plus [X] more events, [deal mention], and [Signal Noise tease]"
- 40–90 characters

**Generate 3 subject line options** and let the user pick.

---

## Output Format

Generate a `draft-content.json` file. Read `references/output-schema.md` for the complete schema.

The output must be valid JSON that the `generate-newsletter.js` script can consume directly. Every field in the schema should be populated, or set to `null` for sections that should be skipped.

## Reference Files

- `references/voice-guide.md` — Complete brand voice reference with do's, don'ts, and examples by section
- `references/output-schema.md` — Complete JSON schema for draft output
- `assets/example-draft.json` — A fully populated example of Issue #1 for reference
