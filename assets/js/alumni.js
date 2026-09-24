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

  const chartEl = document.getElementById("uniChart");
  if (chartEl) {
    chartEl.innerHTML = bars
      .map(([label, count]) => {
        const widthPct = Math.round((count / max) * 100);
        const share = Math.round((count / totalStudents) * 100);
        return `<div class="bar-row" data-code="${label}">
          <span class="bar-label">${label}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${widthPct}%"></div></div>
          <span class="bar-count">${count}<span class="pct">${share}%</span></span>
        </div>`;
      })
      .join("");
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
