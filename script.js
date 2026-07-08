const revealElements = document.querySelectorAll('.reveal');
const fixedTicket = document.querySelector('.fixed-ticket');
const lightTransition = document.querySelector('.light-transition');

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
  if (window.scrollY > threshold) {
    fixedTicket.classList.add('is-visible');
  } else {
    fixedTicket.classList.remove('is-visible');
  }
}

function updateLightTransition() {
  if (!lightTransition) return;
  const rect = lightTransition.getBoundingClientRect();
  const start = window.innerHeight * 0.88;
  const end = -rect.height * 0.15;
  const progress = clamp((start - rect.top) / (start - end), 0, 1);
  document.documentElement.style.setProperty('--light-progress', progress.toFixed(3));
}

function update() {
  updateFixedTicket();
  updateLightTransition();
}

window.addEventListener('scroll', update, { passive: true });
window.addEventListener('resize', update);
update();
