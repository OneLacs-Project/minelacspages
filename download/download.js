const GITHUB_REPO = 'OneLacs-Project/minelacspages';
const API_URL     = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
const CACHE_KEY   = 'minelacs-release-cache';
const CACHE_TTL   = 600_000; // 10 minutes

async function fetchRelease() {
    const elLoading = document.getElementById('releaseLoading');
    const elError   = document.getElementById('releaseError');
    const elContent = document.getElementById('releaseContent');

    document.getElementById('retryBtn').addEventListener('click', () => {
        elError.style.display   = 'none';
        elLoading.style.display = 'flex';
        fetchRelease();
    });

    // Try fresh cache
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            renderRelease(cached.data);
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
                    renderRelease(stale);
                    elLoading.style.display = 'none';
                    elContent.style.display = 'block';
                    return;
                }
            }
            throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
        renderRelease(data);
        elLoading.style.display = 'none';
        elContent.style.display = 'block';
    } catch (err) {
        console.error('Failed to fetch release:', err);
        const stale = tryStaleCache();
        if (stale) {
            renderRelease(stale);
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

function renderRelease(data) {
    document.getElementById('releaseName').textContent = data.name || data.tag_name;

    const date = new Date(data.published_at);
    document.getElementById('releaseDateText').textContent =
        date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

    const totalDownloads = data.assets.reduce((sum, a) => sum + a.download_count, 0);
    document.getElementById('releaseDownloadsText').textContent = `${totalDownloads} скачиваний`;

    const container = document.getElementById('releaseDownloadBtns');
    container.innerHTML = '';

    const order = { '.zip': 0, '.mrpack': 1 };
    [...data.assets]
        .sort((a, b) => (order[getExt(a.name)] ?? 2) - (order[getExt(b.name)] ?? 2))
        .forEach(asset => container.appendChild(createDownloadBtn(asset, getExt(asset.name))));
}

function createDownloadBtn(asset, ext) {
    const a = document.createElement('a');
    a.href      = asset.browser_download_url;
    a.className = 'download-btn';
    a.setAttribute('download', '');
    a.setAttribute('rel', 'noopener noreferrer');

    const iconClass = {
        '.zip':    'download-btn__icon--zip',
        '.mrpack': 'download-btn__icon--mrpack',
    }[ext] || 'download-btn__icon--generic';

    const label = {
        '.zip':    'ZIP - Ручная установка',
        '.mrpack': 'MRPACK - Modrinth / Prism',
    }[ext] || 'Скачать';

    a.innerHTML = `
        <div class="download-btn__icon ${iconClass}">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
        </div>
        <div class="download-btn__info">
            <div class="download-btn__name">
                ${asset.name}
                <span class="download-btn__format">${ext.replace('.', '')}</span>
            </div>
            <div class="download-btn__meta">${formatSize(asset.size)} &middot; ${asset.download_count} скачиваний &middot; ${label}</div>
        </div>
    `;
    return a;
}

function getExt(name) {
    const m = name.match(/(\.[\w]+)$/);
    return m ? m[1].toLowerCase() : '';
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
    fetchRelease();
});