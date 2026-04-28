/* ============================================
   MineLacs — Common JavaScript Module
   Shared across all pages:
   Theme Toggle, Mobile Menu, Current Year
   ============================================ */

function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    const root = document.documentElement;

    const saved = localStorage.getItem('minelacs-theme');
    if (saved) root.setAttribute('data-theme', saved);

    if (!toggle) return;

    toggle.addEventListener('click', () => {
        const current = root.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem('minelacs-theme', next);
    });
}

function initMobileMenu() {
    const burger = document.getElementById('burgerMenu');
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');

    if (!burger || !menu) return;

    const links = menu.querySelectorAll('.mobile-menu__link');

    function openMenu() {
        menu.classList.add('mobile-menu--open');
        burger.classList.add('burger-menu--open');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        menu.classList.remove('mobile-menu--open');
        burger.classList.remove('burger-menu--open');
        document.body.style.overflow = '';
    }

    burger.addEventListener('click', () => {
        menu.classList.contains('mobile-menu--open') ? closeMenu() : openMenu();
    });

    if (overlay) overlay.addEventListener('click', closeMenu);
    links.forEach((link) => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('mobile-menu--open')) {
            closeMenu();
        }
    });
}

function setCurrentYear() {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('preloader--hidden');
        }, 300);

        setTimeout(() => {
            preloader.remove();
        }, 800);
    });
}

function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            btn.classList.add('back-to-top--visible');
        } else {
            btn.classList.remove('back-to-top--visible');
        }
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach((el) => observer.observe(el));
}
