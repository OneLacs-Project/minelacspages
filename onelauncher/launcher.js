const GITHUB_REPO     = 'OneLacs-Project/onelauncher';
const API_URL         = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
const CACHE_KEY       = 'minelacs-launcher-cache';
const CACHE_TTL       = 600_000; // 10 minutes
const DOWNLOAD_DISABLED = false;

async function fetchLauncherRelease() {
    const elLoading = document.getElementById('launcherLoading');
    const elError   = document.getElementById('launcherError');
    const elContent = document.getElementById('launcherContent');

    document.getElementById('launcherRetry').addEventListener('click', () => {
        elError.style.display   = 'none';
        elLoading.style.display = 'flex';
        fetchLauncherRelease();
    });

    // Try fresh cache
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            renderLauncher(cached.data);
            elLoading.style.display = 'none';
            elContent.style.display = 'block';
            return;
        }
    } catch (_) {}

    // Fetch from GitHub API
    try {
        const res = await fetch(API_URL, { headers: { Accept: 'application/vnd.github.v3+json' } });
        if (!res.ok) {
            if (res.status === 403) {
                const stale = tryStaleCache();
                if (stale) {
                    renderLauncher(stale);
                    elLoading.style.display = 'none';
                    elContent.style.display = 'block';
                    return;
                }
            }
            throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
        renderLauncher(data);
        elLoading.style.display = 'none';
        elContent.style.display = 'block';
    } catch (err) {
        console.error('Failed to fetch launcher release:', err);
        const stale = tryStaleCache();
        if (stale) {
            renderLauncher(stale);
            elLoading.style.display = 'none';
            elContent.style.display = 'block';
            return;
        }
        elLoading.style.display = 'none';
        elError.style.display   = 'flex';
    }
}

function tryStaleCache() {
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
        return cached?.data || null;
    } catch (_) {
        return null;
    }
}

function renderLauncher(data) {
    const date = new Date(data.published_at).toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
    const totalDownloads = data.assets.reduce((sum, a) => sum + a.download_count, 0);
    document.getElementById('launcherVersion').textContent =
        `${data.name} · ${date} · ${totalDownloads} скачиваний`;

    const assets   = data.assets;
    const exeAsset = assets.find(a => a.name.endsWith('.exe') && !a.name.endsWith('.blockmap'));
    const debAsset = assets.find(a => a.name.endsWith('.deb'));
    const appImage = assets.find(a => a.name.endsWith('.AppImage'));

    const container = document.getElementById('launcherButtons');
    container.innerHTML = '';

    if (exeAsset) {
        container.appendChild(createPlatformBtn({
            href:    exeAsset.browser_download_url,
            icon:    windowsSvg(),
            label:   'Windows',
            size:    `.exe · ${formatSize(exeAsset.size)}`,
            primary: true,
        }));
    }

    if (debAsset || appImage) {
        const dropdown = document.createElement('div');
        dropdown.className = 'platform-dropdown';

        const trigger = document.createElement('button');
        trigger.className = 'platform-btn platform-btn--secondary';
        trigger.innerHTML = `
            ${linuxSvg()}
            Linux
            <svg class="btn-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        `;
        dropdown.appendChild(trigger);

        const menuEl = document.createElement('div');
        menuEl.className = 'platform-dropdown__menu';

        if (debAsset)  menuEl.appendChild(createLinuxItem(debAsset,  '.deb',      'Ubuntu/Debian'));
        if (appImage)  menuEl.appendChild(createLinuxItem(appImage,  '.AppImage', 'Портативный'));

        dropdown.appendChild(menuEl);
        container.appendChild(dropdown);
    }
}

function createPlatformBtn({ href, icon, label, size, primary }) {
    const a = document.createElement('a');
    a.href      = href;
    a.className = 'platform-btn' + (primary ? '' : ' platform-btn--secondary');
    a.setAttribute('download', '');
    a.setAttribute('rel', 'noopener noreferrer');
    a.innerHTML = `${icon} ${label} <span class="platform-btn__size">${size}</span>`;
    return a;
}

function createLinuxItem(asset, ext, label) {
    const a = document.createElement('a');
    a.href      = asset.browser_download_url;
    a.className = 'platform-dropdown__item';
    a.setAttribute('download', '');
    a.setAttribute('rel', 'noopener noreferrer');
    a.innerHTML = `
        <span class="platform-dropdown__item-title">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="dropdown-item-icon">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            ${ext} (${label})
        </span>
        <span class="platform-dropdown__item-size">${formatSize(asset.size)}</span>
    `;
    return a;
}

function windowsSvg() {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 5.548l7.065-.966v6.818H3V5.548zm0 12.904l7.065.966V12.6H3v5.852zm7.865 1.08L21 21V12.6H10.865v6.932zm0-14.064V12.4H21V3L10.865 5.468z"/></svg>';
}

function linuxSvg() {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.5 2C10.3 2 8.5 3.8 8.5 6c0 1.4.7 2.6 1.8 3.3-.4.3-.7.7-1 1.1-.5.8-.8 1.7-.9 2.6h-.1c-1.1 0-2.2.4-3.1 1.1-.8.7-1.4 1.6-1.6 2.7-.1.5 0 1 .2 1.5.2.4.5.8.9 1 .4.3.8.4 1.3.5h.4c.3 0 .6 0 .8-.1.4-.1.8-.3 1.1-.5.3-.2.6-.5.8-.8.1-.1.1-.2.2-.3 0 .1.1.1.1.2.2.3.5.6.8.8.3.2.7.4 1.1.5.3.1.5.1.8.1h.4c.5 0 .9-.2 1.3-.5.4-.2.7-.6.9-1 .2-.5.3-1 .2-1.5-.2-1.1-.8-2-1.6-2.7-.9-.7-2-1.1-3.1-1.1h-.1c-.1-.9-.4-1.8-.9-2.6-.3-.4-.6-.8-1-1.1 1.1-.7 1.8-1.9 1.8-3.3 0-2.2-1.8-4-4-4zm-2.3 4c0-1.3 1-2.3 2.3-2.3s2.3 1 2.3 2.3-1 2.3-2.3 2.3-2.3-1-2.3-2.3zm5.7 10.7c.1.3 0 .5-.1.7-.1.2-.3.3-.5.5-.2.1-.5.2-.7.2h-.2c-.2 0-.4 0-.5-.1-.3-.1-.5-.2-.7-.4-.2-.2-.4-.4-.5-.6l-.2-.4-.6 1c-.2.3-.4.5-.7.6-.3.2-.5.3-.8.3h-.2c-.3 0-.5-.1-.7-.2-.2-.2-.4-.3-.5-.5-.1-.2-.2-.4-.1-.7.1-.7.5-1.3 1.1-1.8.6-.5 1.3-.7 2-.7s1.5.2 2 .7c.7.5 1.1 1.1 1.2 1.8z"/></svg>';
}

function formatSize(bytes) {
    if (bytes < 1024)       return bytes + ' Б';
    if (bytes < 1048576)    return (bytes / 1024).toFixed(1) + ' КБ';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' МБ';
    return (bytes / 1073741824).toFixed(2) + ' ГБ';
}

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initThemeToggle();
    initMobileMenu();
    initBackToTop();
    initScrollReveal();
    setCurrentYear();
    initMarquee();
    fetchLauncherRelease();
});