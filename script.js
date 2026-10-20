document.documentElement.classList.add('js-enabled');

// Keep diagonal-link arrows in text presentation on narrow screens so iOS
// renders them as clean symbols instead of colorful emoji glyphs.
const mobileArrowText = window.matchMedia('(max-width: 640px)');
const setArrowPresentation = () => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeValue.includes('↗')) {
      node.nodeValue = mobileArrowText.matches
        ? node.nodeValue.replace(/↗\uFE0E?/g, '↗\uFE0E')
        : node.nodeValue.replace(/↗\uFE0E/g, '↗');
    }
  }
};
setArrowPresentation();
mobileArrowText.addEventListener('change', setArrowPresentation);

// A fine progress line gives the long-form walk a quiet sense of movement.
const progress = document.createElement('div');
progress.className = 'scroll-progress';
progress.setAttribute('aria-hidden', 'true');
document.body.append(progress);

let scrollQueued = false;
const updateScrollEffects = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progressValue = scrollable > 0 ? window.scrollY / scrollable : 0;
  progress.style.transform = `scaleX(${Math.min(1, Math.max(0, progressValue))})`;
  document.body.classList.toggle('has-scrolled', window.scrollY > 24);
  const hero = document.querySelector('.hero-art');
  if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const bounds = hero.getBoundingClientRect();
    const offset = Math.max(-1, Math.min(1, (window.innerHeight * .5 - (bounds.top + bounds.height * .5)) / window.innerHeight));
    hero.style.setProperty('--scroll-shift', `${offset * -10}px`);
  }
  document.querySelectorAll('.motion-panel').forEach((panel) => {
    const bounds = panel.getBoundingClientRect();
    const offset = Math.max(-1, Math.min(1, (window.innerHeight * .5 - (bounds.top + bounds.height * .5)) / window.innerHeight));
    panel.style.setProperty('--panel-shift', `${offset * -7}px`);
  });
  scrollQueued = false;
};
window.addEventListener('scroll', () => {
  if (!scrollQueued) {
    window.requestAnimationFrame(updateScrollEffects);
    scrollQueued = true;
  }
}, { passive: true });
updateScrollEffects();

const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Відкрити меню' : 'Закрити меню');
  mainNav.classList.toggle('is-open', !isOpen);
});

mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Відкрити меню');
    mainNav.classList.remove('is-open');
  });
});

const revealTargets = document.querySelectorAll(
  '.hero-copy, .hero-art, .hero-bottomline, .section-kicker, .intro-grid, .fact-strip, .city-story-heading, .city-story-card, .city-story-note, .route-heading, .route-stop, .stop-card, .places-heading, .place-card, .story-grid, .story-copy > p, .visit-heading, .visit-card, .prepare-strip, .visit-note, .plan-content, .plan-callout > .button'
);

revealTargets.forEach((element, index) => {
  element.classList.add('reveal');
  element.style.setProperty('--reveal-delay', `${(index % 4) * 105}ms`);
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealTargets.forEach((element) => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -9% 0px' });

  revealTargets.forEach((element) => revealObserver.observe(element));
}

// The section-by-section rhythm adds a little depth as each part of the walk arrives.
if (!prefersReducedMotion) {
  document.querySelectorAll('.route-stop, .city-story-card, .place-card, .visit-card').forEach((item, index) => {
    item.style.setProperty('--sequence', index % 4);
  });

  document.querySelectorAll('.story-photo, .place-card .photo-visual, .route-section').forEach((panel) => {
    panel.classList.add('motion-panel');
  });
}

// Gentle pointer depth on larger screens; touch users keep the clean static layout.
if (!prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const heroArt = document.querySelector('.hero-art');
  if (heroArt) {
    let pointerFrame = 0;
    heroArt.addEventListener('pointermove', (event) => {
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        const rect = heroArt.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        heroArt.style.setProperty('--pointer-x', `${x * 9}px`);
        heroArt.style.setProperty('--pointer-y', `${y * 9}px`);
      });
    });
    heroArt.addEventListener('pointerleave', () => {
      heroArt.style.setProperty('--pointer-x', '0px');
      heroArt.style.setProperty('--pointer-y', '0px');
    });
  }

  document.querySelectorAll('.place-card, .visit-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const tiltX = ((event.clientY - rect.top) / rect.height - .5) * -1.4;
      const tiltY = ((event.clientX - rect.left) / rect.width - .5) * 1.4;
      card.style.setProperty('--tilt-x', `${tiltX}deg`);
      card.style.setProperty('--tilt-y', `${tiltY}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}

