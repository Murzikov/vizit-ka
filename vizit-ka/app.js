/*
 * Основной скрипт для сайта Савелия
 * Реализует переключение темы, плавный скролл, анимации GSAP и подсветку активных пунктов меню.
 * Дополнительно: параллакс для фоновых blobs при скролле (GSAP + ScrollTrigger).
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSmoothScroll();
  initAnimations();
  initAmbientParallax();
  initActiveNav();
  setCurrentYear();
});

/**
 * Инициализация темы (светлая / тёмная).
 * Сохраняет состояние в localStorage и учитывает prefers-color-scheme.
 */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  if (!themeToggle) return;

  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');

  applyTheme(initialTheme);
  themeToggle.setAttribute('aria-pressed', initialTheme === 'dark');

  themeToggle.addEventListener('click', () => {
    const isDark = body.classList.toggle('theme-dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.setAttribute('aria-pressed', isDark);
  });

  function applyTheme(theme) {
    if (theme === 'dark') body.classList.add('theme-dark');
    else body.classList.remove('theme-dark');
  }
}

/**
 * Инициализация плавного скролла с помощью Lenis.
 */
function initSmoothScroll() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  if (typeof Lenis === 'undefined') return;

  // eslint-disable-next-line no-undef
  const lenis = new Lenis({
    duration: 1.2,
    smooth: true,
    smoothTouch: false,
    direction: 'vertical'
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

/**
 * Инициализация анимаций через GSAP и ScrollTrigger.
 */
function initAnimations() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // eslint-disable-next-line no-undef
  gsap.registerPlugin(ScrollTrigger);

  // On-load анимация HERO
  const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTimeline
    .from('.hero-title .line', {
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08
    })
    .from('.hero-subtitle', {
      y: 30,
      opacity: 0,
      duration: 0.6
    }, '-=0.5')
    .from('.hero-buttons', {
      y: 30,
      opacity: 0,
      duration: 0.6
    }, '-=0.4')
    .from('.hero-bg .blob', {
      scale: 0.8,
      opacity: 0,
      duration: 1.2,
      stagger: 0.2
    }, '-=1');

  // Reveal: карточки услуг
  gsap.utils.toArray('.service-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 40,
      opacity: 0,
      duration: 0.6,
      delay: i * 0.05
    });
  });

  // Reveal: карточки работ
  gsap.utils.toArray('.work-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 40,
      opacity: 0,
      duration: 0.6,
      delay: i * 0.1
    });
  });

  // Reveal: иконки контактов
  gsap.utils.toArray('.contact-icon').forEach((icon, i) => {
    gsap.from(icon, {
      scrollTrigger: {
        trigger: icon,
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 30,
      opacity: 0,
      duration: 0.5,
      delay: i * 0.1
    });
  });

  // Mouse-parallax только для blobs внутри HERO
  const hero = document.getElementById('hero');
  if (!hero) return;

  const blobs = hero.querySelectorAll('.hero-bg .blob');
  if (!blobs.length) return;

  hero.addEventListener('mousemove', (e) => {
    const { left, top, width, height } = hero.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const centerX = width / 2;
    const centerY = height / 2;

    blobs.forEach((blob, idx) => {
      const depth = (idx + 1) * 18;
      const moveX = (x - centerX) / depth;
      const moveY = (y - centerY) / depth;
      blob.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
    });
  }, { passive: true });

  hero.addEventListener('mouseleave', () => {
    blobs.forEach((blob) => {
      blob.style.transform = 'translate(-50%, -50%)';
    });
  }, { passive: true });
}

/**
 * Параллакс-эффект для глобальных фоновых blobs и blobs в HERO.
 * ВАЖНО: работает только если prefers-reduced-motion не включён.
 */
function initAmbientParallax() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // eslint-disable-next-line no-undef
  gsap.registerPlugin(ScrollTrigger);

  // Глобальный фон (6–10 blobs): заметное плавание на весь скролл документа
  const ambientBlobs = document.querySelectorAll('.ambient .blob');
  ambientBlobs.forEach((blob, i) => {
    const dir = i % 2 === 0 ? 1 : -1;
    const depth = 140 + i * 70;

    gsap.to(blob, {
      y: dir * depth,
      x: -dir * depth * 0.35,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true
      }
    });
  });

  // HERO blobs: движение чуть спокойнее, чтобы не отвлекать
  const heroBlobs = document.querySelectorAll('.hero-bg .blob');
  heroBlobs.forEach((blob, i) => {
    const dir = i % 2 === 0 ? -1 : 1;
    const depth = 70 + i * 45;

    gsap.to(blob, {
      y: dir * depth,
      x: dir * depth * 0.25,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true
      }
    });
  });
}

/**
 * Подсветка активного пункта меню при прокрутке.
 */
function initActiveNav() {
  const navLinks = document.querySelectorAll('.nav-list a');
  const sections = document.querySelectorAll('section');
  if (!navLinks.length || !sections.length) return;

  const setActive = (id) => {
    navLinks.forEach((link) => {
      const hrefId = link.getAttribute('href')?.substring(1);
      link.classList.toggle('active', hrefId === id);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    { threshold: 0.5 }
  );

  sections.forEach((section) => observer.observe(section));
}

/**
 * Устанавливает текущий год в футере.
 */
function setCurrentYear() {
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
}