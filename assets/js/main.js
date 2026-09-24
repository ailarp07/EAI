(function () {
  const root = document.documentElement;
  const themeKey = "engineers-theme";
  const langKey = "engineers-lang";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    const icon = document.querySelector("#themeToggle i");
    if (icon) icon.className = theme === "dark" ? "bi bi-sun" : "bi bi-moon-stars";
  }

  function applyLang(lang) {
    root.setAttribute("lang", lang);
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const path = el.getAttribute("data-i18n").split(".");
      let node = translations;
      for (const key of path) node = node && node[key];
      if (node && node[lang]) el.innerHTML = node[lang];
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      const path = el.getAttribute("data-i18n-ph").split(".");
      let node = translations;
      for (const key of path) node = node && node[key];
      if (node && node[lang]) el.placeholder = node[lang];
    });
    const langLabel = document.querySelector("#langToggle span");
    if (langLabel) langLabel.textContent = lang === "en" ? "TH" : "EN";
  }

  const savedTheme = localStorage.getItem(themeKey) || "light";
  const savedLang = localStorage.getItem(langKey) || "en";
  applyTheme(savedTheme);
  applyLang(savedLang);

  document.getElementById("themeToggle")?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    localStorage.setItem(themeKey, next);
    applyTheme(next);
  });

  document.getElementById("langToggle")?.addEventListener("click", () => {
    const next = root.getAttribute("lang") === "en" ? "th" : "en";
    localStorage.setItem(langKey, next);
    applyLang(next);
  });

  document.getElementById("navToggle")?.addEventListener("click", (e) => {
    const isOpen = document.querySelector(".nav-links")?.classList.toggle("open");
    const icon = e.currentTarget.querySelector("i");
    if (icon) icon.className = isOpen ? "bi bi-x-lg" : "bi bi-list";
  });

  document.querySelectorAll("[data-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById(btn.dataset.modal)?.classList.add("open");
    });
  });

  document.querySelectorAll(".popup").forEach((popup) => {
    popup.addEventListener("click", (e) => {
      if (e.target === popup || e.target.closest("[data-close]")) {
        popup.classList.remove("open");
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelector(".popup.open")?.classList.remove("open");
    }
  });

  const navEl = document.querySelector(".nav");
  const banner = document.querySelector(".hero-banner");
  if (navEl && banner) {
    const onScroll = () => {
      const solid = window.scrollY > banner.offsetHeight - 80;
      navEl.classList.toggle("solid", solid);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function toggleAccordion(item, detail) {
    if (!detail) return;
    const isOpen = item.classList.toggle("open");
    detail.style.maxHeight = isOpen ? detail.scrollHeight + "px" : "0px";
    const ancestorDetail = item.parentElement?.closest(".comp-detail");
    if (ancestorDetail && ancestorDetail.style.maxHeight && ancestorDetail.style.maxHeight !== "0px") {
      requestAnimationFrame(() => {
        ancestorDetail.style.maxHeight = ancestorDetail.scrollHeight + "px";
      });
    }
  }

  document.querySelectorAll(".faq-item .faq-q").forEach((btn) => {
    const item = btn.closest(".faq-item");
    btn.addEventListener("click", () => toggleAccordion(item, item.querySelector(".faq-a")));
  });

  document.querySelectorAll(".comp-row").forEach((btn) => {
    const item = btn.closest(".comp-item");
    if (!item) return;
    btn.addEventListener("click", () => toggleAccordion(item, item.querySelector(".comp-detail")));
  });

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const group = btn.closest(".container-xl");
      group.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
      group.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === btn.dataset.tab));
    });
  });

  const termLog = document.getElementById("termLog");
  if (termLog) {
    const session = [
      { cmd: 'print("hello world")', out: ["hello world"] },
      { cmd: "ssh eai@171.100.0.67", out: ["Connected to eai-lab ~", "Last login: Fri Aug 21 2026"] },
      { cmd: "python train.py --epochs 50", out: ["epoch 50/50 - loss: 0.021 - acc: 0.98"] },
      { cmd: "git push origin main", out: ["Enumerating objects: 12, done.", "* [new branch] main -> main"] },
      { cmd: "sudo rm -rf node_modules/", out: ["freed 482MB"] },
      { cmd: "curl -s api/status", out: ['{"status":"ok"}'] },
    ];
    const MAX_LINES = 9;
    let step = 0;

    function trim() {
      while (termLog.children.length > MAX_LINES) termLog.removeChild(termLog.firstChild);
      termLog.scrollTop = termLog.scrollHeight;
    }

    function typeCommand(text, done) {
      const line = document.createElement("div");
      line.className = "term-line";
      line.innerHTML = '<span class="prompt">$</span><span class="txt"></span><span class="term-cursor"></span>';
      termLog.appendChild(line);
      const txt = line.querySelector(".txt");
      const cursor = line.querySelector(".term-cursor");
      let i = 0;
      (function tick() {
        txt.textContent = text.slice(0, i);
        trim();
        i++;
        if (i <= text.length) {
          setTimeout(tick, 38 + Math.random() * 45);
        } else {
          cursor.remove();
          done();
        }
      })();
    }

    function printOutput(lines, done) {
      let i = 0;
      (function next() {
        if (i < lines.length) {
          const l = document.createElement("div");
          l.className = "term-out";
          l.textContent = lines[i];
          termLog.appendChild(l);
          trim();
          i++;
          setTimeout(next, 200);
        } else {
          setTimeout(done, 1100);
        }
      })();
    }

    (function run() {
      const { cmd, out } = session[step % session.length];
      step++;
      typeCommand(cmd, () => printOutput(out, run));
    })();
  }
})();

(function () {
  const grid = document.getElementById("galleryGrid");
  const lightbox = document.getElementById("lightbox");
  if (!grid || !lightbox) return;

  const imgEl = document.getElementById("lightboxImg");
  const countEl = document.getElementById("lightboxCount");
  const items = Array.from(grid.querySelectorAll(".gallery-item"));
  let index = 0;

  function show(i) {
    if (!items.length) return;
    index = (i + items.length) % items.length;
    if (imgEl) imgEl.src = items[index].getAttribute("data-full") || "";
    if (countEl) countEl.textContent = (index + 1) + " / " + items.length;
  }

  function openAt(i) {
    show(i);
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".gallery-item");
    if (!btn) return;
    openAt(items.indexOf(btn));
  });

  document.getElementById("lightboxClose")?.addEventListener("click", closeLightbox);
  document.getElementById("lightboxPrev")?.addEventListener("click", () => show(index - 1));
  document.getElementById("lightboxNext")?.addEventListener("click", () => show(index + 1));

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
})();
