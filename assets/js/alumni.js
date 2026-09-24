(function () {
  if (typeof ALUMNI === "undefined") return;

  // Known short-codes get their own bar; anything else folds into "Other / Abroad".
  const KNOWN_CODES = ["CU", "TU", "KU", "KMITL", "KMUTT", "KMUTNB", "MU", "SU", "CMKL", "CATC"];
  const OTHER_LABEL = "Other / Abroad";

  const allStudents = [];
  Object.keys(ALUMNI).forEach((gen) => {
    ALUMNI[gen].forEach((s) => allStudents.push({ ...s, gen }));
  });

  // ---- roster tables ----
  Object.keys(ALUMNI).forEach((gen) => {
    const tbody = document.getElementById("alumni" + gen.charAt(0).toUpperCase() + gen.slice(1));
    if (!tbody) return;
    const rows = ALUMNI[gen]
      .map((s, i) => {
        const uni = s.uni || "-";
        const fac = s.fac || "-";
        return `<tr><td>${i + 1}</td><td>${s.name}</td><td>${uni}</td><td>${fac}</td></tr>`;
      })
      .join("");
    tbody.innerHTML = rows;
  });

  // ---- university tally (main offer only, one per student) ----
  const tally = {};
  allStudents.forEach((s) => {
    if (!s.uni) return;
    const bucket = KNOWN_CODES.includes(s.code) ? s.code : OTHER_LABEL;
    tally[bucket] = (tally[bucket] || 0) + 1;
  });

  const bucketMembers = {};
  allStudents.forEach((s) => {
    if (!s.uni) return;
    const bucket = KNOWN_CODES.includes(s.code) ? s.code : OTHER_LABEL;
    (bucketMembers[bucket] = bucketMembers[bucket] || []).push(s);
  });

  const bars = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const max = bars.length ? bars[0][1] : 1;
  const totalStudents = allStudents.filter((s) => s.uni).length;

  // Same program gets written differently year to year (Thai name, English
  // name, "(นานาชาติ)" tag, institute abbreviation, Sandbox spelling...) -
  // fold the common ones into one label so the breakdown counts the
  // program, not the wording. CEDT (the Computer Eng + Digital Tech
  // Sandbox program) has to be checked BEFORE plain Computer Engineering,
  // since its Thai text always contains "คอมพิวเตอร์" too.
  const FAC_CLUSTERS = [
    [/เทคโนโลยีดิจิ(ทั|ตั)ล.*sandbox|sandbox.*เทคโนโลยีดิจิ(ทั|ตั)ล|\bcedt\b/i, "Computer Engineering & Digital Tech (CEDT)"],
    [/robotics.*(&|and)?\s*ai|หุ่นยนต์.*ปัญญาประดิษฐ์/i, "Robotics & AI"],
    [/หุ่นยนต์ภาคสนาม|\bfibo\b/i, "Field Robotics Institute (FIBO)"],
    [/aerospace|อากาศยาน/i, "Aerospace Engineering"],
    [/computer engineering|วิศวกรรมคอมพิวเตอร์/i, "Computer Engineering"],
  ];

  // ISE (International School of Engineering) is CU's real name for its
  // international engineering programs - only prefix it for those; every
  // other international program just gets a plain "(Int'l)" suffix.
  const ENGINEERING_LABELS = new Set([
    "Robotics & AI",
    "Aerospace Engineering",
    "Computer Engineering",
    "Computer Engineering & Digital Tech (CEDT)",
    "Field Robotics Institute (FIBO)",
  ]);

  const INTL_PATTERN = /นานาชาติ|international|\bise\b|\bsiie\b|\(intl?\)/i;
  const INTL_TAG_STRIP = /\s*[(（]\s*(หลักสูตร)?นานาชาติ\s*[)）]|\s*[(（]\s*international( program)?\s*[)）]|\s*[(（]\s*intl?\.?\s*[)）]/gi;

  function normalizeFac(raw) {
    const fac = (raw || "Not specified").replace(/\s+/g, " ").trim();
    const isIntl = INTL_PATTERN.test(fac);
    let label = fac;
    let clustered = false;
    for (const [pattern, canonical] of FAC_CLUSTERS) {
      if (pattern.test(fac)) {
        label = canonical;
        clustered = true;
        break;
      }
    }
    if (!isIntl) return { label, isIntl };
    if (!clustered) label = label.replace(INTL_TAG_STRIP, "").trim();
    label = ENGINEERING_LABELS.has(label) ? `ISE ${label}` : `${label} (Int'l)`;
    return { label, isIntl };
  }

  function facBreakdown(bucket) {
    const tally = {};
    (bucketMembers[bucket] || []).forEach((s) => {
      const { label, isIntl } = normalizeFac(s.fac);
      if (!tally[label]) tally[label] = { count: 0, isIntl };
      tally[label].count += 1;
    });
    return Object.entries(tally).sort((a, b) => {
      if (a[1].isIntl !== b[1].isIntl) return a[1].isIntl ? -1 : 1;
      return b[1].count - a[1].count;
    });
  }

  const chartEl = document.getElementById("uniChart");
  if (chartEl) {
    chartEl.innerHTML = bars
      .map(([label, count]) => {
        const widthPct = Math.round((count / max) * 100);
        const share = Math.round((count / totalStudents) * 100);
        const facs = facBreakdown(label)
          .map(([fac, info]) => `<li><i class="bi bi-dot"></i><div><b>${fac}</b>${info.count > 1 ? `<span> - ${info.count} students</span>` : ""}</div></li>`)
          .join("");
        return `<div class="bar-item">
          <button class="bar-row" data-code="${label}">
            <span class="bar-label">${label}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${widthPct}%"></div></div>
            <span class="bar-count">${count}<span class="pct">${share}%</span></span>
            <i class="bi bi-chevron-down bar-chevron"></i>
          </button>
          <div class="bar-detail"><ul class="bar-fac-list">${facs}</ul></div>
        </div>`;
      })
      .join("");

    chartEl.querySelectorAll(".bar-row").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".bar-item");
        const detail = item.querySelector(".bar-detail");
        const isOpen = item.classList.toggle("open");
        detail.style.maxHeight = isOpen ? detail.scrollHeight + "px" : "0px";
      });
    });
  }

  // ---- search: filters bar highlight + shows a match count across all gens ----
  const input = document.getElementById("alumniSearch");
  const countEl = document.getElementById("alumniSearchCount");
  if (input) {
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      const barRows = chartEl ? chartEl.querySelectorAll(".bar-row") : [];

      if (!q) {
        barRows.forEach((row) => row.classList.remove("dim"));
        if (countEl) countEl.textContent = "";
        return;
      }

      const matches = allStudents.filter((s) => {
        const code = (s.code || "").toLowerCase();
        const uni = (s.uni || "").toLowerCase();
        const name = (s.name || "").toLowerCase();
        return code.startsWith(q) || uni.includes(q) || name.includes(q);
      });

      barRows.forEach((row) => {
        const bucket = row.dataset.code;
        const code = bucket.toLowerCase();
        const members = bucketMembers[bucket] || [];
        const isMatch = code.startsWith(q) || members.some((s) => (s.uni || "").toLowerCase().includes(q) || (s.name || "").toLowerCase().includes(q));
        row.classList.toggle("dim", !isMatch);
      });

      if (countEl) {
        countEl.textContent = matches.length + " student" + (matches.length === 1 ? "" : "s") + " match";
      }
    });
  }
})();
