const revealElements = document.querySelectorAll('.reveal');
const fixedTicket = document.querySelector('.fixed-ticket');
const lightTransition = document.querySelector('.light-transition');
const roomSection = document.querySelector('#room');
const foundersNote = document.querySelector('.founders-note');
const stickyCopySections = Array.from(document.querySelectorAll('.sticky-copy'));
const visualStories = Array.from(document.querySelectorAll('.visual-story'));
const blackoutLayer = document.querySelector('.room-blackout');
const canvas = document.querySelector('.particle-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let prefersReducedMotion = motionQuery.matches;

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
  if (!lightTransition) return { progress: 0, fieldReveal: 0, inward: 0, particleFade: 0, guide: 0, blackout: 0 };
  const rect = lightTransition.getBoundingClientRect();
  const travel = Math.max(rect.height - window.innerHeight, 1);
  const progress = clamp(-rect.top / travel, 0, 1);
  const copyIn = clamp((progress - 0.02) / 0.08, 0, 1);
  const copyOut = clamp((progress - 0.22) / 0.10, 0, 1);
  const entranceCopy = copyIn * (1 - copyOut);
  const entranceCopyRise = copyOut * 9;
  const fieldReveal = clamp((progress - 0.34) / 0.22, 0, 1);
  const inward = clamp((progress - 0.58) / 0.23, 0, 1);
  const particleFade = clamp((progress - 0.72) / 0.18, 0, 1);
  const guideIn = clamp((progress - 0.39) / 0.08, 0, 1);
  const guideOut = clamp((progress - 0.895) / 0.045, 0, 1);
  const guideOpacity = guideIn * (1 - guideOut);
  const guideScale = 1 - guideOut * 0.78;
  const guideY = 54.5 - guideOut * 0.8;
  const blackoutIn = clamp((progress - 0.925) / 0.025, 0, 1);
  const blackoutOut = clamp((progress - 0.965) / 0.025, 0, 1);
  const blackout = blackoutIn * (1 - blackoutOut);
  const root = document.documentElement.style;
  root.setProperty('--light-progress', progress.toFixed(3));
  root.setProperty('--entrance-copy', entranceCopy.toFixed(3));
  root.setProperty('--entrance-copy-rise', entranceCopyRise.toFixed(3));
  root.setProperty('--field-reveal', fieldReveal.toFixed(3));
  root.setProperty('--guide-opacity', guideOpacity.toFixed(3));
  root.setProperty('--guide-y', guideY.toFixed(3));
  root.setProperty('--guide-scale', Math.max(0.12, guideScale).toFixed(3));
  root.setProperty('--blackout-opacity', blackout.toFixed(3));
  blackoutLayer?.classList.toggle('is-active', blackout > 0.002);
  return { progress, fieldReveal, inward, particleFade, guide: guideOpacity, blackout };
}

// Particles
const particles = [];
let dpr = Math.min(window.devicePixelRatio || 1, 2);
let width = 0;
let height = 0;
let animationFrameId = null;
let globalProgress = 0;
let roomProgress = { title: 0, blur: 6, copy: 0 };
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
  if (!roomSection) return { title: 0, blur: 6, copy: 0 };
  const rect = roomSection.getBoundingClientRect();
  const start = window.innerHeight * 0.95;
  const travel = Math.max(rect.height - window.innerHeight * 0.05, 1);
  const progress = clamp((start - rect.top) / travel, 0, 1);
  const titleIn = clamp(progress / 0.14, 0, 1);
  const titleOut = clamp((progress - 0.70) / 0.13, 0, 1);
  const title = titleIn * (1 - titleOut);
  const blur = 6 * (1 - titleIn) + 1.5 * titleOut;
  const copyIn = clamp((progress - 0.25) / 0.14, 0, 1);
  const copyOut = clamp((progress - 0.63) / 0.12, 0, 1);
  const copy = copyIn * (1 - copyOut);
  return { title, blur, copy };
}



function updateFoundersProgress() {
  if (!foundersNote) return 0;
  const rect = foundersNote.getBoundingClientRect();
  const travel = Math.max(rect.height - window.innerHeight, 1);
  const progress = clamp(-rect.top / travel, 0, 1);
  const enter = clamp(progress / 0.18, 0, 1);
  const exit = clamp((progress - 0.82) / 0.18, 0, 1);
  const presence = enter * (1 - exit);
  const root = document.documentElement.style;
  root.setProperty('--founder-progress', progress.toFixed(3));
  root.setProperty('--founder-presence', presence.toFixed(3));
  return progress;
}



function updateScrollScenes() {
  stickyCopySections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const travel = Math.max(rect.height - window.innerHeight, 1);
    const progress = clamp(-rect.top / travel, 0, 1);
    const enter = clamp(progress / 0.16, 0, 1);
    const exit = clamp((progress - 0.82) / 0.18, 0, 1);
    section.style.setProperty('--copy-progress', progress.toFixed(3));
    section.style.setProperty('--copy-presence', (enter * (1 - exit)).toFixed(3));
  });
  visualStories.forEach((story) => {
    const rect = story.getBoundingClientRect();
    const travel = Math.max(rect.height - window.innerHeight, 1);
    const progress = clamp(-rect.top / travel, 0, 1);
    const photoFade = clamp((progress - 0.34) / 0.18, 0, 1);
    const photoOpacity = 1 - photoFade;
    const textIn = clamp((progress - 0.50) / 0.18, 0, 1);
    const textOut = clamp((progress - 0.88) / 0.12, 0, 1);
    const textPresence = textIn * (1 - textOut);
    const textProgress = clamp((progress - 0.50) / 0.50, 0, 1);
    story.style.setProperty('--photo-opacity', photoOpacity.toFixed(3));
    story.style.setProperty('--text-presence', textPresence.toFixed(3));
    story.style.setProperty('--text-progress', textProgress.toFixed(3));
  });
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
  if (ep >= 0.94 || blackout > 0.001 || roomProgress.title > 0 || roomProgress.copy > 0) {
    animationFrameId = window.requestAnimationFrame(drawParticles);
    return;
  }

  const preEntrancePresence = ep < 0.12 ? clamp(globalProgress, 0, 0.08) : 0;
  const sparsePresence = clamp((ep - 0.47) / 0.04, 0, 1) *
    (1 - clamp((ep - 0.56) / 0.06, 0, 1));
  const openedPresence = fieldReveal * Math.pow(1 - particleFade, 1.7);
  const visibleRatio = clamp(preEntrancePresence * 0.015 + sparsePresence * 0.04 + openedPresence, 0, 1);
  const earlyCount = preEntrancePresence > 0.01 ? 2 : 0;
  const visibleCount = Math.max(earlyCount, sparsePresence > 0.02 ? 3 : 0,
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

    const spread = width < 760 ? 1.58 : 1;
    const targetRadius = width * (0.052 + (idx % 11) * 0.0055) * spread;
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
  updateFoundersProgress();
  updateScrollScenes();
  entranceProgress = updateLightTransition();
  globalProgress = updateGlobalProgress();
  roomProgress = updateRoomProgress();
  document.documentElement.style.setProperty('--room-title', (roomProgress.title || 0).toFixed(3));
  document.documentElement.style.setProperty('--room-blur', `${Math.max(0, roomProgress.blur || 0).toFixed(2)}px`);
  document.documentElement.style.setProperty('--room-copy', (roomProgress.copy || 0).toFixed(3));
}

let scrollScheduled = false;
function onScroll() {
  if (scrollScheduled) return;
  scrollScheduled = true;
  window.requestAnimationFrame(() => {
    update();
    scrollScheduled = false;
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => { if (!prefersReducedMotion) resizeCanvas(); update(); });

update();

if (!prefersReducedMotion && ctx) {
  resizeCanvas();
  createParticles(window.innerWidth < 760 ? 126 : 168);
  animationFrameId = window.requestAnimationFrame(drawParticles);
} else if (canvas) {
  canvas.remove();
}


function syncMotionPreference(event) {
  prefersReducedMotion = event.matches;
  if (prefersReducedMotion) {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    if (canvas) canvas.style.display = 'none';
  } else if (canvas) {
    canvas.style.display = '';
    resizeCanvas();
    if (!particles.length) createParticles(window.innerWidth < 760 ? 126 : 168);
    if (!animationFrameId && !document.hidden) animationFrameId = requestAnimationFrame(drawParticles);
  }
}

motionQuery.addEventListener?.('change', syncMotionPreference);
document.addEventListener('visibilitychange', () => {
  if (document.hidden && animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  } else if (!document.hidden && !prefersReducedMotion && ctx && !animationFrameId) {
    animationFrameId = requestAnimationFrame(drawParticles);
  }
});
