// ==========================================================================
// UNIFIED ENGINE THEME CONTROL SYSTEM (theme.js)
// ==========================================================================

// 1. RUNS IMMEDIATELY: Applies theme on raw page load before layout rendering finishes
(function () {
    try {
        // Unify storage lookup keys to resolve cross-file validation conflicts
        const savedTheme = localStorage.getItem("G-Lite-ui-theme") || localStorage.getItem("g_lite_theme") || "dark";
        document.documentElement.setAttribute("data-theme", savedTheme);
    } catch (e) {
        document.documentElement.setAttribute("data-theme", "dark");
    }
})();

// 2. DOM CONTENT DRIVER: Standardized singular binding engine matrix
document.addEventListener("DOMContentLoaded", () => {
    const themeToggleElement = document.getElementById("theme-toggle");

    if (themeToggleElement) {
        themeToggleElement.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();

            const rootElement = document.documentElement;
            const currentActiveMode = rootElement.getAttribute("data-theme") || "dark";
            const calculatedNextMode = currentActiveMode === "dark" ? "light" : "dark";

            // Update DOM configuration maps
            rootElement.setAttribute("data-theme", calculatedNextMode);

            // Set both naming style metrics properties to prevent cross-file sync drops
            localStorage.setItem("G-Lite-ui-theme", calculatedNextMode);
            localStorage.setItem("g_lite_theme", calculatedNextMode);

        });
    }
});