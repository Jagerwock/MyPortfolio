(() => {
  const grid = document.querySelector('#workGrid');
  if (!grid) return;

  const empty = document.querySelector('#emptyState');
  const chips = [...document.querySelectorAll('.chip')];
  let projects = [];

  const card = (p) => `
    <article class="card reveal" data-tags="${p.tags.join(',')}">
      <a href="project.html?slug=${p.slug}">
        <div class="card-thumb"><img src="${p.gallery[0]}" alt="${p.title} preview"></div>
        <div class="card-body">
          <p class="card-meta">${p.year}</p>
          <h3>${p.title}</h3>
          <p>${p.shortDescription}</p>
          <div class="tags">${p.tags.map((t) => `<span class="tag">${t}</span>`).join('')}</div>
        </div>
      </a>
    </article>`;

  const render = (filter = 'All') => {
    const filtered = filter === 'All' ? projects : projects.filter((p) => p.tags.includes(filter));
    grid.innerHTML = filtered.map(card).join('');
    empty.hidden = filtered.length > 0;
  };

  fetch('assets/data/projects.json')
    .then((r) => r.json())
    .then((data) => {
      projects = data;
      render();
    });

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', 'true');
      render(chip.dataset.filter);
    });
  });
})();