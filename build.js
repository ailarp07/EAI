// Builds every Redstone page from the Engineering site's data. Run: node build.js
const fs = require('fs');
const path = require('path');

const ENG = path.join(__dirname, '..', 'Website - Engineering');
const OUT = __dirname;
const rd = f => fs.readFileSync(path.join(ENG, f), 'utf8');
const load = (f, name) => new Function(rd(f) + `;return ${name}`)();
const T = load('assets/js/translations.js', 'translations');
const REPORTS = load('assets/js/reports-data.js', 'REPORTS');
const ALUMNI = load('assets/js/alumni-data.js', 'ALUMNI');
for (const g of Object.values(ALUMNI)) for (const p of g) if (p.code === 'CU' && !/(ISE)/.test(p.uni) && /นานาชาติ/.test(p.fac)) p.uni += ' (ISE)';
const TOOLS = load('assets/js/tools-data.js', 'TOOL_CATEGORIES');

// ---------- helpers ----------
const strip = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const keep = s => s.replace(/<(?!\/?(strong|em|code|b|br)\b)[^>]+>/g, '').replace(/\s+/g, ' ').trim();
// English text for a cell: use the i18n key when it has one, else the markup text
const en = h => {
  const m = h.match(/data-i18n="(\w+)\.(\w+)"/);
  const v = m && T[m[1]] && T[m[1]][m[2]];
  return v ? v.en : strip(h);
};
const esc = s => s.replace(/&(?!amp;|lt;|gt;|#)/g, '&amp;');

const img = [];
const copyImg = (src, name) => {
  const from = path.join(ENG, 'assets/img', src);
  if (!fs.existsSync(from) || fs.statSync(from).size > 1.3e6) return null; // ponytail: big photos skipped, no resizer here
  fs.mkdirSync(path.join(OUT, 'assets/img'), { recursive: true });
  fs.copyFileSync(from, path.join(OUT, 'assets/img', name));
  return 'assets/img/' + name;
};

const momentImg = s => { const f = 'assets/img/moments/' + path.basename(s, path.extname(s)).toLowerCase() + '.jpg'; return fs.existsSync(path.join(OUT, f)) ? f : null; };
// the major's official channels, shown in every footer
const OFFICIAL = [['Facebook', 'https://www.facebook.com/eaispsm'], ['Instagram', 'https://www.instagram.com/e.ai_official/'], ['TikTok', 'https://www.tiktok.com/@e.ai_official'], ['LINE Openchat', 'https://bit.ly/3jFACxV'], ['GitHub', 'https://github.com/eai-spsm'], ['Website', 'https://sites.google.com/view/eai-official/%E0%B9%80%E0%B8%81%E0%B8%A2%E0%B8%A7%E0%B8%81%E0%B8%9A%E0%B8%A7%E0%B8%8A%E0%B8%B2%E0%B9%80%E0%B8%AD%E0%B8%81']];
// one short line under each hero title
const SUBS = {
  'index.html': 'Everything the AI Engineering major builds, breaks and writes down.',
  'about.html': 'The AI Engineering major: what it teaches and how the three years are laid out.',
  'join.html': 'What we look for, how applicants are scored and the rounds to get in.',
  'works.html': 'Contests from 2024 to 2026, each with its result, team and links.',
  'moment.html': 'Camps, workshops and field trips from the AI Engineering major.',
  'env.html': 'Getting around Asok, and everyday life in the AI Engineering major.',
  'ci.html': 'The type, colour and shape we use on every page.',
  'docs.html': 'Labs and projects from coursework, written up for the next cohort.',
  'alumni.html': 'Where each generation went to university.',
  'tools.html': 'What we reach for to get a project shipped.',
};
const OFFICIAL_BI = { Facebook: 'facebook', Instagram: 'instagram', TikTok: 'tiktok', 'LINE Openchat': 'line', GitHub: 'github', Website: 'globe' };
// extra links that only the phone menu shows
const NAVEXTRA = [['tools.html', 'Tools', 'tools'], ['ci.html', 'CI', 'palette'], ['docs.html#articles', 'Articles', 'medium'], ['https://spsm20-my.sharepoint.com/:f:/g/personal/024329_spsm_ac_th/IgDw9z82yVOeQYJz6jOnt_ykAazdCh2dPsaIH8VWcLLRIJM?e=9gAvi4', 'Photos', 'images', true]];
// cache-busting tag for the stylesheet and script, changes on every build
const VER = Date.now().toString(36);
const NAV = [['index', 'Home'], ['about', 'About'], ['join', 'Join'], ['alumni', 'Alumni'], ['works', 'Works'], ['docs', 'Docs'], ['moment', 'Moment'], ['env', 'Env']];
const FOOT = [['index', 'Home'], ['about', 'About'], ['join', 'Join'], ['alumni', 'Alumni'], ['works', 'Works'], ['docs', 'Docs'], ['tools', 'Tools'], ['ci', 'CI'], ['moment', 'Moment'], ['env', 'Env']];
const LINE = 'https://bit.ly/3jFACxV';

const ICONS = {
  cap: 'M32 14L6 26l26 12 26-12zM16 31v13c0 4 7 8 16 8s16-4 16-8V31M58 26v16',
  door: 'M14 54V10h26v44M8 54h48M34 32h2M40 20l10 4v30',
  trophy: 'M20 10h24v16c0 7-5 12-12 12s-12-5-12-12zM20 16H10c0 8 4 12 10 12M44 16h10c0 8-4 12-10 12M32 38v10M22 54h20',
  pen: 'M14 50l4-14L42 12l10 10-24 24zM38 16l10 10',
  ci: 'M12 12h40v40H12zM24 22v20M24 22h10a6 6 0 010 12H24M34 34l8 8',
  book: 'M12 14h18c3 0 4 2 4 4v32c0-2-1-4-4-4H12zM52 14H34v36c0-2 1-4 4-4h14z',
  people: 'M16 22a8 8 0 1016 0 8 8 0 10-16 0M38 26a6 6 0 1012 0 6 6 0 10-12 0M8 52c0-9 7-15 16-15s16 6 16 15M42 38c8 0 14 5 14 13',
  cpu: 'M20 16h24a4 4 0 014 4v24a4 4 0 01-4 4H20a4 4 0 01-4-4V20a4 4 0 014-4zM27 27h10v10H27zM24 8v8M40 8v8M24 48v8M40 48v8M8 24h8M8 40h8M48 24h8M48 40h8',
  robot: 'M16 20h32a4 4 0 014 4v22a4 4 0 01-4 4H16a4 4 0 01-4-4V24a4 4 0 014-4zM32 20v-8M28 12h8M24 34h2M38 34h2M26 43h12',
  chip: 'M10 32h8l4-12 8 24 6-18 4 6h14',
  eye: 'M6 32c8-14 18-20 26-20s18 6 26 20c-8 14-18 20-26 20S14 46 6 32zM24 32a8 8 0 1016 0 8 8 0 10-16 0',
  chart: 'M10 10v44h44M20 42V32M32 42V20M44 42V28',
  plane: 'M32 8c3 0 4 4 4 8v10l20 12v6L36 36v10l6 5v4l-10-3-10 3v-4l6-5V36L8 44v-6l20-12V16c0-4 1-8 4-8z',
  arrow: 'M16 48L48 16M24 16h24v24',
  globe: 'M8 32a24 24 0 1048 0 24 24 0 10-48 0M8 32h48M32 8c-8 8-8 40 0 48M32 8c8 8 8 40 0 48',
  uni: 'M32 8L6 22h52zM8 22h48M12 28v20M24 28v20M40 28v20M52 28v20M6 54h52M10 48h44',
  pin: 'M32 56S12 38 12 26a20 20 0 0140 0c0 12-20 30-20 30zM25 26a7 7 0 1014 0 7 7 0 10-14 0',
  term: 'M10 14h44a4 4 0 014 4v28a4 4 0 01-4 4H10a4 4 0 01-4-4V18a4 4 0 014-4zM18 26l8 7-8 7M32 42h14',
  tools: 'M44 12a10 10 0 00-12 13L12 45l7 7 20-20a10 10 0 0013-12l-7 7-6-1-1-6z',
};
const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${Object.entries(ICONS).map(([k, d]) => `<symbol id="i-${k}" viewBox="0 0 64 64"><path class="s" d="${d}"/></symbol>`).join('')}</svg>`;
// Bootstrap Icons (MIT), self-hosted in assets/bi, added to the sprite as bi-<name>
const UBI = { 'ISE CU': 'gear-wide-connected', 'CEDT CU': 'cpu', 'FIBO KMUTT': 'robot', 'RAI KMITL': 'motherboard', 'AERO KMITL': 'airplane', 'SIIT TU': 'tools', Tsinghua: 'rulers', Zhejiang: 'bezier2' };
const biBody = n => { const s = fs.readFileSync(path.join(OUT, 'assets/bi', n + '.svg'), 'utf8'); return s.slice(s.indexOf('>', s.indexOf('<svg')) + 1, s.lastIndexOf('</svg>')); };
const NAVBI = { index: 'house', about: 'mortarboard', join: 'door-open', works: 'trophy', moment: 'camera', ci: 'palette', docs: 'journal-text', env: 'people', alumni: 'signpost-split', tools: 'tools' };
const JOINBI = ['list-ul', 'info-circle', 'pc-display', 'person-workspace', 'cup-hot', 'play-circle', 'clock', 'train-front', 'bus-front', 'water', 'bicycle', 'shop', 'geo-alt', 'facebook', 'tiktok', 'globe', 'clipboard', 'check2', 'plus-lg', 'eye', 'medium', 'github', 'line', 'chevron-down', 'arrow-up-right', 'instagram', 'images', 'camera', 'cash-coin', 'laptop', 'shield-lock', 'award', 'lightbulb', 'building', 'rocket-takeoff', 'code-slash', 'folder2-open', 'list-check', 'calendar-event', 'signpost-split', 'cpu', 'calendar-plus', 'graph-up-arrow', 'door-open', 'trophy', 'calculator', 'lightning-charge', 'translate', 'chat-dots', 'book', 'house-door', 'globe2', 'people', 'mortarboard'];
const toolIconNames = new Set();
for (const c of TOOLS) { toolIconNames.add((c.fallback || '').replace(/^bi-/, '')); for (const t of c.tools) if (t.icon) toolIconNames.add(t.icon.replace(/^bi-/, '')); }
const TOOLBI = [...toolIconNames].filter(n => n && fs.existsSync(path.join(OUT, 'assets/bi', n + '.svg')));
const biSprite = [...new Set([...Object.values(UBI), ...Object.values(NAVBI), ...JOINBI, ...TOOLBI])].map(n => '<symbol id="bi-' + n + '" viewBox="0 0 16 16">' + biBody(n) + '</symbol>').join('');
const ic = (n, cls = '') => `<svg class="icon ${cls}"><use href="#i-${n}"/></svg>`;
const bi = (n, cls = '') => `<svg class="icon bi-ic ${cls}"><use href="#bi-${n}"/></svg>`;

const sec = (tone, inner, id = '', cls = '') => `<section class="${tone} ${cls}" data-tone="${tone}"${id ? ` id="${id}"` : ''}><div class="wrap">${inner}</div></section>`;
const head = (title, sub = '', center = false) => `<div class="head${center ? ' center' : ''}"><h2>${title}</h2>${sub ? `<p class="muted">${sub}</p>` : ''}</div>`;
const rows = list => `<div class="rows">${list.map(([a, b, c = '', href]) => href
  ? `<a href="${href}"${href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}><span>${a}</span><span>${b}</span><span>${c}</span></a>`
  : `<div><span>${a}</span><span>${b}</span><span>${c}</span></div>`).join('')}</div>`;

// ---------- coloured bands: curves and decoration are added here, in one place ----------
// Every colour band gets a curved edge wherever it meets white (the hero and the footer count as dark and white),
// plus one of four decoration sets. The set depends on the page and the band, so no two neighbours match.
const WV = pos => '<svg class="wave ' + pos + '" viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0H1440V22C1260 48 1080 48 900 26C720 4 540 4 360 24C240 38 120 40 0 28Z" fill="#fff"/></svg>';
const RING_SVG = (cls, cx, cy) => '<svg class="' + cls + '" viewBox="0 0 420 420" aria-hidden="true"><g fill="none" stroke="#fff"><circle cx="' + cx + '" cy="' + cy + '" r="110"/><circle cx="' + cx + '" cy="' + cy + '" r="190"/><circle cx="' + cx + '" cy="' + cy + '" r="270"/><circle cx="' + cx + '" cy="' + cy + '" r="350"/></g></svg>';
const PLUS_SVG = cls => '<svg class="' + cls + '" viewBox="0 0 200 120" aria-hidden="true"><defs><pattern id="pl-' + cls.replace(/\W/g, '') + '" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M20 14v12M14 20h12" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></pattern></defs><rect width="200" height="120" fill="url(#pl-' + cls.replace(/\W/g, '') + ')"/></svg>';
const DOTS3 = '<i class="dot d1"></i><i class="dot d2"></i><i class="dot d3"></i>';
const SETS = [
  RING_SVG('rg tr', 420, 0) + '',
  RING_SVG('rg bl', 0, 420) + PLUS_SVG('pl tl'),
  DOTS3,
  RING_SVG('rg tl', 0, 0) + PLUS_SVG('pl br'),
];
let PLID = 0;
const bandify = (html, hasHero, file) => {
  const secs = html.match(/<section [\s\S]*?<\/section>/g);
  if (!secs) return html;
  const seed = [...file].reduce((a, c) => a + c.charCodeAt(0), 0);
  let k = 0;
  return secs.map((s, i) => {
    if (!/^<section class="blue/.test(s)) return s;
    const prev = i === 0 ? (hasHero ? 'dark' : 'white') : (/^<section class="blue/.test(secs[i - 1]) ? 'blue' : 'white');
    const next = i === secs.length - 1 ? 'white' : (/^<section class="blue/.test(secs[i + 1]) ? 'blue' : 'white');
    // drop any hand-placed waves and decoration, they are rebuilt below
    s = s.replace(/<svg class="(wave|rings2?|plus)[^"]*"[\s\S]*?<\/svg>/g, '').replace(/<i class="dot d\d"><\/i>/g, '');
    const v = (seed + k++) % 4;
    s = s.replace(/^<section class="([^"]*)"/, (m, c) => '<section class="' + c.split(/\s+/).filter(x => x && !/^(wavy|deco|wtop|tallwave|tight)$/.test(x)).concat('cband', 'bv' + (v + 1), prev === 'white' ? 'curve-t' : '', next === 'white' ? 'curve-b' : '').filter(Boolean).join(' ') + '"');
    const deco = ((prev === 'white' ? WV('top') : '') + (next === 'white' ? WV('bot') : '') + SETS[v]).replace(/<svg class="pl [^>]*>[\s\S]*?<\/svg>/g, svg => { const n = ++PLID; return svg.replace(/pl-(pltl|plbr)/g, m => m + '-' + n); });
    return s.replace(/^(<section [^>]*>)/, (m) => m + deco);
  }).reduce((out, s, i) => out.replace(secs[i], () => s), html);
};

const page = ({ file, title, hero, body, active = '', theme = '' }) => {
  const nav = `<nav class="nav" data-tone="${hero ? (hero.photo ? 'photo' : 'blue') : 'white'}"><div class="wrap"><a href="index.html" class="brand">${ic('term')}Redstone Developer</a><a class="nav-btn nav-qa" href="${LINE}" target="_blank" rel="noopener">Q&A</a><button class="nav-toggle" type="button" aria-label="Menu" aria-expanded="false"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></button><div class="npanel"><div class="nl">${NAV.map(([k, l]) => `<a href="${k}.html"${k === active ? ' class="on"' : ''}><svg class="icon bi-ic nav-ic"><use href="#bi-${NAVBI[k]}"/></svg>${l}</a>`).join('')}${NAVEXTRA.map(([h, l, i, ext]) => `<a class="nx${h === active + '.html' ? ' on' : ''}" href="${h}"${ext ? ' target="_blank" rel="noopener"' : ''}><svg class="icon bi-ic nav-ic"><use href="#bi-${i}"/></svg>${l}</a>`).join('')}</div><div class="nr"><a class="nav-btn" href="${LINE}" target="_blank" rel="noopener"><svg class="icon bi-ic nav-ic"><use href="#bi-chat-dots"/></svg>Q&A</a><a class="nav-so" href="https://www.instagram.com/e.ai_official/" target="_blank" rel="noopener" aria-label="Instagram"><svg class="icon bi-ic"><use href="#bi-instagram"/></svg></a><a class="nav-so" href="https://github.com/eai-spsm" target="_blank" rel="noopener" aria-label="GitHub"><svg class="icon bi-ic"><use href="#bi-github"/></svg></a></div></div></div></nav>`;
  const bg = hero && hero.photo ?` photo" style="background-image:linear-gradient(rgba(0,0,0,${hero.dark || .84}),rgba(0,0,0,${hero.dark || .84})),url('${hero.photo}')${hero.focus ? ';background-position:' + hero.focus : ''}` : '';
  const heroHtml = !hero ? '' : `<header class="hero${hero.tall ? ' tall' : ''}${hero.center ? ' center' : ''}${hero.mid ? ' mid' : ''}${bg}" data-tone="${hero.photo ? 'photo' : 'blue'}"><div class="wrap"><h1>${hero.title}</h1>${(SUBS[file] || hero.sub) ? `<p class="sub-line">${SUBS[file] || hero.sub}</p>` : ''}</div><a class="more" href="#main">See more<svg class="icon bi-ic"><use href="#bi-chevron-down"/></svg></a></header><span id="main"></span>`;
  const foot = `<footer class="white" data-tone="white"><div class="wrap"><div class="top"><span>© 2026 Redstone Developer</span>${FOOT.map(([k, l]) => `<a href="${k}.html">${l}</a>`).join('')}<a href="#top">Back to top ↑</a></div><div class="soc"><span>Official channels</span>${OFFICIAL.map(([l, u]) => `<a href="${u}" target="_blank" rel="noopener" aria-label="${l}" title="${l}"><svg class="icon bi-ic"><use href="#bi-${OFFICIAL_BI[l]}"/></svg></a>`).join('')}</div><div class="big">Redstone</div><div class="bot"><span>AI Engineering major · Satit Prasarnmit Demonstration School, Bangkok</span><span>Mathayom 4–6</span></div></div></footer>`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="Redstone Developer: the AI Engineering major. ${strip(hero ? hero.title : title)}.">
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
<link rel="stylesheet" href="assets/style.css?v=${VER}">
</head>
<body id="top"${theme ? ` class="theme-${theme}"` : ''}>
${sprite.replace('</svg>', biSprite + '</svg>')}
${nav}
${heroHtml}
${bandify(body, !!hero, file)}
${foot}
<script src="assets/main.js?v=${VER}"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(OUT, file), html);
  console.log('wrote', file, Math.round(html.length / 1024) + 'KB');
};

// Official channels and site developer sections, shared by Community, About and Join
// where to see every picture from the major (shared folder)
const PHOTOS = 'https://spsm20-my.sharepoint.com/:f:/g/personal/024329_spsm_ac_th/IgDw9z82yVOeQYJz6jOnt_ykAazdCh2dPsaIH8VWcLLRIJM?e=9gAvi4';
const photoSec = (tone, cls = '') => sec(tone, '<div class="split"><div class="side"><h2>All photos</h2><p class="muted">Every picture related to the major, in one shared folder.</p></div><div class="pbox"><svg class="icon bi-ic"><use href="#bi-images"/></svg><p>Camps, trips, workshops, contests and everyday school life. More are added as we go.</p><a class="btn' + (tone === 'blue' ? '' : ' dark') + '" href="' + PHOTOS + '" target="_blank" rel="noopener">Open the photo folder ' + ic('arrow') + '</a><small>It opens on SharePoint and may ask you to sign in.</small></div></div>', 'photos', cls);
const contactSecs = (first = 'blue') => {
  const other = first === 'blue' ? 'white' : 'blue';
  return [
    sec(first, `${head(T.contact.official_label.en, 'Follow us and join the chat.')}${rows([['Facebook', 'eaispsm', '↗', 'https://www.facebook.com/eaispsm'], ['Instagram', 'e.ai_official', '↗', 'https://www.instagram.com/e.ai_official/'], ['TikTok', '@e.ai_official', '↗', 'https://www.tiktok.com/@e.ai_official'], [T.contact.openchat.en, 'Join the chat', '↗', 'https://bit.ly/3jFACxV'], [T.contact.website.en, 'Major website', '↗', 'https://sites.google.com/view/eai-official/%E0%B9%80%E0%B8%81%E0%B8%A2%E0%B8%A7%E0%B8%81%E0%B8%9A%E0%B8%A7%E0%B8%8A%E0%B8%B2%E0%B9%80%E0%B8%AD%E0%B8%81']])}`, 'channels'),
    sec(other, `${head(T.contact.dev_label.en, 'Reports, notes or study material worth sharing? Contribute or reach out.')}${rows([['Email', 'raphee.rattanamanoonporn@gmail.com', '↗', 'mailto:raphee.rattanamanoonporn@gmail.com'], ['School email', '024329@spsm.ac.th', '↗', 'mailto:024329@spsm.ac.th'], ['GitHub', 'ray0737', '↗', 'https://github.com/ray0737']])}`),
  ];
};

// ---------- data ----------
const FB = 'View on Facebook';

// competitions
const comps = rd('competitions.html').split('<div class="comp-item">').slice(1).map(b => {
  const g = re => (b.match(re) || [, ''])[1];
  const body = b.slice(b.indexOf('comp-detail-body'));
  const out = { date: strip(g(/class="date"[^>]*>([^<]*)</)), title: strip(g(/<h3[^>]*>([^<]*)</)), meta: strip(g(/class="meta"[^>]*>([^<]*)</)), parts: [] };
  const tok = /<span class="comp-badge">[\s\S]*?<span[^>]*>([\s\S]*?)<\/span><\/span>|<p class="comp-(note|winner|people-label)"[^>]*>([\s\S]*?)<\/p>|<ul class="comp-people">([\s\S]*?)<\/ul>|<a href="([^"]+)"[^>]*class="event-fb"[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span><\/a>/g;
  for (const m of body.matchAll(tok)) {
    if (m[1]) out.parts.push(['badge', strip(m[1])]);
    else if (m[2]) out.parts.push([m[2], keep(m[3])]);
    else if (m[4]) out.parts.push(['people', [...m[4].matchAll(/<li>([\s\S]*?)<\/li>/g)].map(x => strip(x[1]))]);
    else out.parts.push(['link', m[5], strip(m[6])]);
  }
  return out;
});

// events
const events = rd('events.html').split('class="event-card').slice(1).map((b, i) => {
  const g = re => (b.match(re) || [, ''])[1];
  const src = g(/<img src="assets\/img\/([^"]+)"/);
  return { date: strip(g(/class="event-date"[^>]*>([^<]*)</)), title: strip(g(/<h3[^>]*>([^<]*)</)), desc: strip(g(/<p[^>]*>([\s\S]*?)<\/p>/)), href: g(/<a href="([^"]+)"/), img: src ? momentImg(src) : null };
});

// curriculum
const curr = rd('curriculum.html').split('<div class="tab-panel').slice(1).map(b => {
  const id = b.match(/data-panel="(\w+)"/)[1];
  const label = id === 'grad' ? T.curr.grad_tab.en : T.curr['tab_' + id].en;
  if (id === 'grad') {
    return { id, label, html: `<h3>${T.curr.grad_title.en}</h3><p class="lead">${T.curr.grad_note.en}</p><ol class="lead" style="margin-left:18px">${[1, 2, 3, 4, 5, 6].map(n => `<li>${T.curr['grad' + n].en}</li>`).join('')}</ol>` };
  }
  const trs = [...b.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(m => m[1]);
  const th = [...trs[0].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map(x => en(x[0]));
  const body = trs.slice(1).map(r => {
    const cells = [...r.matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/g)];
    const sum = /colspan/.test(cells[0][1]);
    const cls = sum ? (/sum_total/.test(r) ? ' class="sum total"' : ' class="sum"') : '';
    return `<tr${cls}>${cells.map((c, i) => `<td${i === 0 && sum ? ' colspan="2"' : ''}>${en(c[2])}</td>`).join('')}</tr>`;
  }).join('');
  const meta = T.curr[id.slice(0, 2) + '_meta'] ? T.curr[id.slice(0, 2) + '_meta'].en : '';
  return { id, label, html: `<h3>${label} <span class="muted small">${meta}</span></h3><div class="table-wrap"><table><thead><tr>${th.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>` };
});

// alumni: counted by university, no individual names
const UNI = { CU: 'Chulalongkorn University', KMITL: "King Mongkut's Institute of Technology Ladkrabang", KMUTT: "King Mongkut's University of Technology Thonburi", TU: 'Thammasat University', KU: 'Kasetsart University', KMUTNB: "King Mongkut's University of Technology North Bangkok", MU: 'Mahidol University', SU: 'Silpakorn University', CMKL: 'CMKL University' };
const alumniAll = Object.values(ALUMNI).flat();
const byUni = {};
for (const p of alumniAll) {
  if (!p.code) continue;
  const u = (byUni[p.code] ||= { n: 0, fac: new Set() });
  u.n++;
  if (p.fac) u.fac.add(p.fac);
}
const uniList = Object.entries(byUni).sort((a, b) => b[1].n - a[1].n);

// ---------- pages ----------
// index
// soft wave edges for a blue section between two white ones, plus faint rings behind the content
const WAVE = '<svg class="wave %s" viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0H1440V22C1260 48 1080 48 900 26C720 4 540 4 360 24C240 38 120 40 0 28Z" fill="#fff"/></svg>';
const WAVES = WAVE.replace('%s', 'top') + WAVE.replace('%s', 'bot') + '<svg class="rings" viewBox="0 0 400 400" aria-hidden="true"><g fill="none" stroke="#fff"><circle cx="400" cy="0" r="120"/><circle cx="400" cy="0" r="200"/><circle cx="400" cy="0" r="280"/><circle cx="400" cy="0" r="360"/></g></svg>';
const S = k => T.curr[k].en;
const roles = [
  ['cpu', 'AI / ML engineer', 'Build and ship models, from data to deployment.', [S('s13'), S('s27'), S('s54')]],
  ['eye', 'Computer vision engineer', 'Software that sees: detection, tracking and recognition.', [S('s41'), S('s54'), S('s42')]],
  ['robot', 'Robotics / mechatronics engineer', 'Machines that sense, decide and move.', [S('s28'), S('s12'), S('s66')]],
  ['chip', 'Embedded engineer', 'Hardware that runs AI on the edge.', [S('s14'), S('s42')]],
  ['chart', 'Data scientist', 'Maths and code turned into decisions.', [S('s11'), S('s13')]],
];
// approximate university brand colours, edit freely
const UCOL = { 'ISE CU': '#b8537f', 'CEDT CU': '#b8537f', 'FIBO KMUTT': '#c48a3f', 'RAI KMITL': '#c4693f', 'AERO KMITL': '#c4693f', 'SIIT TU': '#a04450', Tsinghua: '#65477c', Zhejiang: '#3f6aa3' };
// official sites: university home pages, except FIBO and SIIT which have their own
const UURL = { 'ISE CU': 'https://www.chula.ac.th/en/', 'CEDT CU': 'https://www.chula.ac.th/en/', 'FIBO KMUTT': 'https://fibo.kmutt.ac.th/', 'RAI KMITL': 'https://www.kmitl.ac.th/en', 'AERO KMITL': 'https://www.kmitl.ac.th/en', 'SIIT TU': 'https://www.siit.tu.ac.th/', Tsinghua: 'https://www.tsinghua.edu.cn/en/', Zhejiang: 'https://www.zju.edu.cn/english/' };
const unis = [
  ['ISE CU', 'International School of Engineering', 'Chulalongkorn University'],
  ['CEDT CU', 'Computer Engineering and Digital Technology', 'Chulalongkorn University'],
  ['FIBO KMUTT', 'Institute of Field Robotics', "King Mongkut's University of Technology Thonburi"],
  ['RAI KMITL', 'Robotics and AI Engineering', "King Mongkut's Institute of Technology Ladkrabang"],
  ['AERO KMITL', 'Aeronautical Engineering', "King Mongkut's Institute of Technology Ladkrabang"],
  ['SIIT TU', 'Sirindhorn International Institute of Technology', 'Thammasat University'],
  ['Tsinghua', 'Tsinghua University', 'China'],
  ['Zhejiang', 'Zhejiang University', 'China'],
];
const maxN = uniList[0][1].n;
const bars = list => list.map(([c, u]) => `<div class="bar"><span>${c}${UNI[c] ? `<small>${UNI[c]}</small>` : ''}</span><i style="width:${Math.max(4, (u.n / maxN) * 100)}%"></i><span>${u.n}</span></div>`).join('');
const eventCard = e => `<article class="event">${e.img ? `<img src="${e.img}" alt="${e.title}" loading="lazy">` : ''}<div class="body"><span class="date">${e.date}</span><h3>${e.title}</h3><p>${e.desc}</p>${e.href ? `<div class="links-row"><a href="${e.href}" target="_blank" rel="noopener">${FB} ↗</a></div>` : ''}</div></article>`;

const heroImg = copyImg('banner.jpg', 'hero.jpg') || 'assets/img/hero.jpg';
page({
  file: 'index.html', title: 'Redstone Developer', active: 'index',
  hero: { tall: true, photo: heroImg, title: 'Redstone<br>Developer', row: `<div class="row"><p>${T.home.hero_sub.en}</p><a href="join.html" class="btn">How to get in ${ic('arrow')}</a></div>` },
  body: [
    sec('white', `<nav class="links" aria-label="Sections">${[['about', 'About our major'], ['join', 'How to get in'], ['works', 'Works'], ['alumni', 'University path'], ['docs', 'Documentation'], ['moment', 'Moments'], ['env', 'Env']].map(([k, l]) => `<a href="${k}.html">${k === 'ci' ? '<span class="aa">Aa</span>' : `<svg class="icon bi-ic"><use href="#bi-${k === 'env' ? 'images' : NAVBI[k]}"/></svg>`}<span class="lt">${l}<em>See more<svg class="icon bi-ic"><use href="#bi-chevron-down"/></svg></em></span></a>`).join('')}</nav>`, '', 'flush-b'),
    sec('white', `${head('What you can be after this major', 'Five paths the major prepares you for, with the subjects that point there.')}<div class="cells five sep">${roles.map(([i, t, d, s], n) => `<div class="cell tall"><small>0${n + 1}</small>${ic(i)}<h3>${t}</h3><ul class="subj">${s.map(x => `<li>${x}</li>`).join('')}</ul></div>`).join('')}</div>`, 'roles', 'tight'),
    sec('blue', `${WAVES}${head('Where our alumni go', `Programs our ${alumniAll.length} alumni enrolled in. Over 72% get in through TCAS Round 1.`)}<div class="pgrid">${unis.map(([c, p, u]) => `<a class="pcard" href="${UURL[c]}" target="_blank" rel="noopener" style="background:${UCOL[c]}"><svg class="icon big bi-ic"><use href="#bi-${UBI[c]}"/></svg><small>${c} ↗</small><h3>${p}</h3><p>${u}</p></a>`).join('')}</div><p style="margin-top:20px"><a class="btn" href="alumni.html">All universities ${ic('arrow')}</a></p>`, 'alumni', 'wavy deco'),
    sec('white', `<div class="split"><div class="side"><h2>Latest activities</h2><p class="muted">Workshops, field trips and camps through the year.</p><p style="margin-top:16px"><a class="btn dark" href="moment.html">All events ${ic('arrow')}</a></p></div><div class="feed">${events.slice(0, 4).map(e => `<a class="feed-row" ${e.href ? `href="${e.href}" target="_blank" rel="noopener"` : ''}><span class="date">${e.date}</span><div><h3>${e.title}</h3><p>${e.desc}</p></div>${e.img ? `<img src="${e.img}" alt="" loading="lazy">` : '<i></i>'}</a>`).join('')}</div></div>`),

    ...contactSecs('blue'),
  ].join('\n'),
});

// about, same look as the home page: photo hero, separate cards, wavy navy band
const factCards = [['cap', T.about.l_name.en, T.about.v_name.en], ['book', T.about.l_school.en, T.about.v_school.en], ['people', T.about.l_open.en, T.about.v_open.en], ['pin', T.about.l_loc.en, T.about.v_loc.en]];
const objCards = [['pen', 1, T.about.g1.en], ['chart', 2, T.about.g2.en], ['chip', 3, T.about.g3.en], ['robot', 4, T.about.g4.en]];
// extra detail behind the red band: rings bottom-left, a field of plus marks, a few accent dots
const DECO = '<svg class="rings2" viewBox="0 0 420 420" aria-hidden="true"><g fill="none" stroke="#fff"><circle cx="0" cy="420" r="110"/><circle cx="0" cy="420" r="190"/><circle cx="0" cy="420" r="270"/><circle cx="0" cy="420" r="350"/></g></svg><svg class="plus" viewBox="0 0 200 120" aria-hidden="true"><defs><pattern id="pl" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M20 14v12M14 20h12" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></pattern></defs><rect width="200" height="120" fill="url(#pl)"/></svg><i class="dot d1"></i><i class="dot d2"></i><i class="dot d3"></i>';
const years = [
  ['M.4', 'Foundations', 'Code, circuits and first robots.', [S('s13'), S('s14'), S('s11'), S('s12')]],
  ['M.5', 'Applied AI', 'Vision, deep learning and single-board computers.', [S('s27'), S('s41'), S('s42'), S('s54')]],
  ['M.6', 'Capstone', 'Independent research, robotics and the major project.', [S('s66'), S('s78'), S('s79')]],
];
page({
  file: 'about.html', title: 'About our major - Redstone Developer', active: 'about', theme: 'red',
  hero: { mid: true, photo: 'assets/img/1-IMG_2967.jpg', title: 'About us', row: `<div class="row"><p>The AI Engineering major: what it teaches, how the three years are laid out, and what every student must complete.</p><a href="join.html" class="btn">How to get in ${ic('arrow')}</a></div>` },
  body: [
    sec('white', `<div class="split"><div class="side"><h2>The major</h2><p class="muted">Mathayom 4–6 at Satit Prasarnmit Demonstration School, Bangkok.</p></div><p class="body-lg">${T.about.body.en}</p></div><div class="open four">${factCards.map(([i, k, v]) => `<div>${ic(i)}<small>${k}</small><p>${v}</p></div>`).join('')}</div>`, 'about'),
    sec('blue', `${WAVES}${DECO}${head('Three years at a glance', 'Same 40 periods a week every term. Credits run 14.0 to 15.5 a semester.')}<div class="cells three sep">${years.map(([y, t, d, s], n) => `<div class="cell tall yr yr2"><div class="rtop"><small>Year ${n + 1} · Semesters ${2 * n + 1} and ${2 * n + 2}</small>${bi(['code-slash', 'cpu', 'rocket-takeoff'][n])}</div><span class="rnum"><small>Mathayom</small><b>${y.slice(2)}</b></span><hr class="rl"><h3>${t}</h3><p>${d}</p><ul class="subj">${s.map(x => `<li>${x}</li>`).join('')}</ul></div>`).join('')}</div><div class="stats">${[['25', T.home.stat1_label.en], ['0–7', T.home.stat5_label.en], ['10+', T.home.stat2_label.en], ['3–5', T.home.stat3_label.en]].map(([n, l], i) => `<div style="--c:${['#a5f2cc', '#fff48c', '#f5cfff', '#ffffff'][i]}"><b>${n}</b><span>${l}</span></div>`).join('')}</div>`, 'years', 'wavy deco'),
    sec('white', `${head(T.curr.title.en, 'Subject codes are the school\'s own. Credits and periods per week.')}<div data-tabs><div class="tabs" role="tablist">${curr.filter(c => c.id !== 'grad').map(c => `<button class="tab" role="tab">${c.label}</button>`).join('')}</div>${curr.filter(c => c.id !== 'grad').map(c => `<div class="panel">${c.html}</div>`).join('')}</div>`, 'curriculum'),
    sec('blue', `${WAVE.replace('%s', 'top')}${WAVE.replace('%s', 'bot')}${head(T.curr.grad_title.en, T.curr.grad_note.en)}${rows([1, 2, 3, 4, 5, 6].map(n => [`0${n}`, T.curr['grad' + n].en]))}`, 'graduation', 'wavy'),
  ].join('\n'),
});

// join: green page, same look as the home page
const ARCS = WAVES.split('M0 0H1440V22C1260 48 1080 48 900 26C720 4 540 4 360 24C240 38 120 40 0 28Z').join('M0 0H1440C1440 0 1100 46 720 46C340 46 0 0 0 0Z');
const seats = [['people', '~25', T.admission.stat1_label.en], ['house-door', '~10', T.admission.stat2_label.en], ['globe2', '~15', T.admission.stat3_label.en], ['mortarboard', 'M.4', T.admission.stat4_label.en]];
const weights = [['calculator', T.admission.s_math.en, '25%'], ['lightning-charge', T.admission.s_sci.en, '25%'], ['translate', T.admission.s_eng.en, '25%'], ['chat-dots', T.admission.s_int.en, '10%'], ['book', T.admission.s_th.en, '10%']];
const faqIcons = ['code-slash', 'folder2-open', 'list-check', 'people', 'cpu', 'calendar-event', 'signpost-split'];
const gradIcons = ['people', 'lightbulb', 'trophy', 'building', 'rocket-takeoff', 'translate'];
const roundIcons = ['door-open', 'calendar-plus', 'globe2'];
const faqList = [1, 2, 3, 4, 5, 6, 7].map(n => `<div class="fq"><button class="fq-q" aria-expanded="false"><span class="qt">${bi(faqIcons[n - 1])}<span>${T.admission['q' + n].en}</span></span><i class="pm"></i></button><div class="fq-a"><div><p>${T.admission['a' + n].en}</p></div></div></div>`).join('');
page({
  file: 'join.html', title: 'How to get in - Redstone Developer', active: 'join', theme: 'green',
  hero: { mid: true, photo: 'assets/img/52-IMG_5110.jpg', title: 'How to get in', row: `<div class="row"><p>What we look for, how applicants are scored and the three rounds to get in. No coding exam, and instructors start from the fundamentals.</p><a href="#faq" class="btn">Read the FAQ ${ic('arrow')}</a></div>` },
  body: [
    sec('white', `<div class="head"><h2>${T.admission.req_title.en}</h2><p class="muted">No coding exam. Instructors start from the fundamentals.</p></div><div class="tbar"><div class="tg gpa"><b>≥ 2.00</b><p class="gnote">Cumulative GPA over 5 semesters. Same for internal and external applicants.</p><div class="lbl">${bi('graph-up-arrow')}<span>GPA</span></div></div>${weights.map(([i, l, p]) => `<div class="tg" style="--w:${parseInt(p)}"><b>${p}</b><div class="ticks ${parseInt(p) > 20 ? 'full' : 'soft'}">${'<i></i>'.repeat(parseInt(p))}</div><div class="lbl">${bi(i)}<span>${l}</span></div></div>`).join('')}</div><div class="facts three">${seats.slice(0, 3).map(([i, n, l]) => `<div>${bi(i)}<b>${n}</b><small>${l}</small></div>`).join('')}</div>`, 'requirements'),
    sec('white', `${head(T.admission.rounds_title.en, T.admission.rounds_sub.en, true)}<div class="cells three sep rounds">${[1, 2, 3].map(n => `<div class="cell tall yr short"><div class="rtop"><small>${T.admission['r' + n + '_tag'].en}</small>${bi(roundIcons[n - 1])}</div><span class="rnum"><small>Round</small><b>${n}</b></span><hr class="rl"><h3>${T.admission['r' + n + '_title'].en}</h3><p>${T.admission['r' + n + '_desc'].en}</p></div>`).join('')}</div>`, 'rounds'),
    sec('white', `<div class="split"><div class="side"><h2>${T.admission.faq_title.en}</h2><p class="muted">Short answers to what applicants ask most.</p></div><div>${faqList}</div></div>`, 'faq'),
  ].join('\n'),
});

// works: white page, every contest written out on a tall vertical card with labelled blocks
const compPhoto = copyImg('banner-competitions.jpg', 'banner-competitions.jpg');
const compIcons = ['award', 'trophy', 'cash-coin', 'robot', 'gear-wide-connected', 'laptop', 'code-slash', 'shield-lock', 'lightbulb', 'cpu', 'rocket-takeoff'];
// Samsung Solve for Tomorrow: one card per year. 2026 Ailarp is a semifinalist (11th); 2025 Capmoo took first place.
{
  const s = comps.findIndex(c => /Samsung/.test(c.title));
  const src = comps[s];
  const of = t => src.parts.filter(p => p[0] === t);
  const [teamA, teamB] = of('people');
  const [labA, labB] = of('people-label');
  const [offUrl, fbUrl, prevUrl] = of('link');
  const intro = of('note')[0];
  comps.splice(s, 1,
    { date: '2026', title: 'Samsung Solve for Tomorrow 2026', meta: 'Semifinalist (11th) - team Ailarp, "Edu_Hub" AI tutoring platform',
      parts: [['badge', 'Semifinalist (11th)'], intro, ['winner', '<strong>Ailarp</strong> finished as a semifinalist (11th) with "Edu_Hub," an AI tutoring platform.'], labA, teamA, offUrl, fbUrl] },
    { date: '2025', title: 'Samsung Solve for Tomorrow 2025', meta: 'First place - team Capmoo, "Boxar" boxing coach mobile app',
      parts: [['badge', 'First place'], intro, ['winner', '<strong>Capmoo</strong> took first place with "Boxar," a boxing coach mobile app.'], labB, teamB, offUrl, ['link', prevUrl[1], 'View on Facebook']] });
}
const compCard = (c, n) => {
  let badge = '', about = '', result = '', team = '', links = '';
  for (const p of c.parts) {
    if (p[0] === 'badge') badge = p[1];
    else if (p[0] === 'note') { if (!about) about = `<p>${p[1]}</p>`; else team += `<p class="wk-aside">${p[1]}</p>`; }
    else if (p[0] === 'winner') result = `<p>${p[1]}</p>`;
    else if (p[0] === 'people-label') team += `<p class="wk-lbl">${p[1]}</p>`;
    else if (p[0] === 'people') team += `<ul class="wk-team">${p[1].map(x => `<li>${x}</li>`).join('')}</ul>`;
    else if (p[0] === 'link') links += `<a href="${p[1]}" target="_blank" rel="noopener">${p[2]} ↗</a>`;
  }
  const block = (t, h) => h ? `<div class="wk-blk"><h4>${t}</h4>${h}</div>` : '';
  return `<article class="wk"><div class="wk-top"><span>${c.date}</span>${bi(compIcons[n])}</div><h3>${c.title}</h3><p class="wk-meta">${c.meta}</p>${badge ? `<p class="wk-badge">${bi('award')}<span>${badge}</span></p>` : ''}${block('About', about)}${block('Result', result)}${block('Team', team)}${links ? `<div class="links-row">${links}</div>` : ''}</article>`;
};
page({
  file: 'works.html', title: 'Works - Redstone Developer', active: 'works',
  hero: { mid: true, photo: compPhoto, title: 'Works', row: `<div class="row"><p>${comps.length} contests from 2024 to 2026, each with its result, its team and the links.</p></div>` },
  body: [sec('white', `${head(`${comps.length} contests`, 'Newest first. Each card says what the contest is, what we did, who was on the team and where to read more.')}<div class="works">${comps.map(compCard).join('')}</div>`, 'contests'),
    sec('blue', `${head('Part of the curriculum', 'Entering a contest or innovation event is one of the major\'s graduation requirements.')}${rows([['Graduation requirements', 'See everything a student must complete by M.6', '↗', 'about.html#graduation'], ['How to get in', 'Criteria, score weights and the three rounds', '↗', 'join.html'], ['Moment', 'Camps, workshops and field trips', '↗', 'moment.html']])}`),
  ].join('\n'),
});

// Instagram posts for the Life at PSM section on the moment page (share tokens stripped from the links)
const igLife = ['DdoBIyCk9_z', 'DdZFw6ME2r1', 'DdZEwE7k_Yk', 'DdHFF-6kzON', 'DdHE9Znk8f6', 'Dc0_4xgkzQ2', 'DcnFOzbE5vw', 'DcnFCt4E3wV', 'DclOTgok271', 'DclN4B9k5FW', 'Dci23ook0LF', 'Db-7854kwM6'];
// moment: every activity with its photo (replaces the old design page)
page({
  file: 'moment.html', title: 'Moments - Redstone Developer', active: 'moment',
  hero: { mid: true, photo: 'assets/img/moments/hero.jpg', title: 'Moments', row: `<div class="row"><p>Camps, open house days, workshops and field trips from the AI Engineering major. Every card is one activity with its photo, a short description and the link to the original post, from the annual major camp to visits to rail, automation and semiconductor sites.</p></div>` },
  body: [
    sec('white', `${head(`${events.length} activities`, 'Camps, workshops and field trips, newest first. Each card links to the original post.')}<div class="moments">${events.map(e => `<article class="mo">${e.img ? `<img src="${e.img}" alt="${e.title}" loading="lazy">` : ''}<div class="mo-b"><span class="mo-d">${e.date}</span><h3>${e.title}</h3><p>${e.desc}</p>${e.href ? `<div class="links-row"><a href="${e.href}" target="_blank" rel="noopener">View on Facebook ↗</a></div>` : ''}</div></article>`).join('')}</div>`, 'moments'),
    photoSec('white', 'ruled'),
    sec('blue', `${head('Be part of the next one', 'See how to get in, or follow the major to hear about the next camp, workshop or trip.')}${rows([['How to get in', 'Criteria, score weights and the three rounds', '↗', 'join.html'], ['Works', 'The contests we entered and what came of them', '↗', 'works.html'], ['Life at PSM', 'Photos and posts from everyday school life', '↗', 'env.html'], ['Documentation', 'Labs and projects written up for the next cohort', '↗', 'docs.html']])}`),
  ].join('\n'),
});

// ci: the rules every Redstone page follows
const sw = (name, hex, bg, fg, note) => `<div class="swc" style="background:${bg};color:${fg}"><button class="cp" type="button" data-copy="${/^#/.test(hex) ? hex : 'rgba(0, 0, 0, .84)'}" aria-label="Copy ${hex}"><svg class="icon bi-ic c"><use href="#bi-clipboard"/></svg><svg class="icon bi-ic ok"><use href="#bi-check2"/></svg></button><b>${name}</b><span>${hex}</span>${note ? `<small>${note}</small>` : ''}</div>`;
const biIc = n => `<svg class="icon bi-ic"><use href="#bi-${n}"/></svg>`;
page({
  file: 'ci.html', title: 'Our CI - Redstone Developer', active: 'ci', theme: 'ci',
  hero: { mid: true, photo: 'assets/img/1-IMG_2967.jpg', title: 'Our CI' },
  body: [
    sec('white', `${head('Font', 'One typeface, one weight, for Latin and Thai.')}<div class="specimen">Aa</div><p class="lead">LINE Seed Sans TH, regular. Size and colour make the hierarchy. No bold and no capitals.</p><div class="scale"><div><small>Display</small><span>clamp(2rem, 7vw, 4.4rem)</span><small>Hero titles</small></div><div><small>Heading</small><span>1.5rem</span><small>Section titles, stacked above their line</small></div><div><small>Title</small><span>1.05rem</span><small>Card titles</small></div><div><small>Body</small><span>14px, line height 1.7</span><small>Text</small></div><div><small>Small</small><span>.72rem to .8rem</span><small>Labels, captions, footer</small></div></div>`),
    sec('white', `${head('Colour', 'White plus one colour per page. Pages alternate between the two.')}<h3 class="sub" style="margin-top:0">Page colours</h3><div class="sw">${sw('Redstone navy', '#292d7a', '#292d7a', '#fff', 'Home, Works, Moment, Docs, Env, CI')}${sw('Red', '#f5423d', '#f5423d', '#fff', 'About')}${sw('Green', '#8acd6e', '#8acd6e', '#14163f', 'Join')}</div><h3 class="sub">Neutrals</h3><div class="sw">${sw('White', '#ffffff', '#fff', '#000', 'Every other section')}${sw('Ink', '#000000', '#000', '#fff', 'Text on white')}${sw('Deep navy', '#14163f', '#14163f', '#fff', 'Text on green and on white cards')}${sw('Muted', '#5c5c5c', '#5c5c5c', '#fff', 'Captions')}${sw('Surface', '#f4f4f4', '#f4f4f4', '#000', 'Code, quiet fills')}${sw('Photo filter', 'black at 84%', 'linear-gradient(rgba(0,0,0,.84),rgba(0,0,0,.84)),#8a8a8a', '#fff', 'The only thing a photo gets')}</div><h3 class="sub">Accents</h3><div class="sw">${sw('Yellow', '#fff48c', '#fff48c', '#14163f', '')}${sw('Mint', '#a5f2cc', '#a5f2cc', '#14163f', '')}${sw('Lilac', '#f5cfff', '#f5cfff', '#14163f', '')}${sw('Orange', '#ffb162', '#ffb162', '#14163f', '')}</div><p class="lead" style="margin-top:20px">Text on red and navy is white. Text on green and the accents is deep navy, because white is too faint there. No more than three accents in one view.</p>`),
    sec('white', `${head('Page layout', 'The same frame on every page.')}${rows([['01', 'Nav: site name left, pages centred, Q&A, Instagram and GitHub right. No blur. It is clear over a photo, the page colour over a colour and white over white.'], ['02', 'Hero: a photo under a dark filter only, or the page colour. One centred title, one short line under it and a "See more" cue. Every hero is the same height.'], ['03', 'Body: content is 1200px wide. Section headings sit above their line, left aligned.'], ['04', 'Sections alternate white and the page colour. A colour band between two whites gets curved edges, a faint dot grid and rings.'], ['05', 'Footer on every page: all page links, then the official channels, each with a redirect arrow.']])}`),
    sec('white', `${head('Cards', 'Separate cards, never joined into one box.')}${rows([['01', 'A card has its own outline and a 12px gap to the next. No lines inside a card, parts are split by spacing.'], ['02', 'A card that links fills with the page colour on hover (white on a colour section). Text and icon turn white.'], ['03', 'Link cards put the year or label top left, one big centred icon, then the title and the action at the bottom.'], ['04', 'Lists of links are ruled rows: label, short text and a redirect arrow.'], ['05', 'No bubbles. Tags are plain text, tabs are underlined text.']])}`),
    sec('white', `${head('Shape and icons')}<div class="shapes"><div style="border-radius:14px">14px cards</div><div style="border-radius:8px">8px buttons</div><div style="border-radius:999px">999px pills</div></div><h3 class="sub">Icons</h3><div class="icons8">${['mortarboard', 'door-open', 'trophy', 'camera', 'palette', 'journal-text', 'images', 'github'].map(n => `<div>${biIc(n)}<small>${n}</small></div>`).join('')}</div><p class="lead" style="margin-top:16px">Bootstrap Icons, saved with the site. They carry meaning and are never decoration. Link cards use them large, 64px.</p>`),
    sec('white', `${head('Photos', 'Our own photos, sized for the web.')}${rows([['01', 'Only a dark filter goes over a photo. No tint, no blend.'], ['02', 'Photos are resized copies, 1000 to 1800px wide. Originals are never edited.'], ['03', 'Hero photos: 84% black. Life at PSM is 90%.']])}`),
  ].join('\n'),
});

// docs: same look as the community page, Medium articles only for now (report pages are off, flip SHOW_REPORTS to bring them back)
const SHOW_REPORTS = false;
const articles = [
  ['https://medium.com/@raphee.rattanamanoonporn/in-the-era-of-ai-pursuing-a-degree-in-computer-science-is-still-a-good-option-or-not-b6499e1778a2', 'Is a CS degree still a good option in the AI era?', 'assets/img/post/web/2.jpg'],
  ['https://medium.com/@raphee.rattanamanoonporn/product-design-directions-014c22dc13b3', 'Product design directions', 'assets/img/post/web/8.jpg'],
];
const GH = 'https://github.com/eai-spsm/';
const classwork = [
  ['M.4', [['Basic Python', 'M.4-Classwork/tree/main/Code%20-%20Basic%20Python', 'code-slash'], ['Line Dialogflow', 'M.4-Classwork/tree/main/Code%20-%20Line%20Dialogflow', 'chat-dots'], ['Microcontroller', 'M.4-Classwork/tree/main/Code%20-%20Microcontroller', 'cpu'], ['Robot', 'M.4-Classwork/tree/main/Code%20-%20Robot', 'robot']]],
  ['M.5', [['Computer Vision', 'M.5-Classwork/tree/main/Code%20-%20Computer%20Vision', 'eye'], ['Raspi', 'M.5-Classwork/tree/main/Code%20-%20Raspi', 'motherboard']]],
];
const gcard = (y, [t, p, i]) => `<a class="cell gh" href="${GH}${p}" target="_blank" rel="noopener"><small class="gy">${y}</small><span class="gico">${bi(i)}</span><h3>${t}</h3><em>View on GitHub ↗</em></a>`;
const docPhoto = copyImg('banner-classwork.jpg', 'banner-classwork.jpg');
page({
  file: 'docs.html', title: 'Documentation - Redstone Developer', active: 'docs',
  hero: { mid: true, photo: docPhoto, title: 'Documentation' },
  body: [
    sec('white', `${head('Classwork', 'Code from our classes, kept in the eai-spsm GitHub organisation.')}${classwork.map(([y, list], n) => `<h3 class="sub"${n ? '' : ' style="margin-top:0"'}>${y}</h3><div class="cells four sep">${list.map(c => gcard(y, c)).join('')}${y === 'M.5' ? '<div class="cell gh soon"><small class="gy">M.5</small><span class="gico">' + bi('plus-lg') + '</span><h3>More upcoming</h3><em>Added as the year goes on</em></div>' : ''}</div>`).join('')}<div class="fnote">${bi('github')}<p><b>Our work lives on GitHub.</b> We keep it in the eai-spsm GitHub organisation, and you are welcome to join. <a class="link" href="https://github.com/eai-spsm" target="_blank" rel="noopener">Open the organisation ↗</a></p></div>`, 'classwork'),
    sec('white', `${head('From our Medium', `${articles.length} articles. Each card opens the original on Medium.`)}<div class="cells four sep">${articles.map(([u, t]) => `<a class="cell gh art" href="${u}" target="_blank" rel="noopener"><small class="gy">Medium</small><span class="gico">${bi('medium')}</span><h3>${t}</h3><em>Read on Medium ↗</em></a>`).join('')}</div>`, 'articles', 'ruled'),
    sec('blue', `${head('More docs coming', 'Have a lab, report or article to add? Just send us your link and we will list it here.')}${rows([['Email us', 'raphee.rattanamanoonporn@gmail.com', '↗', 'mailto:raphee.rattanamanoonporn@gmail.com'], ['School email', '024329@spsm.ac.th', '↗', 'mailto:024329@spsm.ac.th'], ['Q&A on LINE', 'Ask in the Openchat', '↗', LINE]])}`, 'send'),
  ].join('\n'),
});

// one page per report
// report banners: the numbered photos in assets/img, one per report
const banners = fs.readdirSync(path.join(OUT, 'assets/img')).filter(f => /^\d+-.*\.jpg$/i.test(f)).sort();
(SHOW_REPORTS ? Object.entries(REPORTS) : []).forEach(([id, r], i) => {
  const e = r.en;
  const body = e.body.replace(/<i class="bi[^"]*"><\/i>/g, '');
  for (const f of body.matchAll(/assets\/img\/([^"]+)"/g)) copyImg(decodeURIComponent(f[1]), decodeURIComponent(f[1]));
  page({
    file: `doc-${id}.html`, title: `${e.title} - Redstone Developer`, active: 'docs',
    hero: null,
    body: sec('white', `<div class="rwrap"><figure class="rbanner"><img src="assets/img/${banners[i % banners.length]}" alt=""></figure><header class="rhead"><p class="small"><a href="docs.html">← Documentation</a></p><p class="muted small">${e.eyebrow} · ${e.date}</p><h1>${e.title}</h1><p class="muted">${e.meta}</p></header><div class="report">${body}</div><p class="tc" style="margin-top:44px"><a class="btn dark" href="docs.html">Back to documentation</a></p></div>`, '', 'rtop'),
  });
});

// alumni: every generation with names, a search box, and the by-university chart
const aEsc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const rosterTable = list => '<div class="table-wrap"><table class="roster"><thead><tr><th>No.</th><th>Name</th><th>University</th><th>Faculty / Major</th></tr></thead><tbody>' + list.map((p, i) => '<tr data-s="' + aEsc((p.name + ' ' + p.uni + ' ' + p.fac + ' ' + p.code).toLowerCase()) + '"><td>' + (i + 1) + '</td><td>' + aEsc(p.name) + '</td><td>' + (aEsc(p.uni) || '-') + '</td><td>' + (aEsc(p.fac) || '-') + '</td></tr>').join('') + '</tbody></table></div>';
const genEntries = Object.entries(ALUMNI);
// one bar, 100% of the alumni with a placement, one tick per percent; full names listed under it
const biN = n => '<svg class="icon bi-ic"><use href="#bi-' + n + '"/></svg>';
const FULLNAME = { ...UNI, 'มหาวิทยลัยหอการไทย': 'University of the Thai Chamber of Commerce', 'Swinburne University of tech…': 'Swinburne University of Technology', 'Zhejiang University of Techn…': 'Zhejiang University of Technology', 'National University of Singa…': 'National University of Singapore', CATC: 'Civil Aviation Training Center', SU: 'Silpakorn University' };
const uniBar = list => {
  const total = list.reduce((a, [, u]) => a + u.n, 0);
  const TOP = 5;
  const segs = list.slice(0, TOP).map(([c, u]) => ({ label: c, n: u.n }));
  const rest = list.slice(TOP);
  segs.push({ label: 'Others', n: rest.reduce((a, [, u]) => a + u.n, 0) });
  // percentages that add up to exactly 100 (largest remainder)
  const raw = segs.map(x => (x.n / total) * 100);
  const pc = raw.map(Math.floor);
  let left = 100 - pc.reduce((a, c) => a + c, 0);
  raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left-- > 0) pc[i]++; });
  const bar = '<div class="tbar ubar">' + segs.map((x, i) => '<div class="tg" style="--w:' + pc[i] + '"><b>' + pc[i] + '%</b><div class="ticks ' + (pc[i] >= 15 ? 'full' : 'soft') + '">' + '<i></i>'.repeat(pc[i]) + '</div><div class="lbl"><span>' + x.label + ' · ' + x.n + '</span></div></div>').join('') + '</div>';
  const top = list.slice(0, TOP);
  const legend = '<div class="udet one"><div class="ud"><div class="ut2"><b>' + rest.reduce((a, [, u]) => a + u.n, 0) + '</b><small>alumni in ' + rest.length + ' other schools</small></div><p class="oth">' + rest.map(([c, u]) => (FULLNAME[c] || c) + (u.n > 1 ? ' (' + u.n + ')' : '')).join(', ') + '</p></div></div>';
  return bar + legend + '<div class="fnote">' + biN('info-circle') + '<p><b>Heads up.</b> This data may not be fully accurate, and we keep updating it as results come in.</p></div>';
};
page({
  file: 'alumni.html', title: 'University Path - Redstone Developer', active: 'alumni',
  hero: { mid: true, photo: 'assets/img/life/web/20240805_155414.jpg', title: 'University Path' },
  body: [
    sec('white', head('By university', uniList.reduce((a, [, u]) => a + u.n, 0) + ' alumni with a placement, as one 100% bar: one tick is one percent. Over 72% got in through TCAS Round 1. The rest of the ' + alumniAll.length + ' have not announced yet. ') + uniBar(uniList), 'by-uni'),
    sec('white', head('Every generation', 'Every generation\'s university placements, sorted by cohort. Search a name, a university or a faculty.') +
      '<div class="fnote slim">' + biN('info-circle') + '<p>Names and placements may not be fully accurate. We keep updating them.</p></div><div class="rtool"><div class="rsearch"><div class="rfield"><input type="text" id="rsearch" placeholder="Search a name or a university: CU, TU, KU, KMITL..." aria-label="Search alumni" autocomplete="off"><button type="button" id="rclear" aria-label="Clear search" hidden>×</button></div><span id="rcount" aria-live="polite"></span></div></div>' +
      '<div data-tabs id="roster"><div class="tabs" role="tablist">' + genEntries.map(([g, l]) => '<button class="tab" role="tab">Gen ' + g.slice(3) + ' · ' + l.length + '</button>').join('') + '</div>' +
      genEntries.map(([g, l]) => '<div class="panel">' + rosterTable(l) + '</div>').join('') + '</div><p class="none" id="rnone" hidden>No alumni match that search.</p>', 'roster', 'ruled'),
  ].join('\n'),
});

// tools: every tool is a small card with its logo; categories alternate white and the page colour
const catIcon = { cat_lang: 'braces', cat_ide: 'code-square', cat_ext: 'puzzle', cat_ai: 'robot', cat_ml: 'cpu', cat_cloud: 'cloud', cat_design: 'box', cat_repos: 'github', cat_senior: 'mortarboard', cat_research: 'journal-text' };
const toolMedia = (t, c) => {
  if (t.slug && fs.existsSync(path.join(OUT, 'assets/tools', t.slug + '.svg'))) return '<img src="assets/tools/' + t.slug + '.svg" alt="" loading="lazy">';
  const own = t.icon && TOOLBI.includes(t.icon.replace(/^bi-/, '')) ? t.icon.replace(/^bi-/, '') : (c.fallback || '').replace(/^bi-/, '');
  return '<svg class="icon bi-ic"><use href="#bi-' + own + '"/></svg>';
};
const toolCard = (t, c) => (t.url ? '<a class="tcard" href="' + t.url + '" target="_blank" rel="noopener">' : '<div class="tcard">') + '<span class="tm">' + toolMedia(t, c) + '</span><span class="tn">' + t.name + '</span>' + (t.url ? '</a>' : '</div>');
page({
  file: 'tools.html', title: 'Tool stack - Redstone Developer', active: 'tools',
  hero: { mid: true, photo: 'assets/img/1-IMG_2967.jpg', title: T.tools.title.en },
  body: TOOLS.map((c, i) => sec(i % 2 ? 'blue' : 'white', '<div class="split tsplit"><div class="side"><div class="tcat"><svg class="icon bi-ic"><use href="#bi-' + (catIcon[c.key] || 'box') + '"/></svg></div><h2>' + T.tools[c.key].en + '</h2><p class="muted">' + c.tools.length + ' tools</p></div><div class="tgrid">' + c.tools.map(t => toolCard(t, c)).join('') + '</div></div>', c.key, i % 2 ? '' : (i ? 'ruled' : ''))).join('\n'),
});

// community: Life at PSM gallery, then the channels
const SCHOOLFACTS = [["clock","07:45","Homeroom","Later than this is late"],["pc-display","1909","AI computer room","9th floor, our room"],["person-workspace","1911–1912","Teacher office","Rooms 1911 and 1912"],["cup-hot","11:20–12:55","Lunch","Best to leave early: by 11:20 the lines are already packed"]];
const DAYFACTS = [["train-front","~20 min","To ARL Makkasan","Average from the school"],["train-front","~10 min","To MRT Phetchaburi","Average from the school"],["bicycle","15 THB","Motorcycle taxi","To the BTS Asok / MRT Sukhumvit interchange"],["shop","20 THB","Motorcycle taxi","To Terminal 21"]];
const ENVCARDS = [["train-front","Train","BTS Asok / MRT Sukhumvit","Also MRT Phetchaburi, ARL Makkasan"],["bus-front","Bus","Asok Montri Road","Routes 38 and 136"],["water","Boat","Asok pier or Prasarnmit pier","Saen Saep canal boat"],["bicycle","Motorcycle taxi","Any station exit","For the last stretch"],["shop","Malls","Terminal 21 at Asok","Central Rama 9 at MRT Phra Ram 9"],["geo-alt","School","SWU Prasarnmit campus","Sukhumvit 23, Watthana"]];
const PLACES = [{"n":1,"k":"campus","name":"Satit Prasarnmit","sub":"SWU Prasarnmit campus, Sukhumvit 23","ll":[13.745184,100.564975]},{"n":2,"k":"bts","name":"BTS Asok","sub":"Interchange with MRT Sukhumvit","ll":[13.737043,100.560357]},{"n":3,"k":"mrt","name":"MRT Sukhumvit","sub":"Interchange with BTS Asok","ll":[13.737467,100.561498]},{"n":4,"k":"mall","name":"Terminal 21","sub":"Right at Asok","ll":[13.73791,100.55934]},{"n":5,"k":"mrt","name":"MRT Phetchaburi","sub":"Exit 2 to the Asok pier","ll":[13.7492,100.563337]},{"n":6,"k":"arl","name":"ARL Makkasan","sub":"Airport Rail Link","ll":[13.750908,100.561142]},{"n":7,"k":"boat","name":"Asok pier","sub":"Saen Saep canal boat","ll":[13.747855,100.562948]},{"n":8,"k":"boat","name":"Prasarnmit pier","sub":"Saen Saep canal boat","ll":[13.74739,100.565741]},{"n":9,"k":"mrt","name":"MRT Phra Ram 9","sub":"Next to Central Rama 9","ll":[13.757816,100.565277]},{"n":10,"k":"mall","name":"Central Rama 9","sub":"Mall beside MRT Phra Ram 9, position approximate","ll":[13.7583,100.5659]}];
const life = fs.readdirSync(path.join(OUT, 'assets/img/life/web')).filter(f => /\.jpg$/i.test(f)).sort();
const lifeSpan = [[7, 'a'], [5, 'a'], [4, 'b'], [4, 'b'], [4, 'b'], [5, 'c'], [7, 'c'], [12, 'd']];
page({
  file: 'env.html', title: 'Env - Redstone Developer', active: 'env',
  hero: { mid: true, dark: .9, focus: 'center bottom', photo: 'assets/img/life/web/20240619_092142.jpg', title: 'Life at PSM', row: `<div class="row"><p>Class days, lab sessions and the people in them: a look at everyday life in the AI Engineering major at Satit Prasarnmit, Mathayom 4 to 6.</p></div>` },
  body: [
    sec('white', `${head('A day here', 'The numbers that matter when you plan your morning.')}<div class="facts four sm">${SCHOOLFACTS.map(([i, v, l, n]) => `<div>${bi(i)}<b>${v}</b><small>${l}</small><em>${n}</em></div>`).join('')}</div><div class="fnote">${bi('play-circle')}<p><b>Flipped classroom.</b> Some periods are flipped: you watch the lesson as a video. If the flipped period is the last one of the day, you may be able to leave early, and if the whole afternoon is flipped, possibly the whole afternoon.</p></div>`, 'times'),
    sec('white', `${head('Living around Asok', 'How to get here, and where to get off.')}<div class="cells three sep">${ENVCARDS.map(([i, t, stop, also]) => `<div class="cell env2"><small class="gy">${t}</small><span class="gico">${bi(i)}</span><small class="off">Get off at</small><h3>${stop}</h3><em>${also}</em></div>`).join('')}</div>`, 'around', 'ruled'),
    sec('blue', `${WAVES}${DECO}${head('Map', 'The school, the stations, the boat piers and the malls. Tap a place to find it.')}<ul class="key"><li><i class="pin k-bts"></i>BTS</li><li><i class="pin k-mrt"></i>MRT</li><li><i class="pin k-arl"></i>Airport Rail Link</li><li><i class="pin k-mall"></i>Mall or campus</li><li><i class="pin k-boat"></i>Boat pier</li></ul><div class="mapwrap"><div id="map" class="mapbox" role="region" aria-label="Map around Satit Prasarnmit"></div><ol class="plist">${PLACES.map(p => `<li><button type="button" data-p="${p.n - 1}"><i class="pin k-${p.k}">${p.n}</i><span><b>${p.name}</b><small>${p.sub}</small></span></button></li>`).join('')}</ol></div><p class="small" style="margin-top:14px;opacity:.8">Map data © OpenStreetMap contributors. Stop positions are approximate.</p><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css"><script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script><script>window.PLACES=${JSON.stringify(PLACES)};</script>`, 'where', 'wavy deco'),
    sec('white', `${head('From our Instagram', `${igLife.length} posts from the major's Instagram. Each card opens the original post.`)}<div class="igs">${igLife.map((c, i) => `<a class="ig" href="https://www.instagram.com/p/${c}/" target="_blank" rel="noopener"><img src="assets/img/post/web/${i + 1}.jpg" alt="Life at PSM, post ${i + 1}" loading="lazy"><div class="ig-t">${bi('instagram')}<span>${String(i + 1).padStart(2, '0')}</span></div><div class="ig-b"><em>View on Instagram ↗</em></div></a>`).join('')}</div>`, 'posts'),
    photoSec('blue'),
  ].join('\n'),
});
