const revealElements = document.querySelectorAll('.reveal');
const fixedTicket = document.querySelector('.fixed-ticket');
const heroGap = document.querySelector('.black-gap-hero');

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

const ticketObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      fixedTicket.classList.add('is-visible');
    }
  });
}, {
  threshold: 0.15
});

if (heroGap) {
  ticketObserver.observe(heroGap);
}
