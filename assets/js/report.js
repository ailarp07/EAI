(function () {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const report = id && typeof REPORTS !== "undefined" ? REPORTS[id] : null;

  const rTitle = document.getElementById("rTitle");
  const rDate = document.getElementById("rDate");
  const rMeta = document.getElementById("rMeta");
  const rEyebrowText = document.getElementById("rEyebrowText");
  const rBody = document.getElementById("rBody");
  const backLink = document.getElementById("backLink");

  if (!report) {
    if (rTitle) rTitle.textContent = "Not found";
    if (rBody) rBody.innerHTML = "<p>That report doesn't exist. <a href=\"classwork.html\">Back to Reports & Docs</a>.</p>";
    return;
  }

  if (backLink && report.backAnchor) backLink.href = "classwork.html#" + report.backAnchor;

  function render() {
    const lang = document.documentElement.getAttribute("lang") === "th" ? "th" : "en";
    const c = report[lang] || report.en;
    document.title = c.title + " - Engineers";
    if (rEyebrowText) rEyebrowText.textContent = c.eyebrow;
    if (rTitle) rTitle.textContent = c.title;
    if (rDate) rDate.textContent = c.date;
    if (rMeta) rMeta.textContent = c.meta;
    if (rBody) rBody.innerHTML = c.body;
  }

  render();

  document.getElementById("langToggle")?.addEventListener("click", render);
})();
