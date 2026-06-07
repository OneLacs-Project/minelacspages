// Disable browser scroll restoration to prevent page from jumping on refresh
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

function initThemeToggle() {
    const btn = document.getElementById('themeToggle');
    const root = document.documentElement;
    const saved = localStorage.getItem('minelacs-theme');
    if (saved) root.setAttribute('data-theme', saved);
    if (!btn) return;
    btn.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem('minelacs-theme', next);
    });
}

function initMobileMenu() {
    const burger  = document.getElementById('burgerMenu');
    const menu    = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');
    if (!burger || !menu) return;

    const links = menu.querySelectorAll('.mobile-menu__link');

    function close() {
        menu.classList.remove('mobile-menu--open');
        burger.classList.remove('burger-menu--open');
        document.body.style.overflow = '';
    }

    burger.addEventListener('click', () => {
        if (menu.classList.contains('mobile-menu--open')) {
            close();
        } else {
            menu.classList.add('mobile-menu--open');
            burger.classList.add('burger-menu--open');
            document.body.style.overflow = 'hidden';
        }
    });

    if (overlay) overlay.addEventListener('click', close);
    links.forEach(link => link.addEventListener('click', close));
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && menu.classList.contains('mobile-menu--open')) close();
    });
}

function setCurrentYear() {
    const el = document.getElementById('currentYear');
    if (el) el.textContent = new Date().getFullYear();
}

function initPreloader() {
    const loader = document.getElementById('preloader');
    if (!loader) return;
    window.addEventListener('load', () => {
        setTimeout(() => loader.classList.add('preloader--hidden'), 300);
        setTimeout(() => loader.remove(), 800);
    });
}

function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('back-to-top--visible', window.scrollY > 500);
    }, { passive: true });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function initScrollReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    items.forEach(el => observer.observe(el));
}

// Duplicate marquee tracks so the infinite scroll animation works seamlessly.
// Keeps only one set of items in the HTML; JS adds the copies.
function initMarquee() {
    document.querySelectorAll('.launcher-marquee__track').forEach(track => {
        const originals = Array.from(track.children);
        if (!originals.length) return;
        // We need 3 total sets for the CSS animation (translateX -33.3%)
        for (let i = 0; i < 2; i++) {
            originals.forEach(item => track.appendChild(item.cloneNode(true)));
        }
    });
}

function insertLayout() {
    const isSubPage = window.location.pathname.includes('/download') || window.location.pathname.includes('/onelauncher');
    const pathPrefix = isSubPage ? '../' : '';
    
    let activePage = 'home';
    if (window.location.pathname.includes('/download')) {
        activePage = 'download';
    } else if (window.location.pathname.includes('/onelauncher')) {
        activePage = 'launcher';
    }

    const header = document.getElementById('header');
    if (header) {
        const headerLogoHref = activePage === 'home' ? '#hero' : (pathPrefix || '/');
        const headerLogoClass = activePage === 'home' ? 'header__logo' : 'header__logo header__logo--visible';
        header.innerHTML = `
            <div class="header__container">
                <a href="${headerLogoHref}" class="${headerLogoClass}" id="headerLogo">
                    <img src="${pathPrefix}images/logo.png" alt="MineLacs" width="44" height="32" loading="lazy">
                </a>
                <nav class="header__nav" id="headerNav">
                    <a href="${pathPrefix}onelauncher/" class="nav__item nav__link ${activePage === 'launcher' ? 'nav__link--active' : ''}">Лаунчер</a>
                    <div class="nav__item nav__dropdown">
                        <a href="${activePage === 'home' ? '#hero' : pathPrefix}" class="nav__link ${activePage === 'home' ? 'nav__link--active' : ''}">
                            Главная
                            <svg class="nav__arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </a>
                        <div class="dropdown__menu">
                            <a href="${activePage === 'home' ? '#why-us' : pathPrefix + '#why-us'}" class="dropdown__link">Почему мы?</a>
                            <a href="${activePage === 'home' ? '#team' : pathPrefix + '#team'}" class="dropdown__link">Команда</a>
                            <a href="${activePage === 'home' ? '#faq' : pathPrefix + '#faq'}" class="dropdown__link">Частые вопросы</a>
                            <a href="${activePage === 'home' ? '#links' : pathPrefix + '#links'}" class="dropdown__link">Наши ссылки</a>
                        </div>
                    </div>
                    <a href="${pathPrefix}download/" class="nav__item nav__link ${activePage === 'download' ? 'nav__link--active' : ''}">Сборка</a>
                </nav>
                <div class="header__actions">
                    <button class="theme-toggle" id="themeToggle" aria-label="Переключить тему">
                        <svg class="theme-icon theme-icon--moon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                        </svg>
                        <svg class="theme-icon theme-icon--sun" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="5"/>
                            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                        </svg>
                    </button>
                    <button class="burger-menu" id="burgerMenu" aria-label="Меню">
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </div>
        `;
    }

    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.innerHTML = `
            <div class="mobile-menu__overlay" id="mobileOverlay"></div>
            <div class="mobile-menu__panel">
                <nav class="mobile-menu__nav">
                    <a href="${activePage === 'home' ? '#hero' : pathPrefix}" class="mobile-menu__link">Главная</a>
                    <a href="${activePage === 'home' ? '#why-us' : pathPrefix + '#why-us'}" class="mobile-menu__link">Почему мы?</a>
                    <a href="${activePage === 'home' ? '#team' : pathPrefix + '#team'}" class="mobile-menu__link">Команда</a>
                    <a href="${activePage === 'home' ? '#faq' : pathPrefix + '#faq'}" class="mobile-menu__link">Частые вопросы</a>
                    <a href="${activePage === 'home' ? '#links' : pathPrefix + '#links'}" class="mobile-menu__link">Наши ссылки</a>
                    <div class="mobile-menu__divider"></div>
                    <a href="${pathPrefix}onelauncher/" class="mobile-menu__link">Лаунчер</a>
                    <a href="${pathPrefix}download/" class="mobile-menu__link">Сборка</a>
                </nav>
            </div>
        `;
    }

    const footer = document.querySelector('.footer');
    if (footer) {
        footer.innerHTML = `
            <div class="container">
                <div class="footer__top">
                    <img src="${pathPrefix}images/logo.png" alt="MineLacs" class="footer__logo" width="48" loading="lazy">
                    <p class="footer__brand">MineLacs, 2023-<span id="currentYear"></span></p>
                </div>
                <p class="footer__copyright">© Все права защищены.</p>
                <p class="footer__disclaimer">Not an official Minecraft product. We are in no way affiliated with or endorsed by Mojang Synergies AB, Microsoft Corporation or other rightsholders.</p>
            </div>
        `;
    }
}

// Render layout synchronously before setup scripts run
insertLayout();