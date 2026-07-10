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
  if (!lightTransition) {
    return {
      progress: 0,
      fieldReveal: 0,
      fieldHold: 0,
      surroundFade: 0,
      guide: 0,
      blackout: 0
    };
  }

  const rect = lightTransition.getBoundingClientRect();
  const start = window.innerHeight * 0.98;
  const end = -rect.height * 0.09;
  const progress = clamp((start - rect.top) / (start - end), 0, 1);

  const primaryIn = clamp((progress - 0.035) / 0.10, 0, 1);
  const primaryOut = clamp((progress - 0.22) / 0.10, 0, 1);
  const primaryCopy = primaryIn * (1 - primaryOut);

  const secondaryIn = clamp((progress - 0.29) / 0.09, 0, 1);
  const secondaryOut = clamp((progress - 0.48) / 0.11, 0, 1);
  const secondaryCopy = secondaryIn * (1 - secondaryOut);

  const fieldReveal = clamp((progress - 0.47) / 0.18, 0, 1);
  const fieldHold = clamp((progress - 0.63) / 0.06, 0, 1);
  const surroundFade = clamp((progress - 0.71) / 0.15, 0, 1);

  // The central light already exists before the field fully opens.
  const guideIn = clamp((progress - 0.39) / 0.12, 0, 1);
  const companionsIn = clamp((progress - 0.57) / 0.08, 0, 1);
  const companionsOut = clamp((progress - 0.84) / 0.055, 0, 1);
  const companionOpacity = companionsIn * (1 - companionsOut);

  const travel = clamp((progress - 0.84) / 0.09, 0, 1);
  const settle = clamp((progress - 0.915) / 0.03, 0, 1);
  const vanish = clamp((progress - 0.948) / 0.022, 0, 1);

  const blackoutIn = clamp((progress - 0.968) / 0.014, 0, 1);
  const blackoutOut = clamp((progress - 0.984) / 0.016, 0, 1);
  const blackout = blackoutIn * (1 - blackoutOut);

  // Slightly above centre, then recedes toward the threshold.
  const guideY = 54.5 + travel * 14.5;
  const guideScale = 1.07 - travel * 0.44 - settle * 0.21;
  const guideStretch = settle * (1 - vanish);
  const guideOpacity = guideIn * (1 - vanish);

  document.documentElement.style.setProperty('--light-progress', progress.toFixed(3));
  document.documentElement.style.setProperty('--entrance-copy', primaryCopy.toFixed(3));
  document.documentElement.style.setProperty('--entrance-copy-secondary', secondaryCopy.toFixed(3));
  document.documentElement.style.setProperty('--field-reveal', fieldReveal.toFixed(3));
  document.documentElement.style.setProperty('--guide-opacity', guideOpacity.toFixed(3));
  document.documentElement.style.setProperty('--guide-y', guideY.toFixed(3));
  document.documentElement.style.setProperty('--guide-scale', Math.max(0.16, guideScale).toFixed(3));
  document.documentElement.style.setProperty('--guide-stretch', guideStretch.toFixed(3));
  document.documentElement.style.setProperty('--companion-opacity', companionOpacity.toFixed(3));
  document.documentElement.style.setProperty('--blackout-opacity', blackout.toFixed(3));

  return {
    progress,
    fieldReveal,
    fieldHold,
    surroundFade,
    guide: guideOpacity,
    companionOpacity,
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
let entranceProgress = { progress: 0, fieldReveal: 0, fieldHold: 0, surroundFade: 0, guide: 0, companionOpacity: 0, blackout: 0 };

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
    if (sizeRoll < 0.85) particleSize = 0.18 + Math.random() * 0.34;
    else if (sizeRoll < 0.97) particleSize = 0.52 + Math.random() * 0.26;
    else particleSize = 0.82 + Math.random() * 0.42;

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
    return { gather: 0, fade: 0, visible: 0, beyond: 0, copy: 0, release: 0, title: 0 };
  }
  const rect = roomSection.getBoundingClientRect();

  const start = window.innerHeight * 1.02;
  const end = -rect.height * 0.15;
  const progress = clamp((start - rect.top) / (start - end), 0, 1);

  // ROOM is revealed only after the guide light has disappeared.
  const titleIn = clamp((progress - 0.09) / 0.16, 0, 1);
  const titleHoldOut = clamp((progress - 0.72) / 0.16, 0, 1);
  const title = titleIn * (1 - titleHoldOut);
  const copyIn = clamp((progress - 0.23) / 0.14, 0, 1);
  const release = titleHoldOut;
  const copy = copyIn * (1 - release);
  const beyondIn = clamp((progress - 0.18) / 0.18, 0, 1);
  const beyond = beyondIn * (1 - release * 0.92);

  return {
    gather: 0,
    fade: release,
    visible: title,
    beyond,
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

  const strength = globalProgress;
  const roomPull = 0;
  const fadeOut = roomProgress.fade;
  const ep = entranceProgress.progress || 0;
  const fieldReveal = entranceProgress.fieldReveal || 0;
  const surroundFade = entranceProgress.surroundFade || 0;
  const entranceActive = ep > 0.02 && ep < 0.995;

  // Before passing the words: just two or three points.
  // Beyond the words: the hidden field opens from below.
  const sparsePresence = clamp((ep - 0.27) / 0.06, 0, 1) *
    (1 - clamp((ep - 0.49) / 0.09, 0, 1));
  const openedPresence = fieldReveal * Math.pow(1 - surroundFade, 2.15);

  const particlePresence = entranceActive
    ? clamp(sparsePresence * 0.045 + openedPresence, 0, 1)
    : clamp(strength * Math.pow(1 - fadeOut, 1.8), 0, 1);
  const sparseCount = sparsePresence > 0.02 ? 3 : 0;
  const visibleCount = entranceActive
    ? Math.max(sparseCount, Math.floor(particles.length * openedPresence))
    : Math.floor(particles.length * particlePresence);
  const centerX = width * 0.50;
  const centerY = height * 0.58;

  particles.forEach((p, idx) => {
    // update
    p.phase += p.twinkleMode === "still" ? 0.0012 :
      (p.twinkleMode === "slow" ? 0.003 : 0.006);
    const driftBoost = 0.22 + strength * 0.42;
    p.y -= p.speedY * driftBoost;
    p.x += p.speedX * (0.18 + strength * 0.18) +
      (p.twinkleMode === "breath" ? Math.sin(p.phase) * 0.000035 : 0);

    if (fieldReveal > 0.01) {
      // After the words are passed, the field becomes visible from below.
      p.x += ((centerX / width) - p.x) * (0.00005 + fieldReveal * 0.00022);
      p.y += ((centerY / height) - p.y) * (0.00004 + fieldReveal * 0.00018);
    } else if (roomPull > 0.01) {
      p.x += ((centerX / width) - p.x) * (0.00025 + roomPull * 0.00065);
      p.y += ((centerY / height) - p.y) * (0.00020 + roomPull * 0.00055);
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

    const baseX = p.x * width;
    const baseY = p.y * height;

    // At the threshold, points live below/behind the copy.
    // They expand into the full field only after it has been passed.
    const hiddenY = height * (0.70 + p.depth * 0.22);
    const openedY = baseY;
    const openedX = baseX;
    const thresholdX = centerX + (p.x - 0.5) * width * 0.32;
    const spatialOpen = entranceActive ? fieldReveal : 1;

    const x = thresholdX + (openedX - thresholdX) * spatialOpen;
    const y = hiddenY + (openedY - hiddenY) * spatialOpen;

    let twinkle = 0.94;
    if (p.twinkleMode === "slow") {
      twinkle = 0.82 + 0.18 * Math.sin(time * 0.00023 + p.twinkle);
    } else if (p.twinkleMode === "breath") {
      twinkle = 0.70 + 0.30 * Math.sin(time * 0.00042 + p.twinkle);
    }
    const centerDistance = Math.min(
      1,
      Math.hypot((x - centerX) / (width * 0.55), (y - centerY) / (height * 0.52))
    );
    const localFade = clamp(
      surroundFade * (0.68 + centerDistance * 0.62),
      0,
      1
    );

    const alpha = entranceActive
      ? (0.12 + openedPresence * 0.48) * twinkle * Math.pow(1 - localFade, 1.72)
      : particlePresence * 0.34 * twinkle * Math.pow(1 - fadeOut, 1.45);
    const radius = p.size * (0.76 + spatialOpen * 0.18);

    ctx.beginPath();
    ctx.fillStyle = p.warm
      ? `rgba(250, 247, 239, ${alpha * 0.86})`
      : `rgba(239, 243, 250, ${alpha})`;
    ctx.shadowBlur = radius > 0.72 ? 1.5 + radius * 0.9 : 0.6;
    ctx.shadowColor = p.warm
      ? `rgba(245, 239, 225, ${0.05 + alpha * 0.28})`
      : `rgba(222, 231, 246, ${0.05 + alpha * 0.30})`;
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
  document.documentElement.style.setProperty('--room-title-opacity', (roomProgress.title || 0).toFixed(3));
  document.documentElement.style.setProperty('--room-title-y', ((1 - (roomProgress.title || 0)) * 10).toFixed(3));
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
