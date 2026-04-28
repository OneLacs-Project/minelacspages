document.addEventListener('DOMContentLoaded', () => {
    // Инициализация общих функций
    MineLacsCommon.init();

    // --------------- 0. Загрузка данных из конфига ---------------
    if (typeof CONFIG !== 'undefined') {
        // Информация о сезоне
        const seasonLogo = document.getElementById('season-logo');
        const seasonName = document.getElementById('season-name');
        const seasonDescription = document.getElementById('season-description');
        
        if (seasonLogo && CONFIG.season) {
            seasonLogo.src = CONFIG.season.logo;
            seasonLogo.alt = CONFIG.season.name;
        }
        if (seasonName && CONFIG.season) {
            seasonName.textContent = CONFIG.season.name;
        }
        if (seasonDescription && CONFIG.season) {
            seasonDescription.textContent = CONFIG.season.description;
        }
        
        // Ссылки на скачивание
        const downloadZip = document.getElementById('download-zip');
        const downloadMrpack = document.getElementById('download-mrpack');
        const mirrorZip = document.getElementById('mirror-zip');
        const mirrorMrpack = document.getElementById('mirror-mrpack');
        
        if (downloadZip && CONFIG.downloads.modpack.zip) {
            downloadZip.href = CONFIG.downloads.modpack.zip;
        }
        if (downloadMrpack && CONFIG.downloads.modpack.mrpack) {
            downloadMrpack.href = CONFIG.downloads.modpack.mrpack;
        }
        if (mirrorZip && CONFIG.downloads.mirrors.zip) {
            mirrorZip.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = CONFIG.downloads.mirrors.zip;
            });
        }
        if (mirrorMrpack && CONFIG.downloads.mirrors.mrpack) {
            mirrorMrpack.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = CONFIG.downloads.mirrors.mrpack;
            });
        }
        
        // Размеры файлов
        const zipSize = document.getElementById('zip-size');
        const mrpackSize = document.getElementById('mrpack-size');
        
        if (zipSize && CONFIG.fileSize) {
            zipSize.textContent = `Размер: ${CONFIG.fileSize.zip}`;
        }
        if (mrpackSize && CONFIG.fileSize) {
            mrpackSize.textContent = `Размер: ${CONFIG.fileSize.mrpack}`;
        }
    }

    // --------------- 1. Проверка статуса сервера ---------------
    const serverOnline = document.getElementById('server-online');
    const statusDot = document.querySelector('.status-dot');
    
    if (serverOnline && statusDot) {
        const cached = MineLacsCommon.getCachedServerStatus();
        
        if (cached) {
            serverOnline.textContent = cached.text;
            serverOnline.classList.remove('skeleton-text');
            statusDot.classList.remove('skeleton');
            if (!cached.online) statusDot.classList.add('offline');
        }
        
        fetch('https://api.mcsrvstat.us/3/go.minelacs.fun')
            .then(response => {
                if (!response.ok) throw new Error('API error');
                return response.json();
            })
            .then(data => {
                let statusText, isOnline;
                
                if (data.online) {
                    const online = data.players.online || 0;
                    const max = data.players.max || 0;
                    statusText = `(${online}/${max})`;
                    isOnline = true;
                    statusDot.classList.remove('offline');
                } else {
                    statusText = '(Offline)';
                    isOnline = false;
                    statusDot.classList.add('offline');
                }
                
                serverOnline.textContent = statusText;
                serverOnline.classList.remove('skeleton-text');
                statusDot.classList.remove('skeleton');
                MineLacsCommon.setCachedServerStatus({ text: statusText, online: isOnline });
            })
            .catch(() => {
                serverOnline.textContent = '(?)';
                serverOnline.classList.remove('skeleton-text');
                statusDot.classList.remove('skeleton');
                statusDot.classList.add('offline');
            });
    }

    // --------------- 2. Копирование IP ---------------
    const ipCopyBtn = document.querySelector('.ip-copy-btn');
    if (ipCopyBtn) {
        ipCopyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('go.minelacs.fun').then(() => {
                MineLacsCommon.showNotification('IP скопирован!');
            });
        });
    }

    // --------------- 3. Раскрытие инструкции ---------------
    const instructionToggle = document.querySelector('.instruction-toggle');
    const instructionCard = document.querySelector('.instruction-card');
    
    if (instructionToggle && instructionCard) {
        instructionToggle.addEventListener('click', () => {
            instructionCard.classList.toggle('active');
        });
    }

    // --------------- 4. Анимация загрузки для кнопок скачивания ---------------
    const downloadCards = document.querySelectorAll('.download-card');
    downloadCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.add('loading');
            setTimeout(() => card.classList.remove('loading'), 2000);
        });
    });

});
