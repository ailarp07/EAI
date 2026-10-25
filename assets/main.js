// nav takes the tone of whatever section sits under it
const nav = document.querySelector('.nav');
const tone = () => {
  const y = nav.offsetHeight / 2;
  const el = document.elementsFromPoint(innerWidth / 2, y).find(e => !nav.contains(e) && e.closest('[data-tone]'));
  nav.dataset.tone = el ? el.closest('[data-tone]').dataset.tone : 'blue';
};
addEventListener('scroll', tone, { passive: true });
addEventListener('resize', tone);
tone();

// tabs: only active when this script runs, so no-JS shows every panel
document.querySelectorAll('[data-tabs]').forEach(box => {
  document.documentElement.classList.add('js');
  const tabs = [...box.querySelectorAll('.tab')];
  const panels = [...box.querySelectorAll('.panel')];
  const pick = i => {
    tabs.forEach((t, n) => t.setAttribute('aria-selected', n === i));
    panels.forEach((p, n) => (p.hidden = n !== i));
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => pick(i)));
  pick(0);
});

// faq: smooth accordion
document.querySelectorAll('.fq-q').forEach(btn => btn.addEventListener('click', () => {
  const open = btn.parentElement.classList.toggle('is-open');
  btn.setAttribute('aria-expanded', open);
}));

// copy buttons: put a colour value on the clipboard
document.addEventListener('click', e => {
  const btn = e.target.closest('.cp');
  if (!btn) return;
  const v = btn.dataset.copy;
  const done = () => { btn.classList.add('done'); setTimeout(() => btn.classList.remove('done'), 1200); };
  if (navigator.clipboard) navigator.clipboard.writeText(v).then(done, done);
  else { const a = document.createElement('textarea'); a.value = v; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (err) {} a.remove(); done(); }
});

// env map: Leaflet + OpenStreetMap, one numbered pin per place
(function () {
  const el = document.getElementById('map');
  if (!el || !window.PLACES) return;
  const start = () => {
    if (!window.L) return setTimeout(start, 150);
    const map = L.map(el, { scrollWheelZoom: false }).setView(PLACES[0].ll, 15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    const markers = PLACES.map(p => {
      const icon = L.divIcon({ className: '', html: '<i class="pin k-' + p.k + '">' + p.n + '</i>', iconSize: [26, 26], iconAnchor: [13, 13] });
      return L.marker(p.ll, { icon, title: p.name }).addTo(map).bindPopup('<b>' + p.name + '</b><br>' + p.sub);
    });
    map.fitBounds(L.latLngBounds(PLACES.map(p => p.ll)).pad(0.15));
    document.querySelectorAll('.plist button').forEach(btn => btn.addEventListener('click', () => {
      const i = +btn.dataset.p;
      map.flyTo(PLACES[i].ll, 16, { duration: 0.6 });
      markers[i].openPopup();
    }));
    setTimeout(() => map.invalidateSize(), 300);
  };
  start();
})();

// alumni roster search: hide rows that do not match, jump to the first generation that has a match
(function () {
  const input = document.getElementById('rsearch');
  const box = document.getElementById('roster');
  if (!input || !box) return;
  const count = document.getElementById('rcount');
  const none = document.getElementById('rnone');
  const tabs = [...box.querySelectorAll('.tab')];
  const panels = [...box.querySelectorAll('.panel')];
  const clr0 = document.getElementById('rclear');
  if (clr0) clr0.addEventListener('click', () => { input.value = ''; input.dispatchEvent(new Event('input')); input.focus(); });
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    let total = 0, first = -1;
    panels.forEach((p, i) => {
      let n = 0;
      p.querySelectorAll('tbody tr').forEach(r => {
        const hit = !q || r.dataset.s.includes(q);
        r.classList.toggle('dim', !hit);
        if (hit) n++;
      });
      if (q && n && first < 0) first = i;
      total += n;
    });
    const clr = document.getElementById('rclear'); if (clr) clr.hidden = !q;
    count.textContent = q ? total + ' match' + (total === 1 ? '' : 'es') : '';
    none.hidden = !q || total > 0;
    if (first >= 0 && !panels.some((p, i) => !p.hidden && p.querySelector('tbody tr:not(.dim)'))) tabs[first].click();
  });
})();

// phone nav: menu button opens and closes the link panel
(function () {
  const nav = document.querySelector('.nav');
  const btn = nav && nav.querySelector('.nav-toggle');
  if (!btn) return;
  const set = open => { nav.classList.toggle('menu-open', open); btn.setAttribute('aria-expanded', open); };
  btn.addEventListener('click', () => set(!nav.classList.contains('menu-open')));
  nav.querySelectorAll('.npanel a').forEach(a => a.addEventListener('click', () => set(false)));
  addEventListener('resize', () => { if (innerWidth > 900) set(false); });
  document.addEventListener('click', e => { if (nav.classList.contains('menu-open') && !e.target.closest('.npanel') && !e.target.closest('.nav-toggle')) set(false); });
})();
