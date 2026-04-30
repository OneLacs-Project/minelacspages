/* ============================================
   MineLacs — Download Page JavaScript
   Auto-fetches latest release from GitHub API
   (Theme, Mobile Menu, Year → common.js)
   ============================================ */

const GITHUB_REPO = 'OneLacs-Project/minelacspages';
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initThemeToggle();
    initMobileMenu();
    initBackToTop();
    initScrollReveal();
    setCurrentYear();
    fetchRelease();
});

/* ─────────────────────────────────────────────
   FETCH LATEST RELEASE FROM GITHUB
   ───────────────────────────────────────────── */
async function fetchRelease() {
    const loadingEl = document.getElementById('releaseLoading');
    const errorEl = document.getElementById('releaseError');
    const contentEl = document.getElementById('releaseContent');
    const retryBtn = document.getElementById('retryBtn');

    const CACHE_KEY = 'minelacs-release-cache';
    const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

    retryBtn.addEventListener('click', () => {
        errorEl.style.display = 'none';
        loadingEl.style.display = 'flex';
        fetchRelease();
    });

    // Check cache first
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            renderRelease(cached.data);
            loadingEl.style.display = 'none';
            contentEl.style.display = 'block';
            return;
        }
    } catch (e) { /* invalid cache, ignore */ }

    // Fetch from GitHub API
    try {
        const response = await fetch(API_URL, {
            headers: { 'Accept': 'application/vnd.github.v3+json' }
        });

        if (!response.ok) {
            // On rate-limit (403), try to use stale cache
            if (response.status === 403) {
                const stale = tryStaleCache(CACHE_KEY);
                if (stale) {
                    renderRelease(stale);
                    loadingEl.style.display = 'none';
                    contentEl.style.display = 'block';
                    return;
                }
            }
            throw new Error(`HTTP ${response.status}`);
        }

        const release = await response.json();

        // Save to cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: release,
        }));

        renderRelease(release);
        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';

    } catch (err) {
        console.error('Failed to fetch release:', err);

        // Last resort: try stale cache regardless of TTL
        const stale = tryStaleCache(CACHE_KEY);
        if (stale) {
            renderRelease(stale);
            loadingEl.style.display = 'none';
            contentEl.style.display = 'block';
            return;
        }

        loadingEl.style.display = 'none';
        errorEl.style.display = 'flex';
    }
}

/** Try to load cached data regardless of TTL */
function tryStaleCache(key) {
    try {
        const cached = JSON.parse(localStorage.getItem(key));
        return cached?.data || null;
    } catch (e) {
        return null;
    }
}

/* ─────────────────────────────────────────────
   RENDER RELEASE DATA
   ───────────────────────────────────────────── */
function renderRelease(release) {
    // Name
    document.getElementById('releaseName').textContent = release.name || release.tag_name;

    // Date
    const date = new Date(release.published_at);
    document.getElementById('releaseDateText').textContent = date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    // Total downloads
    const totalDownloads = release.assets.reduce((sum, a) => sum + a.download_count, 0);
    document.getElementById('releaseDownloadsText').textContent = `${totalDownloads} скачиваний`;

    // Download buttons
    const container = document.getElementById('releaseDownloadBtns');
    container.innerHTML = '';

    // Sort: .zip first, then .mrpack, then others
    const sortedAssets = [...release.assets].sort((a, b) => {
        const order = { '.zip': 0, '.mrpack': 1 };
        const extA = getExtension(a.name);
        const extB = getExtension(b.name);
        return (order[extA] ?? 2) - (order[extB] ?? 2);
    });

    sortedAssets.forEach((asset) => {
        const ext = getExtension(asset.name);
        const btn = createDownloadButton(asset, ext);
        container.appendChild(btn);
    });
}

/* ─────────────────────────────────────────────
   CREATE DOWNLOAD BUTTON ELEMENT
   ───────────────────────────────────────────── */
function createDownloadButton(asset, ext) {
    const link = document.createElement('a');
    link.href = asset.browser_download_url;
    link.className = 'download-btn';
    link.setAttribute('download', '');
    link.setAttribute('rel', 'noopener noreferrer');

    // Icon class
    let iconClass = 'download-btn__icon--generic';
    if (ext === '.zip') iconClass = 'download-btn__icon--zip';
    else if (ext === '.mrpack') iconClass = 'download-btn__icon--mrpack';

    // Format label
    const formatLabels = {
        '.zip': 'ZIP — Ручная установка',
        '.mrpack': 'MRPACK — Modrinth / Prism',
    };

    const sizeStr = formatFileSize(asset.size);
    const downloadsStr = asset.download_count;

    link.innerHTML = `
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
            <div class="download-btn__meta">${sizeStr} · ${downloadsStr} скачиваний · ${formatLabels[ext] || 'Скачать'}</div>
        </div>
    `;

    return link;
}

/* ─────────────────────────────────────────────
   UTILITIES
   ───────────────────────────────────────────── */
function getExtension(filename) {
    const match = filename.match(/(\.\w+)$/);
    return match ? match[1].toLowerCase() : '';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' ГБ';
}
