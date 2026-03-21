const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const topbar = document.querySelector('.topbar');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.site-nav a[data-page]').forEach(link => {
  if (link.getAttribute('data-page') === currentPage) {
    link.classList.add('active');
  }
});

document.querySelectorAll('[data-year]').forEach(el => {
  el.textContent = String(new Date().getFullYear());
});

const revealItems = document.querySelectorAll('.reveal');
revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 45, 220)}ms`;
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );
  revealItems.forEach(el => observer.observe(el));
} else {
  revealItems.forEach(el => el.classList.add('show'));
}

const progress = document.createElement('div');
progress.className = 'scroll-progress';
document.body.appendChild(progress);

const parallaxImages = [...document.querySelectorAll('.hero-visual img, .page-hero img, .img-main, .img-small')];

function updateScrollEffects() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollTop = Math.max(window.scrollY, 0);
  const width = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
  progress.style.width = `${Math.min(width, 100)}%`;

  if (topbar) {
    topbar.classList.toggle('scrolled', scrollTop > 12);
  }

  if (prefersReducedMotion) {
    return;
  }

  parallaxImages.forEach(image => {
    const rect = image.getBoundingClientRect();
    if (rect.bottom < -60 || rect.top > window.innerHeight + 60) {
      return;
    }

    const depth = image.classList.contains('img-small') ? 0.06 : 0.03;
    const shift = (rect.top - window.innerHeight * 0.5) * depth;
    const scale = image.closest('.page-hero, .hero-visual') ? 1.07 : 1;
    image.style.transform = `translateY(${shift.toFixed(2)}px) scale(${scale})`;
  });
}

window.addEventListener('scroll', updateScrollEffects, { passive: true });
window.addEventListener('resize', updateScrollEffects);
updateScrollEffects();

const counters = document.querySelectorAll('.count-up');
function runCounter(counter) {
  const target = Number(counter.dataset.target || 0);
  const duration = Number(counter.dataset.duration || 1300);
  const suffix = counter.dataset.suffix || '';
  const prefix = counter.dataset.prefix || '';

  let start;
  function tick(timestamp) {
    if (!start) {
      start = timestamp;
    }
    const progressValue = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progressValue, 3);
    const value = Math.round(target * eased);
    counter.textContent = `${prefix}${value}${suffix}`;

    if (progressValue < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

if (counters.length) {
  const counterObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.45 }
  );

  counters.forEach(counter => {
    counter.textContent = '0';
    counterObserver.observe(counter);
  });
}

if (!prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const cards = document.querySelectorAll('.property-card, .quick-card, .service-card, .value-card, .team-card, .stat, .case-stat');

  cards.forEach(card => {
    card.classList.add('interactive-card');

    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 10;
      const rotateX = (0.5 - py) * 10;
      card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  window.addEventListener('pointermove', event => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
    glow.style.opacity = '1';
  });

  window.addEventListener('blur', () => {
    glow.style.opacity = '0';
  });
}
