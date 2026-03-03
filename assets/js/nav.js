(() => {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('#mobileToggle');
  const panel = document.querySelector('#mobilePanel');
  const backdrop = document.querySelector('#mobileBackdrop');
  const desktopNav = document.querySelector('.nav-links');
  const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const setHeaderOffset = () => {
    if (!header) return;
    const height = header.offsetHeight;
    document.documentElement.style.setProperty('--header-height', `${height}px`);
  };

  const setActiveNav = () => {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('[data-nav-link], #mobilePanel a').forEach((link) => {
      const isActive = link.getAttribute('href') === path;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  if (!toggle || !panel || !backdrop) {
    setHeaderOffset();
    setActiveNav();
    return;
  }

  let lastFocusedElement = null;

  const getPanelFocusables = () => Array.from(panel.querySelectorAll(focusableSelector));

  const closeMenu = ({ restoreFocus = true } = {}) => {
    panel.classList.remove('open');
    backdrop.classList.remove('open');
    body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    if (restoreFocus && lastFocusedElement) {
      lastFocusedElement.focus();
    }
  };

  const openMenu = () => {
    lastFocusedElement = document.activeElement;
    panel.classList.add('open');
    backdrop.classList.add('open');
    body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    const firstFocusable = getPanelFocusables()[0];
    if (firstFocusable) firstFocusable.focus();
  };

  const toggleMenu = () => {
    if (panel.classList.contains('open')) {
      closeMenu({ restoreFocus: true });
    } else {
      openMenu();
    }
  };

  const trapFocus = (event) => {
    if (!panel.classList.contains('open') || event.key !== 'Tab') return;
    const focusables = getPanelFocusables();
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  toggle.addEventListener('click', toggleMenu);
  backdrop.addEventListener('click', () => closeMenu({ restoreFocus: true }));
  panel.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      closeMenu({ restoreFocus: false });
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.classList.contains('open')) {
      closeMenu({ restoreFocus: true });
      return;
    }
    trapFocus(event);
  });

  document.addEventListener('click', (event) => {
    if (!panel.classList.contains('open')) return;
    if (panel.contains(event.target) || toggle.contains(event.target) || backdrop.contains(event.target)) return;
    closeMenu({ restoreFocus: false });
  });

  const mq = window.matchMedia('(min-width: 821px)');
  mq.addEventListener('change', (event) => {
    if (event.matches) {
      closeMenu({ restoreFocus: false });
    }
    setHeaderOffset();
  });

  if (desktopNav && panel) {
    panel.innerHTML = desktopNav.innerHTML;
  }

  setHeaderOffset();
  setActiveNav();
  window.addEventListener('resize', setHeaderOffset, { passive: true });
})();