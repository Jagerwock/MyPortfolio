(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';

  const initSmoothAnchors = () => {
    document.addEventListener('click', (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  };

  const initPageTransition = () => {
    document.body.classList.add('page-ready');
    if (prefersReducedMotion) return;

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;

      event.preventDefault();
      document.body.classList.add('is-leaving');
      window.setTimeout(() => {
        window.location.href = url.href;
      }, 160);
    });
  };

  const initGSAPAnimations = (scope = document) => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    if (scope === document) {
      const hero = document.querySelector('.hero');
      if (hero) {
        const heading = hero.querySelector('h1');
        const heroSub = hero.querySelectorAll('p:not(.section-label), .cta-row > *');
        const navTargets = document.querySelectorAll('.wordmark, .nav-links a, .mobile-toggle');

        if (heading && !heading.dataset.splitReady) {
          const words = heading.textContent.trim().split(/\s+/).map((word) => `<span class="split-word">${word}</span>`).join(' ');
          heading.innerHTML = words;
          heading.dataset.splitReady = 'true';
        }

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.from(navTargets, { y: -10, opacity: 0, duration: 0.45, stagger: 0.06 })
          .from('.hero .section-label', { opacity: 0, y: 12, duration: 0.45 }, '-=0.15')
          .from('.hero h1 .split-word', { opacity: 0, yPercent: 110, rotateX: -16, transformOrigin: '0 100%', duration: 0.65, stagger: 0.028 }, '-=0.2')
          .from(heroSub, { opacity: 0, y: 18, duration: 0.5, stagger: 0.08 }, '-=0.35');
      }
    }

    const sections = scope.querySelectorAll('[data-animate="section"], .section .container, .panel');
    sections.forEach((item) => {
      if (item.dataset.animated === 'true') return;
      item.dataset.animated = 'true';
      gsap.fromTo(item, { opacity: 0, y: 26, filter: 'blur(4px)' }, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.72,
        ease: 'power2.out',
        scrollTrigger: { trigger: item, start: 'top 88%' }
      });
    });

    const cards = scope.querySelectorAll('[data-animate="card"], .works-grid .card');
    if (cards.length) {
      gsap.set(cards, { opacity: 0, y: 18 });
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: cards[0].parentElement, start: 'top 86%' }
      });
    }

    const processSteps = scope.querySelectorAll('[data-process-step]');
    processSteps.forEach((step, index) => {
      gsap.fromTo(step, { opacity: 0, x: index % 2 ? 16 : -16 }, {
        opacity: 1,
        x: 0,
        duration: 0.55,
        ease: 'power2.out',
        scrollTrigger: { trigger: step, start: 'top 90%' }
      });
    });
  };

  const initFallbackAnimations = () => {
    const targets = document.querySelectorAll('.hero, .section .container, .works-grid .card, .panel');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    targets.forEach((target) => observer.observe(target));
  };

  const initParallax = () => {
    if (prefersReducedMotion) return;
    const layer = document.querySelector('[data-parallax]');
    if (!layer) return;

    const onScroll = () => {
      const offset = window.scrollY * 0.05;
      layer.style.transform = `translate3d(0, ${offset}px, 0)`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  };

  if (!prefersReducedMotion && hasGSAP) {
    initGSAPAnimations();
  } else if (!prefersReducedMotion) {
    initFallbackAnimations();
  } else {
    document.documentElement.classList.add('reduced-motion');
  }

  document.addEventListener('portfolio:content-updated', (event) => {
    if (prefersReducedMotion) return;
    if (hasGSAP) {
      initGSAPAnimations(event.detail?.scope || document);
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }
  });

  initSmoothAnchors();
  initParallax();
  initPageTransition();
})();