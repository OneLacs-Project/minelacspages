/* ============================================
   MineLacs — Main Page JavaScript
   Page-specific: Header, Parallax, Reveal,
   FAQ, Smooth Scroll, SkinView3D
   (Theme, Mobile Menu, Year → common.js)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initThemeToggle();
    initHeaderScroll();
    initHeroParallax();
    initMobileMenu();
    initScrollReveal();
    initFAQ();
    initSmoothScroll();
    initBackToTop();
    setCurrentYear();
    SkinManager.init();
});

/* ─────────────────────────────────────────────
   HEADER SCROLL BEHAVIOR
   When hero is visible → transparent header
   When scrolled past → solid header with logo
   ───────────────────────────────────────────── */
function initHeaderScroll() {
    const header = document.getElementById('header');
    const hero = document.getElementById('hero');

    if (!header || !hero) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    header.classList.remove('header--scrolled');
                } else {
                    header.classList.add('header--scrolled');
                }
            });
        },
        { threshold: 0.15 }
    );

    observer.observe(hero);
}

/* ─────────────────────────────────────────────
   HERO PARALLAX
   Scroll-linked parallax for hero elements
   Uses requestAnimationFrame for smooth perf
   ───────────────────────────────────────────── */
function initHeroParallax() {
    const heroLogo = document.querySelector('.hero__logo');
    const heroSlogan = document.querySelector('.hero__slogan');
    const heroBtn = document.querySelector('.hero__btn');
    const heroGlow = document.querySelector('.hero__glow');
    const hero = document.getElementById('hero');

    if (!heroLogo || !hero) return;

    let ticking = false;

    function updateParallax() {
        const scrollY = window.scrollY;
        const heroHeight = hero.offsetHeight;

        if (scrollY <= heroHeight) {
            const progress = scrollY / heroHeight;

            heroLogo.style.transform = `translateY(${scrollY * 0.12}px) scale(${1 - progress * 0.1})`;
            heroLogo.style.opacity = 1 - progress * 0.9;

            if (heroSlogan) {
                heroSlogan.style.transform = `translateY(${scrollY * 0.25}px)`;
                heroSlogan.style.opacity = 1 - progress * 0.95;
            }

            if (heroBtn) {
                heroBtn.style.transform = `translateY(${scrollY * 0.38}px)`;
                heroBtn.style.opacity = 1 - progress;
            }

            if (heroGlow) {
                heroGlow.style.transform = `translate(-50%, -50%) scale(${1 + progress * 0.4})`;
                heroGlow.style.opacity = 1 - progress * 0.7;
            }
        }

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
}


/* ─────────────────────────────────────────────
   FAQ ACCORDION
   ───────────────────────────────────────────── */
function initFAQ() {
    const items = document.querySelectorAll('.faq-item');

    items.forEach((item) => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('faq-item--open');

            // Close all other items
            items.forEach((other) => {
                if (other !== item) {
                    other.classList.remove('faq-item--open');
                    other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current item
            item.classList.toggle('faq-item--open');
            question.setAttribute('aria-expanded', !isOpen);
        });
    });
}

/* ─────────────────────────────────────────────
   SMOOTH SCROLL (for nav links)
   ───────────────────────────────────────────── */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

/* ─────────────────────────────────────────────
   SKINVIEW3D — 3D Minecraft skins
   Encapsulated module with fallback sources,
   tier-aware sizing, and cleanup on unload
   ───────────────────────────────────────────── */
const SkinManager = (() => {
    let retries = 0;
    const MAX_RETRIES = 20;
    const viewers = [];

    /** Determine canvas dimensions based on team tier */
    function getTierDimensions(card) {
        const tier = card.closest('.team-tier');
        if (tier?.classList.contains('team-tier--mod')) return { width: 150, height: 220 };
        if (tier?.classList.contains('team-tier--beta')) return { width: 120, height: 180 };
        return { width: 180, height: 260 };
    }

    /** Try loading skin from multiple sources with cascading fallback */
    async function loadSkinWithFallback(viewer, sources) {
        for (let i = 0; i < sources.length; i++) {
            try {
                await viewer.loadSkin(sources[i]);
                return; // Success
            } catch (err) {
                console.warn(`Skin source ${i + 1}/${sources.length} failed, trying next...`);
            }
        }
        throw new Error('All skin sources exhausted');
    }

    /** Show emoji fallback when skin can't load */
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

    /** Show fallback for all cards using correct tier dimensions */
    function showFallbackAll() {
        document.querySelectorAll('.team-card[data-nickname]').forEach((card) => {
            const { width, height } = getTierDimensions(card);
            showFallback(card, width, height);
        });
    }

    /** Initialize skin viewers for all team cards */
    function init() {
        // Wait for skinview3d to be available
        if (typeof skinview3d === 'undefined') {
            retries++;
            if (retries < MAX_RETRIES) {
                setTimeout(init, 500);
            } else {
                console.warn('skinview3d library failed to load after retries.');
                showFallbackAll();
            }
            return;
        }

        const teamCards = document.querySelectorAll('.team-card[data-nickname]');

        teamCards.forEach((card) => {
            const nickname = card.dataset.nickname;
            const canvas = card.querySelector('.team-card__canvas');
            if (!canvas) return;

            const { width, height } = getTierDimensions(card);

            // Multiple CORS-friendly skin sources for fallback
            const skinSources = [
                `https://minotar.net/skin/${nickname}`,
                `https://mc-heads.net/skin/${nickname}`,
            ];

            try {
                const viewer = new skinview3d.SkinViewer({
                    canvas: canvas,
                    width: width,
                    height: height,
                });

                // Transparent background
                viewer.renderer.setClearColor(0x000000, 0);

                // Camera settings
                viewer.fov = 30;
                viewer.zoom = 0.92;

                // Auto rotation
                viewer.autoRotate = true;
                viewer.autoRotateSpeed = 0.5;

                // Controls
                viewer.controls.enableRotate = true;
                viewer.controls.enableZoom = false;
                viewer.controls.enablePan = false;

                // Animation
                viewer.animation = new skinview3d.WalkingAnimation();
                viewer.animation.speed = 0.3;

                // Track viewer for cleanup
                viewers.push(viewer);
                card._viewer = viewer;

                // Load skin with cascading fallback through sources
                loadSkinWithFallback(viewer, skinSources).catch(() => {
                    showFallback(card, width, height);
                });

            } catch (err) {
                console.warn(`Failed to init viewer for ${nickname}:`, err);
                showFallback(card, width, height);
            }
        });
    }

    /** Dispose all viewers to free WebGL resources */
    function dispose() {
        viewers.forEach((viewer) => {
            try { viewer.dispose(); } catch (e) { /* ignore */ }
        });
        viewers.length = 0;
    }

    // Cleanup on page unload to prevent memory leaks
    window.addEventListener('beforeunload', dispose);

    // Pause/resume rendering when tab is hidden/visible
    document.addEventListener('visibilitychange', () => {
        const paused = document.visibilityState === 'hidden';
        viewers.forEach((v) => {
            try { v.renderPaused = paused; } catch (e) { /* ignore */ }
        });
    });

    return { init, dispose };
})();
