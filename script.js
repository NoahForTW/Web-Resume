const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const greetBtn = document.getElementById("greetBtn");
const greeting = document.getElementById("greeting");

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Theme: use saved choice, else follow the device setting
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

// Greeting button
greetBtn.addEventListener("click", () => {
  const hour = new Date().getHours();
  let timeOfDay = "evening";
  if (hour < 12) timeOfDay = "morning";
  else if (hour < 18) timeOfDay = "afternoon";
  greeting.textContent = "Good " + timeOfDay + "! Your JavaScript is working.";
});
