# The South County Signal — Launch To-Do List

Last updated: 2026-03-16

---

## Phase 1: Foundation (Target: Week of March 16)

### Domain & Email
- [ ] Register domain: `southcountysignal.com` (Namecheap, ~$12/yr)
- [ ] Set up Google Workspace: `hello@southcountysignal.com` ($7/mo)

### Newsletter Platform (Beehiiv)
- [ ] Create Beehiiv account (free Launch tier)
- [ ] Create publication: "The South County Signal"
- [ ] Connect custom domain + configure DNS (SPF, DKIM, DMARC)
- [ ] Upload logo and configure brand colors (#1B4965 primary, #D4A843 accent, #FAF8F5 background)
- [ ] Upload HTML email template from `assets/newsletter-template.html`
- [ ] Create custom subscriber fields: `first_name`, `town`, `interests`, `signup_source`
- [ ] Build landing page with email signup on Beehiiv

### Website
- [ ] Generate logo (compass rose concept — prompt ready)
- [ ] Build static site (Home, About, Archive, Advertise, Subscribe)
- [ ] Set up Cloudflare Pages hosting (free tier)
- [ ] Connect custom domain to Cloudflare
- [ ] Embed Beehiiv signup form on site
- [ ] Embed current newsletter on homepage
- [ ] Configure DNS split: site on Cloudflare, email auth on Beehiiv

### Social Media
- [ ] Create Instagram account (@southcountysignal)
- [ ] Write bio, upload profile pic (logo)
- [ ] Create Facebook Page
- [ ] Set up Linktree/Beacons for link-in-bio

### Project Pipeline (DONE)
- [x] Project directory structure created
- [x] Newsletter template in `assets/`
- [x] Generator script in `scripts/`
- [x] Beehiiv API client in `scripts/`
- [x] Scout skill built (`scs-scout-SKILL.md`)
- [x] Dynamic source list (`pipeline/sources.json`)
- [x] Manual additions template (`pipeline/manual-additions.json`)
- [x] Curator skill ready (`scs-curator-SKILL.md`)
- [x] Drafter skill ready (`scs-drafter-SKILL.md`)
- [x] Tested full pipeline: content JSON → HTML generation
- [x] Issue #1 content drafted (`pipeline/this-week.json`)
- [x] Issue #1 HTML generated (`output/issue-1.html`)
- [x] Git repo initialized
- [x] CLAUDE.md project context file created

---

## Phase 2: Content Buffer (Target: Weeks 2-3)

### Newsletter Content
- [ ] Scout real events for current week (test scout skill live)
- [ ] Run curator on scouted events
- [ ] Run drafter on curated events
- [ ] Generate Issue #1 with real, current content
- [ ] Write Issue #2 in advance (buffer)
- [ ] Write Issue #3 in advance (buffer)

### Welcome Sequence (Beehiiv Automation)
- [ ] Write Email 1: "You're in. Here's what to expect." (immediate)
- [ ] Write Email 2: "The 5 South County spots everyone should know" (Day 3)
- [ ] Write Email 3: "One quick question" — engagement poll (Day 7)
- [ ] Set up automation flow in Beehiiv

### Editorial Infrastructure
- [ ] Create Google Sheets editorial tracker (content inventory)
- [ ] Create Google Sheets ad inventory tracker
- [ ] Create Google Sheets analytics log
- [ ] Set up Canva Pro ($13/mo) for social graphics

---

## Phase 3: Social Presence & Partnerships (Target: Weeks 3-4)

### Instagram Build-Up (Pre-Launch)
- [ ] Post 10 pieces of content before announcing the newsletter
  - Local golden-hour photos (beaches, villages, venues)
  - "Coming soon" teaser posts
  - Behind-the-scenes content
  - Food/drink shots from local spots
- [ ] Build initial following through engagement with local accounts

### Launch Partnerships
- [ ] Identify 10 local businesses for cross-promotion
- [ ] Send cold outreach emails (use templates from `Resources/09-OUTREACH-TEMPLATES.md`)
- [ ] Follow up with interested partners
- [ ] Confirm 5-10 businesses willing to cross-promote
- [ ] Design and print sign-up cards for partner locations (Canva)
- [ ] Deliver cards to partner locations

### Media Kit
- [ ] Create 1-page media kit / rate card PDF (reference `Resources/08-MEDIA-KIT.md`)
- [ ] Upload to website Advertise page
- [ ] Set up Calendly for advertiser calls (free tier)

---

## Phase 4: Pre-Launch Build-Up (Target: 2 Weeks Before Launch)

- [ ] Announce launch date on Instagram
- [ ] Share "coming soon" content: sneak peeks, local photos
- [ ] Post in local Facebook groups about upcoming newsletter
- [ ] Personal outreach: text/email 50-100 people asking them to subscribe
- [ ] Launch partner businesses begin promoting to their customers
- [ ] Instagram Stories countdown to launch day
- [ ] Target: **400 subscribers on launch day**

---

## Phase 5: Launch Week

### Monday (4 days before)
- [ ] Final review of Issue #1
- [ ] Test send to yourself + 2-3 friends for feedback
- [ ] Instagram Reel: "This Thursday, something new for South County"

### Tuesday (3 days before)
- [ ] Fix any issues from test feedback
- [ ] Instagram carousel: "What to expect from The South County Signal"
- [ ] Share in Facebook groups

### Wednesday (1 day before)
- [ ] Final proofread, check all links
- [ ] Schedule send for Thursday 8:30 AM in Beehiiv
- [ ] Prepare Thursday Instagram post + Story sequence

### Thursday — LAUNCH DAY
- [ ] 8:30 AM: Issue #1 sends
- [ ] 9:00 AM: Post to Instagram — "Issue #1 is live. Link in bio."
- [ ] 9:30 AM: Post in Facebook groups (genuine, helpful, not spam)
- [ ] 10:00 AM: Text personal network
- [ ] Throughout day: Respond to every reply, DM, and comment
- [ ] 5:00 PM: Instagram Story with early stats

### Friday (Day after)
- [ ] Check Beehiiv analytics: open rate, click rate, subscriber count
- [ ] Post Instagram Story: "This weekend in South County" quick hits
- [ ] Send thank-you messages to launch partners

---

## Phase 6: Post-Launch Operations (Ongoing)

### Weekly Rhythm
- [ ] Monday: Run scout skill → review raw events → add manual additions
- [ ] Tuesday: Run curator → review curated list → approve
- [ ] Wednesday: Run drafter → edit draft → generate HTML → create social posts
- [ ] Thursday: Final review → send via Beehiiv → post to Instagram
- [ ] Friday: Check analytics → log metrics → post weekend picks to Stories

### Growth (First 90 Days)
- [ ] Day 30: Hit 500 subscribers → start approaching additional businesses
- [ ] Day 45: Hit 750 subscribers → refine subject lines based on open rate data
- [ ] Day 60: Hit 1,000 subscribers → begin Insider Deal section (free placements to test)
- [ ] Day 75: Hit 1,250 subscribers → first seasonal mini-guide (Spring Kickoff)
- [ ] Day 90: Hit 1,500+ subscribers → review analytics, plan monetization

### Monetization Prep (Month 4-6)
- [ ] Approach first paying advertisers (5-8 targets)
- [ ] Set up Stripe for payment processing
- [ ] Create advertiser onboarding flow
- [ ] Upgrade Beehiiv to Scale plan when hitting 2,500 subs ($49/mo)

---

## Future Enhancements

- [ ] Build automated scraping script (Option 2 from scout evolution plan)
- [ ] Set up Make.com automations (subscriber notifications, analytics logging)
- [ ] Enable Beehiiv referral program (Scale plan required)
- [ ] Explore Beehiiv Ad Network for passive revenue
- [ ] Plan first seasonal guide (Summer Kickoff — late May)
- [ ] Consider Claude Agent SDK for fully autonomous scouting (Option 3)
- [ ] Add Beehiiv webhook integrations for real-time subscriber tracking
