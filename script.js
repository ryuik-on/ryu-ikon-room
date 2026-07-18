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

// no-motion-first: 「no-preference」を明示的に確認できた場合のみ動きを許可する。
// matchMediaがこのメディア特性に未対応の環境ではmatches=falseになるため、
// 未知の環境は自動的に安全側（motion-off）に倒れる。
const motionQuery = window.matchMedia('(prefers-reduced-motion: no-preference)');
let motionTier = motionQuery.matches ? 'full' : 'off'; // 'full' | 'lite' | 'off'

function applyMotionTier(tier) {
  motionTier = tier;
  document.documentElement.classList.remove('motion-full', 'motion-lite', 'motion-off');
  document.documentElement.classList.add('motion-' + tier);
}
applyMotionTier(motionTier);

// threshold-lightの既定（周囲環境）値。CSSの:root初期値と一致させること。
const AMBIENT_OPACITY = 0.16;
const AMBIENT_Y = 8;
const AMBIENT_SCALE = 0.55;

// D-021: 高速スクロール時に entrance-copy／room-title が「一瞬で消える」対策。
// スクロール位置から出した目標値(target)を、フレームごとに実時間で少しずつ
// 近づける減衰(lerp)を挟んでからCSS変数へ書き込む。スクロールを止めれば
// 最終的に正しい値へ収束するため位置とズレたまま固定される心配はなく、
// CSS transitionを使わないのでrAF毎フレーム更新との競合も避けられる。
const DISPLAY_DAMPING = 0.2; // 0〜1。実機確認で「遅れすぎない」範囲として選定
function lerp(current, target, damping) {
  return current + (target - current) * damping;
}
let displayedEntranceCopy = 0;
let displayedEntranceCopyRise = 0;
let displayedRoomTitle = 0;
let displayedRoomBlur = 6;
let displayedRoomCopy = 0;

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
  // D-020修正B（案1）：フェードにCSS transitionは足さず、スクロール連動の
  // 変化区間そのものを広げる（値を毎フレーム直接反映する既存方式を維持し、
  // 高速スクロール時に追い抜かれないという設計を崩さないため）。
  const copyIn = clamp((progress - 0.02) / 0.16, 0, 1);
  const copyOut = clamp((progress - 0.28) / 0.14, 0, 1);
  const entranceCopy = copyIn * (1 - copyOut);
  const entranceCopyRise = copyOut * 9;
  const fieldReveal = clamp((progress - 0.34) / 0.22, 0, 1);
  const inward = clamp((progress - 0.58) / 0.23, 0, 1);
  const particleFade = clamp((progress - 0.72) / 0.18, 0, 1);
  const guideIn = clamp((progress - 0.39) / 0.08, 0, 1);
  const guideOut = clamp((progress - 0.895) / 0.045, 0, 1);
  const entranceThresholdOpacity = guideIn * (1 - guideOut);
  const entranceThresholdScale = 1 - guideOut * 0.78;
  const entranceThresholdY = 54.5 - guideOut * 0.8;
  const blackoutIn = clamp((progress - 0.925) / 0.025, 0, 1);
  const blackoutOut = clamp((progress - 0.965) / 0.025, 0, 1);
  const blackout = blackoutIn * (1 - blackoutOut);

  // threshold-light: Hero〜ROOM入口を通しで伴走する唯一の光（B-1）。
  // 入口区間に入るまではAMBIENT値（控えめ）を保ち、guideInの立ち上がりに
  // 合わせて入口用の値へ滑らかに引き継ぐ。ROOM入口を過ぎたら役目を終えて消える
  // （以降はroom-stageの到着グローが引き継ぐため、光の意味の重複を避ける）。
  const pastThreshold = blackoutOut >= 1;
  const thresholdOpacity = pastThreshold ? 0 : Math.max(AMBIENT_OPACITY, entranceThresholdOpacity);
  const thresholdScale = pastThreshold
    ? entranceThresholdScale
    : AMBIENT_SCALE + (entranceThresholdScale - AMBIENT_SCALE) * guideIn;
  const thresholdY = pastThreshold
    ? entranceThresholdY
    : AMBIENT_Y + (entranceThresholdY - AMBIENT_Y) * guideIn;

  displayedEntranceCopy = lerp(displayedEntranceCopy, entranceCopy, DISPLAY_DAMPING);
  displayedEntranceCopyRise = lerp(displayedEntranceCopyRise, entranceCopyRise, DISPLAY_DAMPING);

  const root = document.documentElement.style;
  root.setProperty('--light-progress', progress.toFixed(3));
  root.setProperty('--entrance-copy', displayedEntranceCopy.toFixed(3));
  root.setProperty('--entrance-copy-rise', displayedEntranceCopyRise.toFixed(3));
  root.setProperty('--field-reveal', fieldReveal.toFixed(3));
  root.setProperty('--threshold-opacity', thresholdOpacity.toFixed(3));
  root.setProperty('--threshold-y', thresholdY.toFixed(3));
  root.setProperty('--threshold-scale', Math.max(0.12, thresholdScale).toFixed(3));
  root.setProperty('--blackout-opacity', blackout.toFixed(3));
  blackoutLayer?.classList.toggle('is-active', blackout > 0.002);
  return { progress, fieldReveal, inward, particleFade, guide: thresholdOpacity, blackout };
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
  // 高密度ディスプレイでの描画負荷を抑えるため2倍までに制限する。
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

function particleCountFor(tier) {
  const base = window.innerWidth < 760 ? 126 : 168;
  return tier === 'lite' ? Math.round(base / 2) : base;
}

function updateRoomProgress() {
  if (!roomSection) return { title: 0, blur: 6, copy: 0 };
  const rect = roomSection.getBoundingClientRect();
  const start = window.innerHeight * 0.95;
  const travel = Math.max(rect.height - window.innerHeight * 0.05, 1);
  const progress = clamp((start - rect.top) / travel, 0, 1);
  // D-020修正B（案1）：室見出し／サブコピーのフェード距離を広げ、一瞬で
  // 切り替わらないようにする（entrance-copyと同じ方針、詳細は同関数を参照）。
  const titleIn = clamp(progress / 0.28, 0, 1);
  const titleOut = clamp((progress - 0.62) / 0.20, 0, 1);
  const title = titleIn * (1 - titleOut);
  const blur = 6 * (1 - titleIn);
  const copyIn = clamp((progress - 0.25) / 0.22, 0, 1);
  const copyOut = clamp((progress - 0.63) / 0.18, 0, 1);
  const copy = copyIn * (1 - copyOut);

  // D-021：title／blur／copyも同じ仕組み（スクロール位置に直結）のため、
  // 同じ減衰を適用して高速スクロール時の瞬間切り替えを避ける。
  displayedRoomTitle = lerp(displayedRoomTitle, title, DISPLAY_DAMPING);
  displayedRoomBlur = lerp(displayedRoomBlur, blur, DISPLAY_DAMPING);
  displayedRoomCopy = lerp(displayedRoomCopy, copy, DISPLAY_DAMPING);

  return { title: displayedRoomTitle, blur: displayedRoomBlur, copy: displayedRoomCopy };
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

// 初回のパーティクル稼働から約1.5秒分のフレーム時間を実測し、
// 重い環境ではmotion-liteへ自動的に間引く（適応型劣化）。
const FPS_SAMPLE_FRAMES = 90;
const FPS_LITE_THRESHOLD = 40;
let fpsSampleFrames = 0;
let fpsSampleStart = 0;
let fpsSampleDone = false;

function sampleFrameRate(time) {
  if (fpsSampleDone || motionTier !== 'full') return;
  if (!fpsSampleStart) { fpsSampleStart = time; return; }
  fpsSampleFrames += 1;
  if (fpsSampleFrames < FPS_SAMPLE_FRAMES) return;
  const elapsed = time - fpsSampleStart;
  const measuredFps = (fpsSampleFrames / elapsed) * 1000;
  fpsSampleDone = true;
  if (measuredFps < FPS_LITE_THRESHOLD) {
    applyMotionTier('lite');
    createParticles(particleCountFor('lite'));
  }
}

function drawParticles(time) {
  if (motionTier === 'off' || !ctx || !canvas) return;
  sampleFrameRate(time);
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
window.addEventListener('resize', () => { if (motionTier !== 'off') resizeCanvas(); update(); });

update();

// パーティクルはlight-transition（ROOM入口）付近でのみ稼働させる。
// 常時rAFを回し続けるとページ全体でメインスレッドを占有するため、
// IntersectionObserverでその区間の前後60vhに入っている間だけ動かす。
let particlesRunning = false;

function startParticles() {
  if (particlesRunning || motionTier === 'off' || !ctx) return;
  particlesRunning = true;
  if (!particles.length) createParticles(particleCountFor(motionTier));
  if (!document.hidden && !animationFrameId) animationFrameId = requestAnimationFrame(drawParticles);
}

function stopParticles() {
  particlesRunning = false;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animationFrameId = null;
  if (ctx) ctx.clearRect(0, 0, width, height);
}

if (motionTier !== 'off' && ctx) {
  resizeCanvas();
  if (lightTransition && 'IntersectionObserver' in window) {
    const particleObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) startParticles();
        else stopParticles();
      });
    }, { rootMargin: '60% 0px 60% 0px' });
    particleObserver.observe(lightTransition);
  } else {
    startParticles();
  }
} else if (canvas) {
  canvas.remove();
}

function syncMotionPreference(event) {
  applyMotionTier(event.matches ? 'full' : 'off');
  if (motionTier === 'off') {
    stopParticles();
    if (canvas) canvas.style.display = 'none';
  } else if (canvas) {
    canvas.style.display = '';
    resizeCanvas();
    fpsSampleDone = false;
    fpsSampleFrames = 0;
    fpsSampleStart = 0;
    startParticles();
  }
}

motionQuery.addEventListener?.('change', syncMotionPreference);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
  } else if (particlesRunning && motionTier !== 'off' && ctx && !animationFrameId) {
    animationFrameId = requestAnimationFrame(drawParticles);
  }
});
