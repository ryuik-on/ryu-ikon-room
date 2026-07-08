const revealElements = document.querySelectorAll('.reveal');
const fixedTicket = document.querySelector('.fixed-ticket');
const lightTransition = document.querySelector('.light-transition');
const roomSection = document.querySelector('#room');
const canvas = document.querySelector('.particle-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.16,
  rootMargin: '0px 0px -8% 0px'
});
revealElements.forEach((el) => revealObserver.observe(el));

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateFixedTicket() {
  if (!fixedTicket) return;
  const threshold = window.innerHeight * 0.92;
  if (window.scrollY > threshold) fixedTicket.classList.add('is-visible');
  else fixedTicket.classList.remove('is-visible');
}

function updateLightTransition() {
  if (!lightTransition) return 0;
  const rect = lightTransition.getBoundingClientRect();
  const start = window.innerHeight * 0.92;
  const end = -rect.height * 0.12;
  const progress = clamp((start - rect.top) / (start - end), 0, 1);
  document.documentElement.style.setProperty('--light-progress', progress.toFixed(3));
  return progress;
}

// Particles
const particles = [];
let dpr = Math.min(window.devicePixelRatio || 1, 2);
let width = 0;
let height = 0;
let animationFrameId = null;
let globalProgress = 0;
let roomProgress = 0;

function resizeCanvas() {
  if (!canvas || !ctx) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function createParticles(count = 30) {
  particles.length = 0;
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x: Math.random(),
      y: Math.random(),
      size: 1 + Math.random() * 3.2,
      speedY: 0.0008 + Math.random() * 0.0014,
      speedX: (Math.random() - 0.5) * 0.0007,
      twinkle: Math.random() * Math.PI * 2,
      phase: Math.random() * Math.PI * 2,
      hueShift: Math.random() * 0.15,
    });
  }
}

function updateRoomProgress() {
  if (!roomSection) return 0;
  const rect = roomSection.getBoundingClientRect();
  const start = window.innerHeight * 1.0;
  const end = window.innerHeight * 0.15;
  return clamp((start - rect.top) / (start - end), 0, 1);
}

function updateGlobalProgress() {
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const raw = window.scrollY / maxScroll;
  return clamp((raw - 0.12) / 0.72, 0, 1);
}

function drawParticles(time) {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, width, height);

  const strength = globalProgress;
  const visibleCount = Math.floor(particles.length * strength);
  const roomPull = roomProgress;
  const centerX = width * 0.52;
  const centerY = height * 0.58;

  // subtle accumulated glow
  if (strength > 0.02) {
    const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.min(width, height) * 0.42);
    glow.addColorStop(0, `rgba(235,235,235,${0.02 + roomPull * 0.08})`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  particles.forEach((p, idx) => {
    // update
    p.phase += 0.015;
    const driftBoost = 0.4 + strength * 1.4;
    p.y -= p.speedY * driftBoost;
    p.x += p.speedX * (0.3 + strength) + Math.sin(p.phase) * 0.00024;

    if (roomPull > 0.01) {
      p.x += ((centerX / width) - p.x) * (0.0007 + roomPull * 0.0025);
      p.y += ((centerY / height) - p.y) * (0.0005 + roomPull * 0.0018);
    }

    if (p.y < -0.08 || p.x < -0.1 || p.x > 1.1) {
      p.x = Math.random();
      p.y = 1.08 + Math.random() * 0.12;
    }

    if (idx > visibleCount) return;

    const x = p.x * width;
    const y = p.y * height;
    const twinkle = 0.45 + 0.55 * Math.sin(time * 0.0012 + p.twinkle);
    const alpha = (0.03 + strength * 0.32 + roomPull * 0.22) * twinkle;
    const radius = p.size + roomPull * 0.9;

    ctx.beginPath();
    ctx.fillStyle = `rgba(235, 239, 255, ${alpha})`;
    ctx.shadowBlur = 10 + radius * 4 + roomPull * 18;
    ctx.shadowColor = `rgba(210, 225, 255, ${0.14 + alpha})`;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  animationFrameId = window.requestAnimationFrame(drawParticles);
}

function update() {
  updateFixedTicket();
  updateLightTransition();
  globalProgress = updateGlobalProgress();
  roomProgress = updateRoomProgress();
}

window.addEventListener('scroll', update, { passive: true });
window.addEventListener('resize', () => { resizeCanvas(); update(); });

resizeCanvas();
createParticles(34);
update();
if (ctx) animationFrameId = window.requestAnimationFrame(drawParticles);
