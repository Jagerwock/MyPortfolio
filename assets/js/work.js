(() => {
  const grid = document.querySelector('#workGrid');
  const emptyState = document.querySelector('#emptyState');
  const countLabel = document.querySelector('#resultsCount');
  const chips = Array.from(document.querySelectorAll('.chip'));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  if (!grid || !emptyState || !countLabel || !chips.length) return;

  const normalize = (value) => String(value || '').trim().toLowerCase();
  let projects = [];

  const renderCard = (project) => `
    <article class="card reveal-card" data-animate="card" data-tags="${project.tags.join(',')}">
      <a href="${project.caseStudy}">
        <div class="card-thumb"><img src="${project.gallery[0]}" alt="${project.title} preview"></div>
        <div class="card-body">
          <p class="card-meta">${project.year}</p>
          <h3>${project.title}</h3>
          <p>${project.shortDescription}</p>
          <div class="tags">${project.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div>
        </div>
      </a>
    </article>
  `;

  const animateFilterTransition = (filtered) => {
    const nextMarkup = filtered.map(renderCard).join('');

    if (prefersReducedMotion) {
      grid.innerHTML = nextMarkup;
      document.dispatchEvent(new CustomEvent('portfolio:content-updated', { detail: { scope: grid } }));
      return;
    }

    const currentCards = Array.from(grid.children);
    const previousHeight = grid.offsetHeight;
    grid.style.minHeight = `${previousHeight}px`;

    const commitNewCards = () => {
      grid.innerHTML = nextMarkup;
      const newCards = Array.from(grid.children);
      if (!newCards.length) {
        grid.style.minHeight = '';
        return;
      }

      if (hasGSAP) {
        window.gsap.fromTo(newCards, {
          opacity: 0,
          y: 18,
          scale: 0.985
        }, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.42,
          ease: 'power2.out',
          stagger: 0.07,
          clearProps: 'transform,opacity',
          onComplete: () => { grid.style.minHeight = ''; }
        });
      } else {
        newCards.forEach((card, index) => {
          card.style.opacity = '0';
          card.style.transform = 'translate3d(0, 14px, 0) scale(0.985)';
          card.style.transitionDelay = `${index * 45}ms`;
          requestAnimationFrame(() => {
            card.classList.add('card-enter');
          });
        });
        setTimeout(() => { grid.style.minHeight = ''; }, 350);
      }

      document.dispatchEvent(new CustomEvent('portfolio:content-updated', { detail: { scope: grid } }));
    };

    if (currentCards.length && hasGSAP) {
      window.gsap.to(currentCards, {
        opacity: 0,
        y: -10,
        scale: 0.985,
        duration: 0.2,
        ease: 'power1.in',
        stagger: 0.02,
        onComplete: commitNewCards
      });
    } else if (currentCards.length) {
      currentCards.forEach((card) => card.classList.add('card-exit'));
      setTimeout(commitNewCards, 180);
    } else {
      commitNewCards();
    }
  };

  const render = (selectedFilter = 'all') => {
    const activeFilter = normalize(selectedFilter);
    const filtered = activeFilter === 'all'
      ? projects
      : projects.filter((project) => project.tags.some((tag) => normalize(tag) === activeFilter));

    animateFilterTransition(filtered);
    countLabel.textContent = `Showing ${filtered.length} project${filtered.length === 1 ? '' : 's'}`;
    emptyState.hidden = filtered.length !== 0;
  };

  const setActiveChip = (chip) => {
    chips.forEach((item) => item.setAttribute('aria-pressed', String(item === chip)));
  };

  const init = async () => {
    try {
      const response = await fetch('assets/data/projects.json');
      projects = await response.json();
      render('all');
    } catch {
      grid.innerHTML = '';
      countLabel.textContent = 'Showing 0 projects';
      emptyState.hidden = false;
      emptyState.textContent = 'Projects are temporarily unavailable.';
    }
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      setActiveChip(chip);
      render(chip.dataset.filter || 'all');
    });
  });

  init();
})();