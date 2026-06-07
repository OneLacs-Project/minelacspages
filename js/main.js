function initHeaderScroll() {
    const header = document.getElementById('header');
    const hero   = document.getElementById('hero');
    if (!header || !hero) return;

    new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                header.classList.remove('header--scrolled');
            } else {
                header.classList.add('header--scrolled');
            }
        });
    }, { threshold: 0.15 }).observe(hero);
}

function initHeroParallax() {
    const logo    = document.querySelector('.hero__logo');
    const slogan  = document.querySelector('.hero__slogan');
    const buttons = document.querySelector('.hero__buttons');
    const glow    = document.querySelector('.hero__glow');
    const hero    = document.getElementById('hero');
    if (!logo || !hero) return;

    let ticking = false;

    function update() {
        const scrollY     = window.scrollY;
        const heroHeight  = hero.offsetHeight;
        if (scrollY <= heroHeight) {
            const ratio = scrollY / heroHeight;
            logo.style.transform = `translateY(${0.12 * scrollY}px) scale(${1 - 0.1 * ratio})`;
            logo.style.opacity   = 1 - 0.9 * ratio;
            if (slogan) {
                slogan.style.transform = `translateY(${0.25 * scrollY}px)`;
                slogan.style.opacity   = 1 - 0.95 * ratio;
            }
            if (buttons) {
                buttons.style.transform = `translateY(${0.38 * scrollY}px)`;
                buttons.style.opacity   = 1 - ratio;
            }
            if (glow) {
                glow.style.transform = `translate(-50%, -50%) scale(${1 + 0.4 * ratio})`;
                glow.style.opacity   = 1 - 0.7 * ratio;
            }
        }
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });
}

function initHeroScrollHint() {
    const btn = document.getElementById('heroScrollHint');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const target = document.getElementById('why-us');
        if (!target) return;
        const offset = target.getBoundingClientRect().top + window.pageYOffset - 70;
        window.scrollTo({ top: offset, behavior: 'smooth' });
    });
}

function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
        const btn = item.querySelector('.faq-question');
        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('faq-item--open');
            items.forEach(other => {
                if (other !== item) {
                    other.classList.remove('faq-item--open');
                    other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                }
            });
            item.classList.toggle('faq-item--open');
            btn.setAttribute('aria-expanded', !isOpen);
        });
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const hash = link.getAttribute('href');
            if (hash === '#') return;
            const target = document.querySelector(hash);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

const SkinManager = (() => {
    let retries = 0;
    const viewers = [];

    function sizeFor(card) {
        const tier = card.closest('.team-tier');
        if (tier?.classList.contains('team-tier--mod'))  return { width: 150, height: 220 };
        if (tier?.classList.contains('team-tier--beta')) return { width: 120, height: 180 };
        return { width: 180, height: 260 };
    }

    function showFallback(card, width, height) {
        const canvas = card.querySelector('.team-card__canvas');
        if (canvas) canvas.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = 'team-card__fallback';
        fallback.style.cssText = `
            width: ${width}px;
            height: ${height}px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: var(--text-muted);
            background: var(--bg-secondary);
            border-radius: var(--radius-sm);
        `;
        fallback.textContent = '👤';
        const wrapper = card.querySelector('.team-card__canvas-wrapper');
        if (wrapper) wrapper.appendChild(fallback);
    }

    function disposeAll() {
        viewers.forEach(v => { try { v.dispose(); } catch (_) {} });
        viewers.length = 0;
    }

    window.addEventListener('beforeunload', disposeAll);
    document.addEventListener('visibilitychange', () => {
        const paused = document.visibilityState === 'hidden';
        viewers.forEach(v => { try { v.renderPaused = paused; } catch (_) {} });
    });

    function init() {
        if (typeof skinview3d === 'undefined') {
            retries++;
            if (retries < 20) {
                setTimeout(init, 500);
            } else {
                console.warn('skinview3d library failed to load after retries.');
                document.querySelectorAll('.team-card[data-nickname]').forEach(card => {
                    const { width, height } = sizeFor(card);
                    showFallback(card, width, height);
                });
            }
            return;
        }

        document.querySelectorAll('.team-card[data-nickname]').forEach(card => {
            const nickname = card.dataset.nickname;
            const canvas   = card.querySelector('.team-card__canvas');
            if (!canvas) return;

            const { width, height } = sizeFor(card);
            const sources = [
                `https://minotar.net/skin/${nickname}`,
                `https://mc-heads.net/skin/${nickname}`,
            ];

            try {
                const viewer = new skinview3d.SkinViewer({ canvas, width, height });
                viewer.renderer.setClearColor(0, 0);
                viewer.fov             = 30;
                viewer.zoom            = 0.92;
                viewer.autoRotate      = true;
                viewer.autoRotateSpeed = 0.5;
                const control = skinview3d.createOrbitControls(viewer);
                control.enableRotate = true;
                control.enableZoom   = false;
                control.enablePan    = false;
                const walk = viewer.animations.add(skinview3d.WalkingAnimation);
                walk.speed = 0.3;
                viewers.push(viewer);
                card._viewer = viewer;

                (async function loadSkin(v, srcs) {
                    for (let i = 0; i < srcs.length; i++) {
                        try { return await v.loadSkin(srcs[i]); } catch (_) {
                            console.warn(`Skin source ${i + 1}/${srcs.length} failed, trying next...`);
                        }
                    }
                    throw new Error('All skin sources exhausted');
                })(viewer, sources).catch(() => showFallback(card, width, height));

            } catch (err) {
                console.warn(`Failed to init viewer for ${nickname}:`, err);
                showFallback(card, width, height);
            }
        });
    }

    return { init, dispose: disposeAll };
})();

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initThemeToggle();
    initHeaderScroll();
    initHeroParallax();
    initHeroScrollHint();
    initMobileMenu();
    initScrollReveal();
    initFAQ();
    initSmoothScroll();
    initBackToTop();
    setCurrentYear();
    initMarquee();
    SkinManager.init();
});