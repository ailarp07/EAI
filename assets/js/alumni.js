(function () {
  if (typeof ALUMNI === "undefined") return;

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
})();
