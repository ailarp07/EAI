(function () {
  const root = document.getElementById("toolStackRoot");
  if (!root || typeof TOOL_CATEGORIES === "undefined") return;

  const catLabels = {
    cat_lang: "Languages",
    cat_ide: "IDE & Coding Tools",
    cat_ext: "VS Code Extensions",
    cat_ai: "AI Models & Assistants",
    cat_ml: "ML & Computer Vision",
    cat_cloud: "Cloud & Dev Platforms",
    cat_design: "Design & 3D",
    cat_repos: "GitHub Essentials",
    cat_senior: "Senior Past Work",
    cat_research: "Research & Productivity",
  };
  const catIcons = {
    cat_lang: "bi-braces",
    cat_ide: "bi-code-square",
    cat_ext: "bi-puzzle",
    cat_ai: "bi-robot",
    cat_ml: "bi-cpu",
    cat_cloud: "bi-cloud",
    cat_design: "bi-box",
    cat_repos: "bi-github",
    cat_senior: "bi-mortarboard",
    cat_research: "bi-journal-text",
  };

  const html = TOOL_CATEGORIES.map((cat) => {
    const tiles = cat.tools
      .map((t) => {
        const icon = t.icon || cat.fallback;
        const media = t.slug
          ? `<img src="https://cdn.simpleicons.org/${t.slug}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('i'),{className:'bi ${icon}'}))">`
          : `<i class="bi ${icon}"></i>`;
        const tag = t.url ? "a" : "div";
        const attrs = t.url ? ` href="${t.url}" target="_blank" rel="noopener"` : "";
        return `<${tag} class="tool-tile"${attrs}>${media}<span>${t.name}</span></${tag}>`;
      })
      .join("");
    return `
      <div class="tool-cat">
        <div class="tool-cat-head"><i class="bi ${catIcons[cat.key]}"></i><h3 data-i18n="tools.${cat.key}">${catLabels[cat.key]}</h3></div>
        <div class="tool-grid">${tiles}</div>
      </div>
    `;
  }).join("");

  root.innerHTML = html;
})();
