const revealElements = document.querySelectorAll('.reveal');
const fixedTicket = document.querySelector('.fixed-ticket');
const lightTransition = document.querySelector('.light-transition');
const roomSection = document.querySelector('#room');
const canvas = document.querySelector('.particle-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  const start = window.innerHeight * 0.96;
  const end = -rect.height * 0.10;
  const progress = clamp((start - rect.top) / (start - end), 0, 1);

  // スクショ案の「入口へ向かう」コピーを中盤に置き、ROOM出現へ引き継ぐ。
  const copyIn = clamp((progress - 0.18) / 0.18, 0, 1);
  const copyOut = clamp((progress - 0.70) / 0.18, 0, 1);
  const entranceCopy = copyIn * (1 - copyOut);

  const doorOpen = clamp((progress - 0.46) / 0.32, 0, 1);
  const doorFade = clamp((progress - 0.82) / 0.12, 0, 1);

  document.documentElement.style.setProperty('--light-progress', progress.toFixed(3));
  document.documentElement.style.setProperty('--door-progress', doorOpen.toFixed(3));
  document.documentElement.style.setProperty('--door-fade', doorFade.toFixed(3));
  document.documentElement.style.setProperty('--entrance-copy', entranceCopy.toFixed(3));

  return progress;
}

// Particles
const particles = [];
let dpr = Math.min(window.devicePixelRatio || 1, 2);
let width = 0;
let height = 0;
let animationFrameId = null;
let globalProgress = 0;
let roomProgress = { gather: 0, fade: 0, visible: 0 };
let entranceProgress = 0;

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
      size: 0.45 + Math.random() * 1.55,
      speedY: 0.0008 + Math.random() * 0.0014,
      speedX: (Math.random() - 0.5) * 0.0007,
      twinkle: Math.random() * Math.PI * 2,
      phase: Math.random() * Math.PI * 2,
      hueShift: Math.random() * 0.15,
    });
  }
}

function updateRoomProgress() {
  if (!roomSection) return { gather: 0, fade: 0, visible: 0, beyond: 0, copy: 0, release: 0 };
  const rect = roomSection.getBoundingClientRect();

  // ROOMは入口の前で止まる。コピーと奥の光が重なって“溜まり”を作り、
  // その後、光とコピーだけが引いてROOMだけが残る。
  const start = window.innerHeight * 1.05;
  const end = -rect.height * 0.18;
  const progress = clamp((start - rect.top) / (start - end), 0, 1);

  const gather = clamp((progress - 0.04) / 0.2, 0, 1);
  const copyIn = clamp((progress - 0.24) / 0.16, 0, 1);
  const release = clamp((progress - 0.74) / 0.18, 0, 1);
  const copy = copyIn * (1 - release);
  const beyondIn = clamp((progress - 0.30) / 0.16, 0, 1);
  const beyond = beyondIn * (1 - release * 0.92);
  const fade = release;

  return {
    gather,
    fade,
    visible: gather * (1 - fade),
    beyond,
    copy,
    release
  };
}

function updateGlobalProgress() {
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const raw = window.scrollY / maxScroll;

  // Hero直後は1〜2粒だけ、進むほど少しずつ溜まる。
  if (raw < 0.08) return 0;
  if (raw < 0.18) return 0.08;
  return clamp((raw - 0.15) / 0.58, 0.08, 1);
}

function drawParticles(time) {
  if (prefersReducedMotion || !ctx || !canvas) return;
  ctx.clearRect(0, 0, width, height);

  const strength = globalProgress;
  const roomPull = roomProgress.gather;
  const fadeOut = roomProgress.fade;
  const entrancePull = clamp((entranceProgress - 0.22) / 0.55, 0, 1) * (1 - clamp((entranceProgress - 0.82) / 0.16, 0, 1));
  const particlePresence = clamp((strength + entrancePull * 0.22) * Math.pow(1 - fadeOut, 1.8), 0, 1);
  const earlyMinimum = particlePresence > 0.03 ? 2 : 0;
  const visibleCount = Math.max(earlyMinimum, Math.floor(particles.length * particlePresence));
  const centerX = width * 0.50;
  const centerY = height * 0.52;

  // subtle accumulated glow
  if (particlePresence > 0.02) {
    const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.min(width, height) * 0.42);
    glow.addColorStop(0, `rgba(235,235,235,${(0.018 + roomPull * 0.055 + entrancePull * 0.08) * (1 - fadeOut)})`);
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

    if (entrancePull > 0.01) {
      p.x += ((centerX / width) - p.x) * (0.0012 + entrancePull * 0.0042);
      p.y += ((centerY / height) - p.y) * (0.0010 + entrancePull * 0.0032);
    } else if (roomPull > 0.01) {
      p.x += ((centerX / width) - p.x) * (0.0007 + roomPull * 0.0023);
      p.y += ((centerY / height) - p.y) * (0.0005 + roomPull * 0.0017);
    }

    // ROOM到達後は粒が外へはける。
    if (fadeOut > 0.02) {
      const awayX = p.x - (centerX / width);
      const awayY = p.y - (centerY / height);
      p.x += awayX * 0.0035 * fadeOut;
      p.y += awayY * 0.0035 * fadeOut;
    }

    if (p.y < -0.08 || p.x < -0.1 || p.x > 1.1) {
      p.x = Math.random();
      p.y = 1.08 + Math.random() * 0.12;
    }

    if (idx > visibleCount) return;

    const x = p.x * width;
    const y = p.y * height;
    const twinkle = 0.45 + 0.55 * Math.sin(time * 0.0012 + p.twinkle);
    const alpha = (0.025 + particlePresence * 0.32 + roomPull * 0.18 + entrancePull * 0.28) * twinkle * Math.pow(1 - fadeOut, 1.35);
    const radius = p.size + roomPull * 0.28 + entrancePull * 0.55;

    ctx.beginPath();
    ctx.fillStyle = `rgba(235, 239, 255, ${alpha})`;
    ctx.shadowBlur = 4 + radius * 1.6 + roomPull * 4;
    ctx.shadowColor = `rgba(210, 225, 255, ${0.14 + alpha})`;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  animationFrameId = window.requestAnimationFrame(drawParticles);
}

function update() {
  updateFixedTicket();
  entranceProgress = updateLightTransition();
  globalProgress = updateGlobalProgress();
  roomProgress = updateRoomProgress();
  document.documentElement.style.setProperty('--room-beyond', (roomProgress.beyond || 0).toFixed(3));
  document.documentElement.style.setProperty('--room-copy', (roomProgress.copy || 0).toFixed(3));
  document.documentElement.style.setProperty('--room-release', (roomProgress.release || 0).toFixed(3));
}

window.addEventListener('scroll', update, { passive: true });
window.addEventListener('resize', () => { if (!prefersReducedMotion) resizeCanvas(); update(); });

update();

if (!prefersReducedMotion && ctx) {
  resizeCanvas();
  createParticles(46);
  animationFrameId = window.requestAnimationFrame(drawParticles);
} else if (canvas) {
  canvas.remove();
}
