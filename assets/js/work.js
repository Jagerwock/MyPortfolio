(() => {
  const grid = document.querySelector('#workGrid');
  const emptyState = document.querySelector('#emptyState');
  const countLabel = document.querySelector('#resultsCount');
  const chips = Array.from(document.querySelectorAll('.chip'));
  if (!grid || !emptyState || !countLabel || !chips.length) return;

  const normalize = (value) => String(value || '').trim().toLowerCase();
  let projects = [];

  const renderCard = (project) => `
    <article class="card reveal" data-tags="${project.tags.join(',')}">
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

  const render = (selectedFilter = 'all') => {
    const activeFilter = normalize(selectedFilter);
    const filtered = activeFilter === 'all'
      ? projects
      : projects.filter((project) => project.tags.some((tag) => normalize(tag) === activeFilter));

    grid.innerHTML = filtered.map(renderCard).join('');
    countLabel.textContent = `Showing ${filtered.length} project${filtered.length === 1 ? '' : 's'}`;
    emptyState.hidden = filtered.length !== 0;

    document.querySelectorAll('#workGrid .reveal').forEach((card) => {
      card.classList.add('visible');
    });
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