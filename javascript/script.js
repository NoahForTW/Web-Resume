const root = document.documentElement;
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Theme (dark by default, remembers your choice)
const themeToggle = $("#themeToggle");
function applyTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.textContent = theme === "dark" ? "Light" : "Dark";
}
let savedTheme = null;
try { savedTheme = localStorage.getItem("theme"); } catch (error) {}
applyTheme(savedTheme || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
themeToggle.onclick = () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (error) {}
};
$("#printBtn").onclick = () => window.print();

// Scroll progress bar
const bar = $("#progress");
addEventListener("scroll", () => {
  const max = root.scrollHeight - root.clientHeight || 1;
  bar.style.transform = "scaleX(" + root.scrollTop / max + ")";
}, { passive: true });

// Highlight the nav link of the section you're in
const navLinks = $$(".nav nav a");
const spy = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) navLinks.forEach(a => a.classList.toggle("on", a.hash === "#" + entry.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(section => spy.observe(section));

// Fade-in on scroll
const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add("in"); reveal.unobserve(entry.target); }
}), { threshold: 0.15 });
$$(".reveal").forEach(el => reveal.observe(el));

// Typing role text
const words = ["games", "game systems", "small tools", "websites"];
const rotator = $("#rotator");
if (!reduceMotion) {
  let w = 0, c = 0, deleting = false;
  const tick = () => {
    const word = words[w];
    c += deleting ? -1 : 1;
    rotator.textContent = word.slice(0, c);
    let wait = deleting ? 40 : 90;
    if (!deleting && c === word.length) { deleting = true; wait = 1600; }
    else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; wait = 300; }
    setTimeout(tick, wait);
  };
  tick();
}

// Project filter
$$(".chip").forEach(chip => chip.onclick = () => {
  $$(".chip").forEach(c => c.classList.toggle("active", c === chip));
  const filter = chip.dataset.filter;
  $$(".card").forEach(card => {
    const show = filter === "all" || card.dataset.tags.split(" ").includes(filter);
    card.classList.toggle("hide", !show);
    card.classList.remove("pop");
    if (show) { void card.offsetWidth; card.classList.add("pop"); }
  });
});

// Card spotlight follows your finger or cursor
$$(".card").forEach(card => card.addEventListener("pointermove", e => {
  const r = card.getBoundingClientRect();
  card.style.setProperty("--mx", e.clientX - r.left + "px");
  card.style.setProperty("--my", e.clientY - r.top + "px");
}));

// Tap to copy email
const copyBtn = $("#copyEmail");
copyBtn.onclick = async () => {
  const email = copyBtn.dataset.email;
  try { await navigator.clipboard.writeText(email); }
  catch (error) { location.href = "mailto:" + email; return; }
  copyBtn.textContent = "Copied!";
  setTimeout(() => { copyBtn.textContent = email; }, 1800);
};

// Interactive dots in the hero
const canvas = $("#field");
const ctx = canvas.getContext("2d");
const pointer = { x: -999, y: -999 };
let W = 0, H = 0, dots = [], heroVisible = true;

function sizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  W = rect.width; H = rect.height;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.round(Math.min(90, (W * H) / 14000));
  dots = Array.from({ length: count }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4
  }));
  if (reduceMotion) draw();
}

function draw() {
  if (!heroVisible && !reduceMotion) { requestAnimationFrame(draw); return; }
  const color = getComputedStyle(root).getPropertyValue("--dot").trim();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  dots.forEach((p, i) => {
    if (!reduceMotion) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      const dx = p.x - pointer.x, dy = p.y - pointer.y, dist = Math.hypot(dx, dy);
      if (dist < 120 && dist > 0.1) { p.x += (dx / dist) * 1.5; p.y += (dy / dist) * 1.5; }
    }
    ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2); ctx.fill();
    for (let j = i + 1; j < dots.length; j++) {
      const q = dots[j], d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < 110) {
        ctx.globalAlpha = (1 - d / 110) * 0.6;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  });
  if (!reduceMotion) requestAnimationFrame(draw);
}

const hero = $(".hero");
hero.addEventListener("pointermove", e => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = e.clientX - rect.left; pointer.y = e.clientY - rect.top;
});
hero.addEventListener("pointerleave", () => { pointer.x = pointer.y = -999; });
new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }).observe(hero);
addEventListener("resize", sizeCanvas);
sizeCanvas();
if (!reduceMotion) draw();