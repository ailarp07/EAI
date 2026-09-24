(function () {
  if (typeof ALUMNI === "undefined") return;

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
        const code = (s.code || "").toLowerCase();
        const searchKey = `${s.name} ${s.uni} ${s.fac}`.toLowerCase();
        return `<tr data-code="${code}" data-search="${searchKey.replace(/"/g, "&quot;")}"><td>${i + 1}</td><td>${s.name}</td><td>${uni}</td><td>${fac}</td></tr>`;
      })
      .join("");
    tbody.innerHTML = rows;
  });

  const allRows = document.querySelectorAll("#alumniGen1 tr, #alumniGen2 tr, #alumniGen3 tr, #alumniGen4 tr, #alumniGen5 tr");

  // ---- search: highlights matching rows (left border) and dims the rest,
  // in every generation's table, plus a live match count ----
  const input = document.getElementById("alumniSearch");
  const countEl = document.getElementById("alumniSearchCount");
  if (input) {
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();

      if (!q) {
        allRows.forEach((row) => row.classList.remove("row-match", "row-dim"));
        if (countEl) countEl.textContent = "";
        return;
      }

      let matchCount = 0;
      allRows.forEach((row) => {
        const isMatch = row.dataset.code.startsWith(q) || row.dataset.search.includes(q);
        row.classList.toggle("row-match", isMatch);
        row.classList.toggle("row-dim", !isMatch);
        if (isMatch) matchCount++;
      });

      if (countEl) {
        countEl.textContent = matchCount + " student" + (matchCount === 1 ? "" : "s") + " match";
      }
    });
  }
})();
