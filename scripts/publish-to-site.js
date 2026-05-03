#!/usr/bin/env node
/**
 * publish-to-site.js
 *
 * Wraps a generated email issue (output/issue-N.html) in site chrome and
 * publishes it to site/issues/. Also rebuilds the archive index page and
 * updates site/latest.html to redirect to the newest issue.
 *
 * Usage:
 *   node scripts/publish-to-site.js
 *     (reads issue number from pipeline/this-week.json, copies output/issue-N.html)
 *
 *   node scripts/publish-to-site.js --content pipeline/this-week.json --site-dir site
 *
 * After running:
 *   git add site/ && git commit -m "Publish issue #N" && git push
 *   GitHub Actions auto-deploys to southcountysignal.com.
 */

const fs = require('fs');
const path = require('path');

// ── CLI args ──
const args = process.argv.slice(2);
function getArg(flag, def) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}
const contentPath = getArg('--content', './pipeline/this-week.json');
const siteDir = getArg('--site-dir', './site');
const outputDir = getArg('--output-dir', './output');

// ── Helpers ──
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Load content metadata ──
if (!fs.existsSync(contentPath)) {
  console.error(`Content file not found: ${contentPath}`);
  process.exit(1);
}
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
const issueNumber = content.issue_number;
const weekOf = content.week_of || '';
const subject = (content.subject_lines && content.subject_lines[0]) || `Issue #${issueNumber}`;
const previewText = content.preview_text || '';
const headlinerName = (content.headliner && content.headliner.name) || '';

// ── Load source email HTML ──
const sourceHtml = path.join(outputDir, `issue-${issueNumber}.html`);
if (!fs.existsSync(sourceHtml)) {
  console.error(`Source HTML not found: ${sourceHtml}`);
  console.error('Run scripts/generate-newsletter.js first.');
  process.exit(1);
}
const emailHtml = fs.readFileSync(sourceHtml, 'utf8');

// ── Extract style + body ──
// The email template has two <style> blocks: a small MSO compat shim inside
// an <!--[if mso]> conditional, and the main stylesheet. Grab them all.
const styleBlocks = [...emailHtml.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]);
const bodyMatch = emailHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/);
if (styleBlocks.length === 0 || !bodyMatch) {
  console.error('Could not parse email HTML — expected <style> and <body> blocks.');
  process.exit(1);
}
const emailStyles = styleBlocks.join('\n');
let emailBody = bodyMatch[1];

// Strip the email's manage/unsubscribe/view-in-browser link block — those are
// Beehiiv/Buttondown merge tags that don't apply on the web.
emailBody = emailBody.replace(
  /<div class="footer-links">[\s\S]*?<\/div>/,
  ''
);

// Strip the Buttondown subscribe-form block — the wrapped page has its own
// subscribe CTA, and {{ subscribe_form }} would render as broken text.
emailBody = emailBody.replace(
  /<!-- ═+ FORWARD-TO-A-FRIEND[\s\S]*?<\/div>\s*(?=<!-- ═+ FOOTER)/,
  ''
);

// Replace any leftover merge tags with sensible web URLs / strip them
const canonicalUrl = `https://southcountysignal.com/issues/issue-${issueNumber}`;
emailBody = emailBody
  .replace(/\{\{\s*view_in_browser\s*\}\}/g, canonicalUrl)
  .replace(/\{\{\s*manage_preferences\s*\}\}/g, '/#subscribe')
  .replace(/\{\{\s*unsubscribe\s*\}\}/g, '/#subscribe')
  .replace(/\{\{\s*subscribe_form\s*\}\}/g, '');

// ── Site chrome (top bar + bottom CTA) ──
const siteBar = `
<div class="scs-site-bar">
  <a class="scs-site-bar-brand" href="/">The South County Signal</a>
  <div class="scs-site-bar-links">
    <a href="/issues/">Archive</a>
    <a href="/#about">About</a>
    <a href="/#subscribe" class="scs-site-bar-cta">Subscribe</a>
  </div>
</div>`;

const siteCta = `
<div class="scs-site-cta">
  <h3>Want this in your inbox every Thursday?</h3>
  <p>One email a week. Everything worth doing in Southern Rhode Island. Free.</p>
  <a class="scs-site-cta-btn" href="/#subscribe">Subscribe Free</a>
  <div class="scs-site-cta-meta">
    <a href="/issues/">View archive</a> · <a href="/">Home</a> · <a href="mailto:hello@southcountysignal.com">Contact</a>
  </div>
</div>`;

const wrapperStyles = `
/* ── SCS site wrapper (web archive only) ── */
.scs-site-bar {
  background: #1B4965;
  color: #FAF8F5;
  font-family: 'Source Sans 3', Arial, sans-serif;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 14px;
}
.scs-site-bar a { color: #FAF8F5; text-decoration: none; }
.scs-site-bar-brand {
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.3px;
}
.scs-site-bar-links { display: flex; gap: 22px; align-items: center; font-weight: 600; }
.scs-site-bar-links a:hover { color: #E8C96A; }
.scs-site-bar-cta {
  background: #D4A843;
  color: #132F42 !important;
  padding: 8px 18px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.3px;
}
.scs-site-bar-cta:hover { background: #E8C96A; }
@media (max-width: 600px) {
  .scs-site-bar { flex-direction: column; padding: 14px 16px; }
  .scs-site-bar-links { gap: 14px; flex-wrap: wrap; justify-content: center; }
}

.scs-site-cta {
  background: #1B4965;
  color: #FAF8F5;
  font-family: 'Source Sans 3', Arial, sans-serif;
  padding: 48px 24px;
  text-align: center;
}
.scs-site-cta h3 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
  line-height: 1.2;
}
.scs-site-cta p {
  margin: 0 auto 24px auto;
  max-width: 480px;
  color: rgba(250,248,245,0.85);
  font-size: 16px;
}
.scs-site-cta-btn {
  display: inline-block;
  background: #D4A843;
  color: #132F42;
  padding: 14px 32px;
  border-radius: 999px;
  font-weight: 700;
  text-decoration: none;
  letter-spacing: 0.4px;
  font-size: 15px;
}
.scs-site-cta-btn:hover { background: #E8C96A; }
.scs-site-cta-meta {
  margin-top: 28px;
  font-size: 13px;
  color: rgba(250,248,245,0.6);
}
.scs-site-cta-meta a {
  color: rgba(250,248,245,0.85);
  text-decoration: none;
  margin: 0 8px;
}
.scs-site-cta-meta a:hover { color: #E8C96A; }
`;

// ── Build wrapped issue page ──
const pageTitle = `Issue #${issueNumber} — Week of ${weekOf} · The South County Signal`;
const ogDesc = previewText || (headlinerName ? `This week's move: ${headlinerName}.` : '');

const wrappedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="${escapeHtml(ogDesc)}">
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:title" content="${escapeHtml(subject)}">
<meta property="og:description" content="${escapeHtml(ogDesc)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:site_name" content="The South County Signal">
<meta name="twitter:card" content="summary_large_image">
<style>
${emailStyles}
${wrapperStyles}
</style>
</head>
<body>
${siteBar}
${emailBody}
${siteCta}
</body>
</html>
`;

// ── Write the wrapped issue ──
const issuesDir = path.join(siteDir, 'issues');
if (!fs.existsSync(issuesDir)) fs.mkdirSync(issuesDir, { recursive: true });
const outFile = path.join(issuesDir, `issue-${issueNumber}.html`);
fs.writeFileSync(outFile, wrappedHtml, 'utf8');

// ── Maintain a metadata manifest for the archive page ──
const manifestPath = path.join(issuesDir, 'issues.json');
let manifest = [];
if (fs.existsSync(manifestPath)) {
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch { manifest = []; }
}
const manifestEntry = {
  issue_number: issueNumber,
  week_of: weekOf,
  subject,
  preview_text: previewText,
  headliner: headlinerName,
  published_at: new Date().toISOString(),
  url: `/issues/issue-${issueNumber}`
};
manifest = manifest.filter(m => m.issue_number !== issueNumber);
manifest.push(manifestEntry);
manifest.sort((a, b) => b.issue_number - a.issue_number);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

// ── Build archive index page ──
const archiveItems = manifest.map(m => `
    <li class="archive-item">
      <a href="${m.url}">
        <div class="archive-item-num">Issue #${m.issue_number}</div>
        <div class="archive-item-meta">Week of ${escapeHtml(m.week_of)}</div>
        ${m.headliner ? `<div class="archive-item-headliner">${escapeHtml(m.headliner)}</div>` : ''}
        ${m.preview_text ? `<div class="archive-item-preview">${escapeHtml(m.preview_text)}</div>` : ''}
      </a>
    </li>`).join('');

const archiveHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Archive · The South County Signal</title>
<meta name="description" content="Every issue of The South County Signal — your weekly cheat sheet for Southern Rhode Island.">
<link rel="canonical" href="https://southcountysignal.com/issues/">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Source Sans 3', Arial, sans-serif;
  background: #FAF8F5;
  color: #2D2D2D;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
${wrapperStyles}
.archive-main { max-width: 760px; margin: 0 auto; padding: 64px 24px 32px 24px; }
.archive-header { text-align: center; margin-bottom: 48px; }
.archive-header h1 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 56px;
  font-weight: 900;
  color: #1B4965;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}
.archive-header p { font-size: 18px; color: #4A4A4A; }
.archive-list { list-style: none; }
.archive-item { margin-bottom: 16px; }
.archive-item a {
  display: block;
  background: #fff;
  border: 1px solid #E8E2D9;
  border-radius: 8px;
  padding: 24px 28px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}
.archive-item a:hover {
  border-color: #D4A843;
  box-shadow: 0 4px 20px rgba(27, 73, 101, 0.08);
  transform: translateY(-1px);
}
.archive-item-num {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 22px;
  font-weight: 700;
  color: #1B4965;
  margin-bottom: 4px;
}
.archive-item-meta {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #888;
  margin-bottom: 8px;
}
.archive-item-headliner {
  font-weight: 600;
  color: #2D2D2D;
  margin-bottom: 6px;
}
.archive-item-preview {
  font-size: 14px;
  color: #4A4A4A;
}
.archive-empty {
  text-align: center;
  padding: 64px 24px;
  color: #888;
}
@media (max-width: 600px) {
  .archive-header h1 { font-size: 40px; }
  .archive-main { padding: 40px 20px 24px 20px; }
}
</style>
</head>
<body>
${siteBar}
<main class="archive-main">
  <header class="archive-header">
    <h1>Archive</h1>
    <p>Every issue of The South County Signal.</p>
  </header>
  ${manifest.length === 0
    ? `<div class="archive-empty">No issues published yet.</div>`
    : `<ul class="archive-list">${archiveItems}\n  </ul>`}
</main>
${siteCta}
</body>
</html>
`;
fs.writeFileSync(path.join(issuesDir, 'index.html'), archiveHtml, 'utf8');

// ── Build latest.html redirect ──
const newest = manifest[0];
const latestHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="0; url=${newest.url}">
<link rel="canonical" href="https://southcountysignal.com${newest.url}">
<title>Latest Issue · The South County Signal</title>
<meta name="robots" content="noindex">
</head>
<body>
<p>Redirecting to the latest issue… <a href="${newest.url}">click here if you are not redirected</a>.</p>
<script>window.location.replace(${JSON.stringify(newest.url)});</script>
</body>
</html>
`;
fs.writeFileSync(path.join(siteDir, 'latest.html'), latestHtml, 'utf8');

// ── Update homepage archive cards ──
// Show up to MAX_HOMEPAGE_CARDS issues on the homepage. The full archive
// lives at /issues/ — homepage just teases the most recent few.
const MAX_HOMEPAGE_CARDS = 6;
const indexPath = path.join(siteDir, 'index.html');
let homepageUpdated = false;
if (fs.existsSync(indexPath)) {
  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  const startMarker = '<!-- ARCHIVE_CARDS_START';
  const endMarker = '<!-- ARCHIVE_CARDS_END -->';
  const startIdx = indexHtml.indexOf(startMarker);
  const endIdx = indexHtml.indexOf(endMarker);
  if (startIdx !== -1 && endIdx !== -1) {
    const homepageCards = manifest.slice(0, MAX_HOMEPAGE_CARDS).map(m => {
      const headline = m.headliner || m.subject || `Issue #${m.issue_number}`;
      return `      <a href="${m.url}" class="archive-card">
        <div class="issue-num">Issue #${m.issue_number}</div>
        <div class="issue-headline">${escapeHtml(headline)}</div>
        <div class="issue-date">Week of ${escapeHtml(m.week_of)}</div>
        <div class="read-link">Read issue &rarr;</div>
      </a>`;
    }).join('\n');
    const startTagEnd = indexHtml.indexOf('-->', startIdx) + 3;
    const newIndexHtml =
      indexHtml.slice(0, startTagEnd) +
      '\n' + homepageCards + '\n      ' +
      indexHtml.slice(endIdx);
    fs.writeFileSync(indexPath, newIndexHtml, 'utf8');
    homepageUpdated = true;
  }
}

// ── Report ──
console.log(`✅ Published Issue #${issueNumber} — Week of ${weekOf}`);
console.log(`   Issue page:  ${outFile}`);
console.log(`   Archive:     ${path.join(issuesDir, 'index.html')} (${manifest.length} issue${manifest.length === 1 ? '' : 's'})`);
console.log(`   Latest:      ${path.join(siteDir, 'latest.html')} → ${newest.url}`);
console.log(`   Manifest:    ${manifestPath}`);
console.log(`   Homepage:    ${homepageUpdated ? `${indexPath} (refreshed)` : 'skipped — no ARCHIVE_CARDS markers in index.html'}`);
console.log(``);
console.log(`📋 Next:`);
console.log(`   1. Preview locally: open ${outFile} in your browser`);
console.log(`   2. Ship it: git add site/ && git commit -m "Publish issue #${issueNumber}" && git push`);
console.log(`   3. GitHub Actions will auto-deploy to https://southcountysignal.com/issues/issue-${issueNumber}`);
