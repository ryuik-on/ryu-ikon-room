const revealElements = document.querySelectorAll('.reveal');
const fixedTicket = document.querySelector('.fixed-ticket');
const lightTransition = document.querySelector('.light-transition');
const roomSection = document.querySelector('#room');
const canvas = document.querySelector('.particle-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.05,
  rootMargin: '0px 0px 20% 0px'
}) : null;
if (revealObserver) {
  revealElements.forEach((el) => revealObserver.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add('is-visible'));
}

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
  if (!lightTransition) {
    return {
      progress: 0,
      fieldReveal: 0,
      inward: 0,
      particleFade: 0,
      guide: 0,
      blackout: 0
    };
  }

  const rect = lightTransition.getBoundingClientRect();
  const start = window.innerHeight * 0.98;
  const end = -rect.height * 0.09;
  const progress = clamp((start - rect.top) / (start - end), 0, 1);

  // The entrance copy finishes its role early, before the light starts moving.
  const copyIn = clamp((progress - 0.025) / 0.075, 0, 1);
  const copyOut = clamp((progress - 0.145) / 0.075, 0, 1);
  const entranceCopy = copyIn * (1 - copyOut);
  const entranceCopyRise = copyOut * 8;

  // The field opens after the copy has mostly disappeared.
  const fieldReveal = clamp((progress - 0.205) / 0.22, 0, 1);

  // Particles move toward the entrance but disappear before forming a cluster.
  const inward = clamp((progress - 0.43) / 0.31, 0, 1);
  const particleFade = clamp((progress - 0.61) / 0.19, 0, 1);

  // The final viewer light remains alone, recedes, then disappears completely.
  const guideIn = clamp((progress - 0.57) / 0.08, 0, 1);
  const guideOut = clamp((progress - 0.78) / 0.105, 0, 1);
  const guideOpacity = guideIn * (1 - guideOut);
  const guideScale = 1 - guideOut * 0.82;
  const guideY = 54.5 - guideOut * 1.2;

  // Pure black only during the handoff. It must clear again before ROOM.
  const blackoutIn = clamp((progress - 0.875) / 0.045, 0, 1);
  const blackoutOut = clamp((progress - 0.955) / 0.035, 0, 1);
  const blackout = blackoutIn * (1 - blackoutOut);

  document.documentElement.style.setProperty('--light-progress', progress.toFixed(3));
  document.documentElement.style.setProperty('--entrance-copy', entranceCopy.toFixed(3));
  document.documentElement.style.setProperty('--entrance-copy-rise', entranceCopyRise.toFixed(3));
  document.documentElement.style.setProperty('--entrance-copy-secondary', '0');
  document.documentElement.style.setProperty('--field-reveal', fieldReveal.toFixed(3));
  document.documentElement.style.setProperty('--guide-opacity', guideOpacity.toFixed(3));
  document.documentElement.style.setProperty('--guide-y', guideY.toFixed(3));
  document.documentElement.style.setProperty('--guide-scale', Math.max(0.12, guideScale).toFixed(3));
  document.documentElement.style.setProperty('--guide-stretch', '0');
  document.documentElement.style.setProperty('--companion-opacity', '0');
  document.documentElement.style.setProperty('--blackout-opacity', blackout.toFixed(3));

  return {
    progress,
    fieldReveal,
    inward,
    particleFade,
    guide: guideOpacity,
    blackout
  };
}

// Particles
const particles = [];
let dpr = Math.min(window.devicePixelRatio || 1, 2);
let width = 0;
let height = 0;
let animationFrameId = null;
let globalProgress = 0;
let roomProgress = { gather: 0, fade: 0, visible: 0 };
let entranceProgress = { progress: 0, fieldReveal: 0, inward: 0, particleFade: 0, guide: 0, blackout: 0 };

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

function createParticles(count = 154) {
  particles.length = 0;
  for (let i = 0; i < count; i += 1) {
    const sizeRoll = Math.random();
    let particleSize;
    if (sizeRoll < 0.85) particleSize = 0.38 + Math.random() * 0.34;
    else if (sizeRoll < 0.97) particleSize = 0.72 + Math.random() * 0.30;
    else particleSize = 1.02 + Math.random() * 0.40;

    const twinkleRoll = Math.random();
    const twinkleMode =
      twinkleRoll < 0.95 ? "still" :
      twinkleRoll < 0.985 ? "slow" : "breath";

    const clusterCenters = [
      [0.38, 0.67],
      [0.55, 0.61],
      [0.64, 0.73],
      [0.46, 0.79],
      [0.58, 0.82]
    ];
    const [clusterX, clusterY] =
      clusterCenters[Math.floor(Math.random() * clusterCenters.length)];

    particles.push({
      x: clamp(clusterX + (Math.random() - 0.5) * (0.18 + Math.random() * 0.28), 0.02, 0.98),
      y: clamp(clusterY + (Math.random() - 0.5) * (0.12 + Math.random() * 0.24), 0.08, 1.02),
      size: particleSize,
      speedY: 0.00018 + Math.random() * 0.00042,
      speedX: (Math.random() - 0.5) * 0.00016,
      twinkle: Math.random() * Math.PI * 2,
      phase: Math.random() * Math.PI * 2,
      twinkleMode,
      warm: Math.random() < 0.02,
      depth: Math.random(),
      thresholdSide: Math.random() < 0.5 ? -1 : 1,
    });
  }
}

function updateRoomProgress() {
  if (!roomSection) {
    return { fade: 0, visible: 0, beyond: 0, copy: 0, release: 0, title: 0 };
  }

  const rect = roomSection.getBoundingClientRect();
  const start = window.innerHeight * 0.98;
  const end = -rect.height * 0.15;
  const progress = clamp((start - rect.top) / (start - end), 0, 1);

  // The section begins as pure black. ROOM then becomes visible without moving.
  const titleIn = clamp((progress - 0.035) / 0.13, 0, 1);
  const titleHoldOut = clamp((progress - 0.89) / 0.08, 0, 1);
  const title = titleIn * (1 - titleHoldOut);

  // Supporting copy waits until ROOM has been fully established.
  const copyIn = clamp((progress - 0.32) / 0.13, 0, 1);
  const release = titleHoldOut;
  const copy = copyIn * (1 - release);

  return {
    fade: release,
    visible: title,
    beyond: 0,
    copy,
    release,
    title
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

  const ep = entranceProgress.progress || 0;
  const fieldReveal = entranceProgress.fieldReveal || 0;
  const inward = entranceProgress.inward || 0;
  const particleFade = entranceProgress.particleFade || 0;
  const blackout = entranceProgress.blackout || 0;

  // Once the entrance has ended, the canvas is guaranteed to be empty.
  if (ep >= 0.90 || roomProgress.title > 0 || roomProgress.copy > 0) {
    animationFrameId = window.requestAnimationFrame(drawParticles);
    return;
  }

  const sparsePresence = clamp((ep - 0.18) / 0.05, 0, 1) *
    (1 - clamp((ep - 0.31) / 0.08, 0, 1));
  const openedPresence = fieldReveal * Math.pow(1 - particleFade, 1.7);
  const visibleRatio = clamp(sparsePresence * 0.04 + openedPresence, 0, 1);
  const visibleCount = Math.max(sparsePresence > 0.02 ? 3 : 0,
    Math.floor(particles.length * visibleRatio));

  const centerX = width * 0.50;
  const centerY = height * 0.54;

  particles.forEach((p, idx) => {
    if (idx >= visibleCount) return;

    // Position is calculated directly from scroll progress, not accumulated
    // frame by frame. Fast scrolling therefore cannot outrun the effect.
    const driftX = Math.sin(time * 0.00014 + p.phase) * (3 + p.depth * 5);
    const driftY = -fieldReveal * (18 + p.depth * 34);
    const originX = p.x * width + driftX;
    const originY = p.y * height + driftY;

    const targetRadius = width * (0.052 + (idx % 11) * 0.0055);
    const angle = p.phase + idx * 0.37;
    const targetX = centerX + Math.cos(angle) * targetRadius;
    const targetY = centerY + Math.sin(angle) * targetRadius * 0.58;

    const x = originX + (targetX - originX) * inward;
    const y = originY + (targetY - originY) * inward;

    let twinkle = 0.94;
    if (p.twinkleMode === 'slow') {
      twinkle = 0.82 + 0.18 * Math.sin(time * 0.00023 + p.twinkle);
    } else if (p.twinkleMode === 'breath') {
      twinkle = 0.70 + 0.30 * Math.sin(time * 0.00042 + p.twinkle);
    }

    // Staggered disappearance, but every particle is gone before blackout.
    const stagger = (idx % 17) * 0.012;
    const localFade = clamp((particleFade - stagger) / 0.76, 0, 1);
    const alpha = (0.16 + openedPresence * 0.56) * twinkle *
      Math.pow(1 - localFade, 2.2) * (1 - blackout);

    if (alpha <= 0.004) return;

    ctx.beginPath();
    ctx.fillStyle = p.warm
      ? `rgba(250,247,239,${alpha * 0.86})`
      : `rgba(239,243,250,${alpha})`;
    ctx.shadowBlur = 0;
    ctx.arc(x, y, p.size * 0.92, 0, Math.PI * 2);
    ctx.fill();
  });

  animationFrameId = window.requestAnimationFrame(drawParticles);
}
function update() {
  updateFixedTicket();
  entranceProgress = updateLightTransition();
  document.documentElement.dataset.transitionComplete =
    entranceProgress.progress >= 0.93 ? 'true' : 'false';
  globalProgress = updateGlobalProgress();
  roomProgress = updateRoomProgress();
  document.documentElement.style.setProperty('--room-beyond', (roomProgress.beyond || 0).toFixed(3));
  document.documentElement.style.setProperty('--room-copy', (roomProgress.copy || 0).toFixed(3));
  document.documentElement.style.setProperty('--room-release', (roomProgress.release || 0).toFixed(3));
  document.documentElement.style.setProperty('--room-title-opacity', (roomProgress.title || 0).toFixed(3));
  document.documentElement.style.setProperty('--room-title-y', '0');
}

window.addEventListener('scroll', update, { passive: true });
window.addEventListener('resize', () => { if (!prefersReducedMotion) resizeCanvas(); update(); });

update();

if (!prefersReducedMotion && ctx) {
  resizeCanvas();
  createParticles(window.innerWidth < 760 ? 126 : 168);
  animationFrameId = window.requestAnimationFrame(drawParticles);
} else if (canvas) {
  canvas.remove();
}
