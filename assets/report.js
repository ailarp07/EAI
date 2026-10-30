(function () {
  var id = new URLSearchParams(location.search).get("id");
  var report = id && typeof REPORTS !== "undefined" ? REPORTS[id] : null;
  var t = document.getElementById("rTitle"), dt = document.getElementById("rDate"), mt = document.getElementById("rMeta"), body = document.getElementById("rBody"), back = document.getElementById("backLink");
  if (!report) { t.textContent = "Not found"; body.innerHTML = '<p>That report does not exist. <a href="classwork.html">Back to Classwork Report</a>.</p>'; return; }
  if (report.backAnchor) back.href = "classwork.html#" + report.backAnchor;
  function render() {
    var c = report[document.documentElement.lang === "th" ? "th" : "en"] || report.en;
    document.title = c.title + " | EAI";
    t.textContent = c.title; dt.textContent = c.date; mt.textContent = c.meta; body.innerHTML = c.body;
  }
  render();
  // site.js flips the language on this click first, then we redraw
  document.getElementById("lang").addEventListener("click", render);
})();
