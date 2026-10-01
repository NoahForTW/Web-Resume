const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const printBtn = document.getElementById("printBtn");

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
}

let savedTheme = null;
try {
  savedTheme = localStorage.getItem("theme");
} catch (error) {
  // storage blocked, ignore
}

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try {
    localStorage.setItem("theme", next);
  } catch (error) {
    // storage blocked, ignore
  }
});

// Opens the print dialog; choose "Save as PDF" as the printer
printBtn.addEventListener("click", () => window.print());