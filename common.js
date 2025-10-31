// common.js - общие функции для всех страниц MineLacs
const MineLacsCommon = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    validateConfig() {
        if (typeof CONFIG === 'undefined') {
            console.error('CONFIG не загружен!');
            return false;
        }
        const required = ['downloads', 'social', 'server', 'version'];
        for (const key of required) {
            if (!CONFIG[key]) {
                console.error(`CONFIG.${key} отсутствует!`);
                return false;
            }
        }
        return true;
    },

    getCachedServerStatus() {
        const cached = localStorage.getItem('serverStatus');
        if (!cached) return null;
        
        const data = JSON.parse(cached);
        const now = Date.now();
        if (now - data.timestamp > 60000) return null;
        
        return data.status;
    },

    setCachedServerStatus(status) {
        localStorage.setItem('serverStatus', JSON.stringify({
            status: status,
            timestamp: Date.now()
        }));
    },
    initTheme() {
        const html = document.documentElement;
        const themeToggle = document.getElementById('theme-toggle-checkbox');
        if (!themeToggle) return;

        const applyTheme = (theme) => {
            html.setAttribute('data-theme', theme);
            themeToggle.checked = theme === 'light';
        };

        const savedTheme = localStorage.getItem('theme') || 'dark';
        applyTheme(savedTheme);

        themeToggle.addEventListener('change', () => {
            const newTheme = themeToggle.checked ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    },

    initPreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            window.addEventListener('load', () => {
                setTimeout(() => preloader.classList.add('hidden'), 500);
            });
        }
    },

    initParallax() {
        const blob1 = document.querySelector('.blob1');
        const blob2 = document.querySelector('.blob2');
        
        if (blob1 && blob2) {
            const handleParallax = this.throttle(() => {
                const scrolled = window.scrollY;
                blob1.style.transform = `translate(${scrolled * 0.05}px, ${scrolled * 0.1}px) scale(${1 + scrolled * 0.0001})`;
                blob2.style.transform = `translate(${-scrolled * 0.03}px, ${-scrolled * 0.08}px) scale(${1 - scrolled * 0.00005})`;
            }, 16);
            
            window.addEventListener('scroll', handleParallax, { passive: true });
        }
    },

    initYear() {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    },

    initScrollToTop() {
        const scrollToTopBtn = document.getElementById('scroll-to-top');
        if (!scrollToTopBtn) return;

        const handleScroll = this.throttle(() => {
            scrollToTopBtn.classList.toggle('visible', window.scrollY > 500);
        }, 100);

        window.addEventListener('scroll', handleScroll, { passive: true });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },

    initRevealAnimations() {
        const revealElements = document.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        revealElements.forEach(el => revealObserver.observe(el));
    },

    initHeaderScroll() {
        const header = document.getElementById('main-header');
        const heroSection = document.getElementById('hero');
        const betaBanner = document.querySelector('.beta-banner');

        if (heroSection && header) {
            const headerObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) {
                        header.classList.add('scrolled');
                        if (betaBanner) betaBanner.classList.add('hidden');
                    } else {
                        header.classList.remove('scrolled');
                        if (betaBanner) betaBanner.classList.remove('hidden');
                    }
                });
            }, { threshold: 0.3 });
            
            headerObserver.observe(heroSection);
        }
    },

    initSectionTitleTyping() {
        const sectionTitles = document.querySelectorAll('.section-title');
        const titleObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('typing');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        sectionTitles.forEach(title => titleObserver.observe(title));
    },

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'copy-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    },

    init() {
        this.validateConfig();
        this.initYear();
        this.initPreloader();
        this.initTheme();
        this.initParallax();
        this.initScrollToTop();
        this.initRevealAnimations();
        this.initHeaderScroll();
        this.initSectionTitleTyping();
    }
};
