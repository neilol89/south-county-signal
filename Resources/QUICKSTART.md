# South County Signal — Claude Code Setup Quickstart

## Prerequisites

- [ ] Claude Code installed and working (`claude` command in terminal)
- [ ] Node.js 18+ installed
- [ ] A working directory for the project (e.g. `~/south-county-signal/`)

---

## Step 1: Create the Project Directory

```bash
mkdir -p ~/south-county-signal/{pipeline,output,assets,scripts}
cd ~/south-county-signal
```

## Step 2: Install the Skills

Download the `.skill` files from this conversation, then:

```bash
# From wherever you downloaded them
claude install-skill scs-curator.skill
claude install-skill scs-drafter.skill
```

Verify they're installed:
```bash
claude skills list
# Should show scs-curator and scs-drafter
```

## Step 3: Drop In the Pipeline Scripts

Copy these files from the deliverables into your project:

```bash
# Newsletter HTML template
cp newsletter-template.html ~/south-county-signal/assets/

# Newsletter assembly script
cp generate-newsletter.js ~/south-county-signal/scripts/

# Example content JSON (for reference)
cp example-this-week.json ~/south-county-signal/assets/
```

## Step 4: Test the Curator

Paste a raw event list into Claude Code (or point it at a file) and invoke the curator:

```
claude "Here are 15 events happening in South County this week: 
[paste events or path to raw-events.json]. 
Curate this week's lineup for the Signal."
```

Claude should produce a `curated-events.json` with headliner, lineup, PVD picks, and the diversity check.

## Step 5: Test the Drafter

Feed the curated output to the drafter:

```
claude "Write this week's Signal newsletter from this curated event list: 
[paste curated-events.json or path]. 
Issue number 2, week of March 22, 2026."
```

Claude should produce a `draft-content.json` with all sections written in the Signal voice plus 3 subject line options.

## Step 6: Test the Assembly

```bash
cd ~/south-county-signal
node scripts/generate-newsletter.js \
  --content pipeline/draft-content.json \
  --template assets/newsletter-template.html \
  --output-dir output/
```

Open `output/issue-2.html` in a browser to preview.

## Step 7: Set Up the Weekly Workflow

Your weekly Claude Code commands, in order:

```bash
# Monday: Curate (after you've gathered raw events manually or via OpenClaw scout)
claude "Curate this week's events for the Signal" < pipeline/raw-events.json

# Review curated-events.json, swap anything you disagree with

# Tuesday/Wednesday: Draft
claude "Draft the Signal newsletter from these curated events. Issue #3, week of March 29." < pipeline/curated-events.json

# Review draft-content.json, tweak voice, refine opener

# Wednesday: Assemble
node scripts/generate-newsletter.js --content pipeline/draft-content.json --template assets/newsletter-template.html --output-dir output/

# Thursday: Paste output HTML into Beehiiv editor → send
```

---

## Directory Structure When Running

```
~/south-county-signal/
├── assets/
│   ├── newsletter-template.html    # The HTML email template
│   └── example-this-week.json      # Reference example
├── scripts/
│   └── generate-newsletter.js      # HTML assembler
├── pipeline/                       # Working files (regenerated weekly)
│   ├── raw-events.json             # From scout/manual gathering
│   ├── curated-events.json         # From curator skill
│   └── draft-content.json          # From drafter skill
├── output/
│   └── issue-XX.html               # Final newsletter HTML
└── archive/                        # Past issues (move here after sending)
    ├── issue-1.json
    ├── issue-1.html
    └── ...
```

---

## Optional: Beehiiv API Setup

If you want to pull analytics or manage subscribers from the command line:

```bash
# Set environment variables
export BEEHIIV_API_KEY="your_key_here"
export BEEHIIV_PUBLICATION_ID="pub_your_id_here"

# Copy the Python client into your project
cp beehiiv-client.py ~/south-county-signal/scripts/

# Test it
python3 scripts/beehiiv-client.py stats
python3 scripts/beehiiv-client.py list-posts
```

---

## Optional: OpenClaw Scout Integration

Once your OpenClaw instance is running, install the scout skill to automate Monday morning event scraping. That feeds `raw-events.json` into the pipeline automatically, so your first weekly touchpoint becomes reviewing curated output instead of manually gathering events.

---

## Checklist Summary

- [ ] Project directory created
- [ ] Both `.skill` files installed in Claude Code
- [ ] `newsletter-template.html` in `assets/`
- [ ] `generate-newsletter.js` in `scripts/`
- [ ] Tested curator with sample events
- [ ] Tested drafter with curated output
- [ ] Tested HTML assembly with `generate-newsletter.js`
- [ ] Opened output HTML in browser — looks right
- [ ] Ready for first real issue
