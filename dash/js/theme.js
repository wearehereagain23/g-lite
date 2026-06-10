// ==========================================================================
// SANDBOXED THEME CONTROL SYSTEM
// ==========================================================================

// 1. RUNS IMMEDIATELY: Applies theme on raw page load before layout rendering finishes
(function () {
    try {
        const savedTheme = localStorage.getItem("G-Lite-ui-theme") || "dark";
        document.documentElement.setAttribute("data-theme", savedTheme);

    } catch (e) {
        document.documentElement.setAttribute("data-theme", "dark");
    }
})();

// 2. RUNS VIA HANDLER: Independent global listener attached directly to window object
window.addEventListener("click", function (e) {
    const btn = e.target.closest("#theme-toggle");
    if (!btn) return; // Ignore click if it's not the button

    e.preventDefault();
    e.stopPropagation();

    const root = document.documentElement;
    const currentTheme = root.getAttribute("data-theme") || "dark";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    root.setAttribute("data-theme", nextTheme);
    localStorage.setItem("G-Lite-ui-theme", nextTheme);

    console.log("🟢 [STANDALONE THEME LOG]: Switched to " + nextTheme.toUpperCase());
}, { capture: true });