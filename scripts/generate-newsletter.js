#!/usr/bin/env node
/**
 * generate-newsletter.js
 * 
 * Assembles a weekly newsletter HTML from a JSON content file and the base template.
 * 
 * Usage:
 *   node generate-newsletter.js --content this-week.json --template newsletter-template.html --output output/issue-15.html
 * 
 * Or with defaults:
 *   node generate-newsletter.js
 *   (reads ./this-week.json, uses ../assets/newsletter-template.html, outputs to ./output/)
 */

const fs = require('fs');
const path = require('path');

// ── Parse CLI args ──
const args = process.argv.slice(2);
function getArg(flag, defaultVal) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultVal;
}

const contentPath = getArg('--content', './this-week.json');
const templatePath = getArg('--template', path.join(__dirname, '..', 'assets', 'newsletter-template.html'));
const outputDir = getArg('--output-dir', './output');

// ── Load files ──
if (!fs.existsSync(contentPath)) {
  console.error(`Content file not found: ${contentPath}`);
  console.log('\nCreate a this-week.json file with your content. See references/template-system.md for the schema.');
  process.exit(1);
}

if (!fs.existsSync(templatePath)) {
  console.error(`Template file not found: ${templatePath}`);
  process.exit(1);
}

const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
let html = fs.readFileSync(templatePath, 'utf8');

// ── Helper functions ──
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const categoryLabels = {
  music: 'Live Music',
  food: 'Food & Drink',
  outdoor: 'Beach & Outdoor',
  arts: 'Arts & Culture',
  nightlife: 'Nightlife',
  family: 'Family Friendly',
  wellness: 'Fitness & Wellness'
};

// ── Replace Header ──
html = html.replace('[DATE]', content.week_of || 'DATE');
html = html.replace('[NUMBER]', String(content.issue_number || 'X'));

// ── Replace Opener ──
html = html.replace(
  /\[OPENER COPY[^\]]*\]/,
  escapeHtml(content.opener || '')
);

// ── Replace Headliner ──
if (content.headliner) {
  const h = content.headliner;
  html = html.replace('[HEADLINER EVENT NAME]', escapeHtml(h.name));
  html = html.replace('[Day, Date] · [Time] · [Venue, Town]',
    `${escapeHtml(h.date)} · ${escapeHtml(h.time)} · ${escapeHtml(h.venue)}, ${escapeHtml(h.town)}`);

  // Replace the description placeholder in the headliner card
  html = html.replace(
    /\[3-4 sentences with personality[^\]]*\]/,
    escapeHtml(h.description)
  );

  // Replace link
  html = html.replace(/href="\[LINK\]"/, `href="${h.link || '#'}"`);

  // Sponsor tag
  if (h.sponsor) {
    html = html.replace('<!-- Presented by [SPONSOR] — or leave blank if unsold -->',
      `Presented by ${escapeHtml(h.sponsor)}`);
  } else {
    html = html.replace('<!-- Presented by [SPONSOR] — or leave blank if unsold -->', '');
  }
}

// ── Replace Lineup ──
if (content.lineup && content.lineup.length > 0) {
  const lineupItems = content.lineup.map(event => {
    const catLabel = categoryLabels[event.category] || event.category_label || event.category;
    const sponsoredTag = event.sponsored
      ? `\n      <span class="category-tag sponsored">Featured</span>`
      : '';

    return `
    <div class="lineup-item">
      <span class="category-tag ${event.category}">${escapeHtml(catLabel)}</span>${sponsoredTag}
      <div class="item-name"><a href="${event.link || '#'}">${escapeHtml(event.name)}</a></div>
      <div class="item-meta">${escapeHtml(event.date)} · ${escapeHtml(event.time)} · ${escapeHtml(event.venue)}, ${escapeHtml(event.town)}</div>
      <div class="item-desc">${escapeHtml(event.description)}</div>
    </div>`;
  }).join('\n');

  // Replace the entire lineup items block (from first PICK to the ADD/REMOVE comment)
  html = html.replace(
    /<!-- PICK 1 -->[\s\S]*?<!-- ADD\/REMOVE PICKS AS NEEDED[^>]*>/,
    lineupItems
  );
}

// ── Replace Mid-Ad ──
if (content.mid_ad) {
  html = html.replace('[AD COPY — 2-3 sentences max. Link to sponsor.]',
    escapeHtml(content.mid_ad.copy));
  html = html.replace('[SPONSOR LINK]', content.mid_ad.link || '#');
} else {
  // Remove entire mid-ad section
  html = html.replace(
    /<!-- ═+ MID-NEWSLETTER AD ═+ -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
    ''
  );
}

// ── Replace Spotlight ──
if (content.spotlight) {
  const s = content.spotlight;
  html = html.replace('[Restaurant / Bar / Brewery Name]', escapeHtml(s.name));
  html = html.replace('[Town] · [Neighborhood/Street if helpful]',
    escapeHtml(s.town) + (s.location_detail ? ` · ${escapeHtml(s.location_detail)}` : ''));
  html = html.replace(
    /\[3-4 sentences\. What makes it worth[^\]]*\]/,
    escapeHtml(s.description)
  );
}

// ── Replace Providence Events ──
if (content.pvd_events && content.pvd_events.length > 0) {
  const pvdItems = content.pvd_events.map(event => `
    <div class="pvd-item">
      <div class="item-name">${escapeHtml(event.name)}</div>
      <div class="item-meta">${escapeHtml(event.date)} · ${escapeHtml(event.time)} · ${escapeHtml(event.venue)}</div>
      <div class="item-desc">${escapeHtml(event.description)}</div>
    </div>`).join('\n');

  // Replace the PVD item placeholder
  html = html.replace(
    /<div class="pvd-item">[\s\S]*?<\/div>\s*<\/div>\s*<!-- OPTIONAL 2ND PVD PICK -->[\s\S]*?-->/,
    pvdItems
  );
} else {
  // Remove entire Worth the Drive section (up to the next section comment)
  html = html.replace(
    /<!-- ═+ WORTH THE DRIVE[\s\S]*?(?=<!-- ═+ INSIDER DEAL)/,
    ''
  );
}

// ── Replace Deal ──
if (content.deal) {
  const d = content.deal;
  html = html.replace('[Business Name]', escapeHtml(d.business));
  html = html.replace('[The Deal — e.g., "20% Off Your First Visit"]', escapeHtml(d.offer));
  html = html.replace('[Restrictions, expiry, how to redeem. 1-2 lines.]', escapeHtml(d.details));
  html = html.replace('[SIGNAL20]', escapeHtml(d.code));
}

// ── Replace Signal Noise ──
if (content.signal_noise) {
  const sn = content.signal_noise;
  html = html.replace(
    /\[Question, debate, or hot take[^\]]*\]/,
    escapeHtml(sn.question)
  );

  if (sn.options && sn.options.length > 0) {
    const pollButtons = sn.options.map(opt =>
      `<a href="${sn.poll_link || 'mailto:signal@southcountysignal.com?subject=' + encodeURIComponent(opt)}" class="poll-btn">${escapeHtml(opt)}</a>`
    ).join('\n        ');

    html = html.replace(
      /<a href="\[POLL LINK OR MAILTO\]" class="poll-btn">\[Option A\]<\/a>[\s\S]*?\[Option C\]<\/a>/,
      pollButtons
    );
  }
}

// ── Replace Footer ──
if (content.social) {
  html = html.replace('[INSTAGRAM URL]', content.social.instagram || '#');
  html = html.replace('[FACEBOOK URL]', content.social.facebook || '#');
  html = html.replace('[TIKTOK URL]', content.social.tiktok || '#');
}

if (content.ads && content.ads.footer_sponsor) {
  html = html.replace('[FOOTER SPONSOR NAME]', escapeHtml(content.ads.footer_sponsor.name));
} else {
  html = html.replace('[FOOTER SPONSOR NAME]', '');
}

// ── Clean up remaining placeholders ──
html = html.replace(/\[MEDIA KIT \/ RATE CARD URL\]/g, '#');
html = html.replace(/\[MANAGE PREFERENCES\]/g, '{{manage_preferences}}');
html = html.replace(/\[UNSUBSCRIBE\]/g, '{{unsubscribe}}');
html = html.replace(/\[VIEW IN BROWSER\]/g, '{{view_in_browser}}');

// ── Write output ──
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputFile = path.join(outputDir, `issue-${content.issue_number || 'draft'}.html`);
fs.writeFileSync(outputFile, html, 'utf8');

console.log(`✅ Newsletter generated: ${outputFile}`);
console.log(`   Issue #${content.issue_number || '?'} — Week of ${content.week_of || '?'}`);
console.log(`   Lineup items: ${(content.lineup || []).length}`);
console.log(`   PVD events: ${(content.pvd_events || []).length}`);
console.log(`   Ad slots filled: ${[
  content.headliner?.sponsor ? 'Headliner' : null,
  content.mid_ad ? 'Mid-Ad' : null,
  content.ads?.footer_sponsor ? 'Footer' : null
].filter(Boolean).join(', ') || 'None'}`);
console.log('\n📋 Next step: Copy the HTML into your Beehiiv editor, or use the API (Enterprise) to publish.');
