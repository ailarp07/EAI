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
        return `<tr><td>${i + 1}</td><td>${s.name}</td><td>${uni}</td><td>${fac}</td></tr>`;
      })
      .join("");
    tbody.innerHTML = rows;
  });

  // ---- search: live match count across all generations ----
  const input = document.getElementById("alumniSearch");
  const countEl = document.getElementById("alumniSearchCount");
  if (input) {
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();

      if (!q) {
        if (countEl) countEl.textContent = "";
        return;
      }

      const matches = allStudents.filter((s) => {
        const code = (s.code || "").toLowerCase();
        const uni = (s.uni || "").toLowerCase();
        const name = (s.name || "").toLowerCase();
        return code.startsWith(q) || uni.includes(q) || name.includes(q);
      });

      if (countEl) {
        countEl.textContent = matches.length + " student" + (matches.length === 1 ? "" : "s") + " match";
      }
    });
  }
})();
