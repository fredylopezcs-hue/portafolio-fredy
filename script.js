/* ==========================================================================
   Fredy López Meneses · Portafolio
   JavaScript vanilla: menú móvil, scroll reveal, enlace activo y contadores.
   ========================================================================== */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsIO = 'IntersectionObserver' in window;

  /* ---------- Encabezado: fondo al desplazarse ---------- */

  const header = document.querySelector('.site-header');

  const updateHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  /* ---------- Menú hamburguesa ---------- */

  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');
  const desktopQuery = window.matchMedia('(min-width: 960px)');

  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  };

  toggle.addEventListener('click', () => {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Cerrar al elegir un enlace
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });

  // Cerrar con Escape y devolver el foco al botón
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  // Cerrar si la ventana pasa a escritorio con el menú abierto
  desktopQuery.addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });

  /* ---------- Scroll reveal ---------- */

  const revealEls = Array.from(document.querySelectorAll('.reveal'));

  if (reduceMotion || !supportsIO) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    // Escalonado suave entre elementos hermanos
    revealEls.forEach((el) => {
      const siblings = Array.from(el.parentElement.children).filter((child) =>
        child.classList.contains('reveal')
      );
      const index = siblings.indexOf(el);
      el.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 70}ms`);
    });

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Enlace de navegación activo ---------- */

  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const sectionIds = ['inicio', ...navLinks.map((link) => link.hash.slice(1))];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const setActive = (id) => {
    navLinks.forEach((link) => {
      const isActive = link.hash.slice(1) === id;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  if (supportsIO && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      // Franja central de la ventana: la sección que la cruza es la activa
      { rootMargin: '-45% 0px -50% 0px' }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  // Al llegar al final de la página, la última sección queda activa
  const lastId = sectionIds[sectionIds.length - 1];

  const checkPageEnd = () => {
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom) setActive(lastId);
  };

  /* ---------- Contadores animados ---------- */

  const counters = Array.from(document.querySelectorAll('[data-count]'));
  const COUNTER_DURATION = 1400;

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target = Number(el.dataset.count);
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / COUNTER_DURATION, 1);
      el.textContent = String(Math.round(target * easeOutCubic(progress)));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  // Sin IntersectionObserver o con movimiento reducido se muestra el valor final del HTML
  if (!reduceMotion && supportsIO && counters.length) {
    counters.forEach((el) => {
      el.textContent = '0';
    });

    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach((el) => counterObserver.observe(el));
  }

  /* ---------- Desplazamiento ---------- */

  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateHeader();
      checkPageEnd();
      ticking = false;
    });
  };

  updateHeader();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Año del pie de página ---------- */

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
