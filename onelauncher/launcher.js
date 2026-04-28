/* ============================================
   MineLacs — Launcher Page JavaScript
   Auto-fetches latest release from GitHub API
   Shows Windows (.exe) and Linux (.AppImage)
   (Theme, Mobile Menu, Year → common.js)
   ============================================ */

const GITHUB_REPO = 'OneLacs-Project/onelauncher';
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
const CACHE_KEY = 'minelacs-launcher-cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initThemeToggle();
    initMobileMenu();
    initBackToTop();
    initScrollReveal();
    setCurrentYear();
    fetchLauncherRelease();
});

/* ─────────────────────────────────────────────
   FETCH LAUNCHER RELEASE
   ───────────────────────────────────────────── */
async function fetchLauncherRelease() {
    const loadingEl = document.getElementById('launcherLoading');
    const errorEl = document.getElementById('launcherError');
    const contentEl = document.getElementById('launcherContent');
    const retryBtn = document.getElementById('launcherRetry');

    retryBtn.addEventListener('click', () => {
        errorEl.style.display = 'none';
        loadingEl.style.display = 'flex';
        fetchLauncherRelease();
    });

    // Check cache
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            renderLauncher(cached.data);
            loadingEl.style.display = 'none';
            contentEl.style.display = 'block';
            return;
        }
    } catch (e) { /* ignore */ }

    // Fetch
    try {
        const response = await fetch(API_URL, {
            headers: { 'Accept': 'application/vnd.github.v3+json' }
        });

        if (!response.ok) {
            if (response.status === 403) {
                const stale = tryStaleCache();
                if (stale) {
                    renderLauncher(stale);
                    loadingEl.style.display = 'none';
                    contentEl.style.display = 'block';
                    return;
                }
            }
            throw new Error(`HTTP ${response.status}`);
        }

        const release = await response.json();

        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: release,
        }));

        renderLauncher(release);
        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';

    } catch (err) {
        console.error('Failed to fetch launcher release:', err);

        const stale = tryStaleCache();
        if (stale) {
            renderLauncher(stale);
            loadingEl.style.display = 'none';
            contentEl.style.display = 'block';
            return;
        }

        loadingEl.style.display = 'none';
        errorEl.style.display = 'flex';
    }
}

function tryStaleCache() {
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
        return cached?.data || null;
    } catch (e) {
        return null;
    }
}

/* ─────────────────────────────────────────────
   RENDER LAUNCHER DATA
   ───────────────────────────────────────────── */
function renderLauncher(release) {
    // Version info + download count
    const date = new Date(release.published_at);
    const dateStr = date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const totalDownloads = release.assets.reduce((sum, a) => sum + a.download_count, 0);

    const versionEl = document.getElementById('launcherVersion');
    versionEl.textContent = `${release.name} · ${dateStr} · ${totalDownloads} скачиваний`;

    // Find platform-specific assets
    const assets = release.assets;
    const windowsExe = assets.find(a => a.name.endsWith('.exe') && !a.name.endsWith('.blockmap'));
    const linuxAppImage = assets.find(a => a.name.endsWith('.AppImage'));

    const container = document.getElementById('launcherButtons');
    container.innerHTML = '';

    // Windows button (primary)
    if (windowsExe) {
        const btn = createPlatformButton({
            href: windowsExe.browser_download_url,
            icon: windowsSvg(),
            label: 'Windows',
            size: formatFileSize(windowsExe.size),
            primary: true,
        });
        container.appendChild(btn);
    }

    // Linux button (secondary)
    if (linuxAppImage) {
        const btn = createPlatformButton({
            href: linuxAppImage.browser_download_url,
            icon: linuxSvg(),
            label: 'Linux',
            size: formatFileSize(linuxAppImage.size),
            primary: false,
        });
        container.appendChild(btn);
    }
}

function createPlatformButton({ href, icon, label, size, primary }) {
    const a = document.createElement('a');
    a.href = href;
    a.className = `platform-btn${primary ? '' : ' platform-btn--secondary'}`;
    a.setAttribute('download', '');
    a.setAttribute('rel', 'noopener noreferrer');
    a.innerHTML = `${icon} ${label} <span class="platform-btn__size">${size}</span>`;
    return a;
}

/* ─────────────────────────────────────────────
   PLATFORM ICONS
   ───────────────────────────────────────────── */
function windowsSvg() {
    return `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 5.548l7.065-.966v6.818H3V5.548zm0 12.904l7.065.966V12.6H3v5.852zm7.865 1.08L21 21V12.6H10.865v6.932zm0-14.064V12.4H21V3L10.865 5.468z"/></svg>`;
}

function linuxSvg() {
    return `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.5 2C10.3 2 8.5 3.8 8.5 6c0 1.4.7 2.6 1.8 3.3-.4.3-.7.7-1 1.1-.5.8-.8 1.7-.9 2.6h-.1c-1.1 0-2.2.4-3.1 1.1-.8.7-1.4 1.6-1.6 2.7-.1.5 0 1 .2 1.5.2.4.5.8.9 1 .4.3.8.4 1.3.5h.4c.3 0 .6 0 .8-.1.4-.1.8-.3 1.1-.5.3-.2.6-.5.8-.8.1-.1.1-.2.2-.3 0 .1.1.1.1.2.2.3.5.6.8.8.3.2.7.4 1.1.5.3.1.5.1.8.1h.4c.5 0 .9-.2 1.3-.5.4-.2.7-.6.9-1 .2-.5.3-1 .2-1.5-.2-1.1-.8-2-1.6-2.7-.9-.7-2-1.1-3.1-1.1h-.1c-.1-.9-.4-1.8-.9-2.6-.3-.4-.6-.8-1-1.1 1.1-.7 1.8-1.9 1.8-3.3 0-2.2-1.8-4-4-4zm-2.3 4c0-1.3 1-2.3 2.3-2.3s2.3 1 2.3 2.3-1 2.3-2.3 2.3-2.3-1-2.3-2.3zm5.7 10.7c.1.3 0 .5-.1.7-.1.2-.3.3-.5.5-.2.1-.5.2-.7.2h-.2c-.2 0-.4 0-.5-.1-.3-.1-.5-.2-.7-.4-.2-.2-.4-.4-.5-.6l-.2-.4-.6 1c-.2.3-.4.5-.7.6-.3.2-.5.3-.8.3h-.2c-.3 0-.5-.1-.7-.2-.2-.2-.4-.3-.5-.5-.1-.2-.2-.4-.1-.7.1-.7.5-1.3 1.1-1.8.6-.5 1.3-.7 2-.7s1.5.2 2 .7c.7.5 1.1 1.1 1.2 1.8z"/></svg>`;
}

/* ─────────────────────────────────────────────
   UTILITIES
   ───────────────────────────────────────────── */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' ГБ';
}
