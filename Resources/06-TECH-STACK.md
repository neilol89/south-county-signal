# 06 — Tech Stack

## Platform: Beehiiv

Beehiiv is the newsletter platform built for growth. It's what Morning Brew, Milk Road, and thousands of successful newsletter businesses use. It's the right choice here because of built-in referral programs, native ad network, clean analytics, and a generous free tier.

### Plan Progression

| Stage | Plan | Cost | Trigger to Upgrade |
|-------|------|:---:|-------------------|
| Launch (0–2,500 subs) | Launch (Free) | $0/mo | Hit 2,500 subscribers |
| Growth (2,500–10K subs) | Scale | $49–99/mo | Need API, webhooks, monetization |
| Scale (10K+ subs) | Max | $109+/mo | Need to remove Beehiiv branding, priority support |
| Enterprise (100K+ subs) | Enterprise | Custom | Not relevant for years |

### Setup Checklist

1. Create Beehiiv account at beehiiv.com
2. Create publication: "The South County Signal"
3. Connect custom domain: southcountysignal.com
4. Set up DNS records (CNAME, TXT for email auth — SPF, DKIM, DMARC)
5. Upload logo and configure brand colors (#1B4965 primary, #D4A843 accent, #FAF8F5 background)
6. Configure the email template using the HTML from `assets/newsletter-template.html`
7. Set up welcome email automation
8. Enable referral program (Scale plan required)
9. Create custom fields: `first_name`, `town`, `interests`, `signup_source`
10. Generate API key (Settings → API) — store securely as environment variable

### Key Beehiiv Features to Use

**Growth Tools:**
- Recommendation Network (cross-promote with other newsletters)
- Embeddable signup forms (for your website and partner sites)
- Magic Links (passwordless login for paid tiers, if applicable)
- Built-in SEO for web-hosted versions of each issue

**Analytics (3D Analytics on Scale+):**
- Open rate, click rate, click maps
- Subscriber growth by source
- Geographic data
- Device breakdown
- Revenue per subscriber (when monetized)

**Monetization:**
- Beehiiv Ad Network (passive revenue from their marketplace)
- Paid subscriptions (if you add a premium tier)
- Boosts (get paid when you recommend other newsletters)

---

## Full Tool Stack

| Tool | Purpose | Cost | Plan |
|------|---------|:---:|------|
| **Beehiiv** | Newsletter platform | $0–99/mo | Scale recommended |
| **Canva Pro** | Graphics, social posts, newsletter images | $13/mo | Pro |
| **Google Workspace** | Email (hello@southcountysignal.com), Drive, Sheets | $7/mo | Business Starter |
| **Google Sheets** | Editorial calendar, ad inventory tracker, analytics log | Free | (with Workspace) |
| **Namecheap** | Domain registration (southcountysignal.com) | $12/yr | — |
| **Later.com** | Social media scheduling | $0–25/mo | Free → Starter |
| **Calendly** | Booking calls with potential advertisers | $0/mo | Free tier |
| **Stripe** | Payment processing for ad sales | 2.9% + $0.30/txn | Standard |
| **Linktree or Beacons** | Link-in-bio for Instagram | $0/mo | Free |

**Total monthly cost at launch:** ~$20–35
**Total monthly cost at scale (5K+ subs):** ~$95–145

---

## Automation Workflows

### Workflow 1: Welcome Sequence (Beehiiv Automation)

Trigger: New subscriber created

**Email 1 (Immediate):** Welcome email
- Subject: "You're in. Here's what to expect."
- Content: Quick intro, what to expect every Thursday, link to last week's issue, ask them to reply with their town (for segmentation)

**Email 2 (Day 3):** Value email
- Subject: "The 5 South County spots everyone should know"
- Content: Evergreen "best of" list — Ocean Mist, Matunuck Oyster Bar, Fantastic Umbrella Factory, Courthouse Center, Narragansett Beach at sunset
- CTA: Follow on Instagram

**Email 3 (Day 7):** Engagement email
- Subject: "One quick question"
- Content: Ask them what they want more of — music, food, outdoor, family events
- CTA: Quick reply or poll

### Workflow 2: Weekly Production Pipeline

| Day | Task | Tool |
|-----|------|------|
| **Monday** | Source content: check all event calendars, social accounts, Facebook groups | Browser + Google Sheets |
| **Tuesday** | Fill in the `this-week.json` content file with curated picks | Text editor / Google Sheets |
| **Wednesday** | Write the newsletter: opener, descriptions, spotlight, signal noise | Beehiiv editor or generate HTML |
| **Wednesday PM** | Create 2–3 social media posts for Thursday–Saturday | Canva + Later.com |
| **Thursday 7:00 AM** | Final review, test send to self, check all links | Beehiiv |
| **Thursday 8:00 AM** | Schedule send for 8:30–9:00 AM | Beehiiv |
| **Thursday 9:00 AM** | Post to Instagram: "This week's issue is live" with top picks | Instagram |
| **Friday** | Review open rate, click rate, reply count | Beehiiv analytics |
| **Friday PM** | Post Instagram Story: "This weekend in South County" quick hits | Instagram Stories |

### Workflow 3: Make.com Automations (Phase 2+)

**Scenario A: New Subscriber → Slack Notification**
- Trigger: Beehiiv webhook (subscription.created)
- Action: Post to #subscribers Slack channel with email + source
- Value: Real-time awareness of growth

**Scenario B: Post-Send → Analytics Log**
- Trigger: Beehiiv webhook (post.sent) + 24hr delay
- Action: Fetch post stats via API → append to Google Sheets analytics tracker
- Value: Automated performance tracking

**Scenario C: Google Sheets → Content Pipeline**
- Trigger: Weekly schedule (Monday 9am)
- Action: Pull this week's content from a Google Sheet, format as JSON
- Value: Content contributors can add events to a shared sheet without touching code

---

## API Integration Notes

Full API documentation is in the Beehiiv newsletter skill (`beehiiv-newsletter/references/api-reference.md`). Key points:

- **Base URL:** `https://api.beehiiv.com/v2`
- **Auth:** Bearer token (API key from dashboard)
- **Post creation via API is Enterprise-only (beta).** For Scale/Max, generate HTML and paste into the editor.
- **Use cursor-based pagination** for subscriber lists (offset pagination deprecated)
- **Rate limiting exists** — add delays between bulk operations
- **Python client:** `beehiiv-newsletter/scripts/beehiiv-client.py`
- **Newsletter generator:** `beehiiv-newsletter/scripts/generate-newsletter.js`

---

## Analytics & KPIs to Track

### Weekly (After Each Send)

| Metric | Target | Where to Find |
|--------|--------|--------------|
| Open rate | 40%+ | Beehiiv post analytics |
| Click rate | 6%+ | Beehiiv post analytics |
| Reply count | 5+ | Email inbox |
| New subscribers (this week) | 50+ | Beehiiv dashboard |
| Unsubscribes | <10 per send | Beehiiv post analytics |

### Monthly

| Metric | Target | Where to Track |
|--------|--------|---------------|
| Total active subscribers | Growth trend | Beehiiv dashboard |
| Revenue | Per business model phase | Google Sheets |
| Ad slots sold | Per monetization guide | Google Sheets |
| Instagram followers | Growth trend | Instagram Insights |
| Top-clicked link | Content optimization | Beehiiv click map |
| Subscriber source breakdown | Channel ROI | Beehiiv 3D analytics |
