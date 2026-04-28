document.addEventListener('DOMContentLoaded', () => {
    // Инициализация общих функций
    MineLacsCommon.init();

    // FAQ аккордеон
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (question && answer) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        if (otherAnswer) otherAnswer.style.maxHeight = null;
                    }
                });

                if (isActive) {
                    item.classList.remove('active');
                    answer.style.maxHeight = null;
                } else {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        }
    });

    // Проверка ОС
    const downloadBtn = document.getElementById('download-btn');
    const btnMainText = document.getElementById('btn-main-text');
    const userOS = navigator.platform.toLowerCase();
    const isWindows = userOS.includes('win');

    // Обработка чекбокса и кнопки скачивания
    const acceptRiskCheckbox = document.getElementById('accept-risk');
    
    if (downloadBtn && MineLacsCommon.validateConfig()) {
        const isAvailable = CONFIG.downloads.onelauncherAvailable;
        
        // Изначально кнопка заблокирована
        downloadBtn.classList.add('disabled');
        downloadBtn.removeAttribute('href');
        
        if (!isAvailable) {
            if (btnMainText) btnMainText.textContent = 'Временно недоступно';
            if (acceptRiskCheckbox) acceptRiskCheckbox.disabled = true;
        } else if (!isWindows) {
            if (btnMainText) btnMainText.textContent = 'Только для Windows';
            if (acceptRiskCheckbox) acceptRiskCheckbox.disabled = true;
        } else {
            // Логика чекбокса
            if (acceptRiskCheckbox) {
                acceptRiskCheckbox.addEventListener('change', () => {
                    if (acceptRiskCheckbox.checked) {
                        downloadBtn.classList.remove('disabled');
                        downloadBtn.href = CONFIG.downloads.onelauncher;
                    } else {
                        downloadBtn.classList.add('disabled');
                        downloadBtn.removeAttribute('href');
                    }
                });
            }
            
            downloadBtn.addEventListener('click', (e) => {
                if (!acceptRiskCheckbox || !acceptRiskCheckbox.checked) {
                    e.preventDefault();
                    return;
                }
                downloadBtn.classList.add('loading');
                setTimeout(() => downloadBtn.classList.remove('loading'), 2000);
            });
        }
    }



    // Раскрытие длинного отзыва
    const expandableReviews = document.querySelectorAll('.expandable-review');
    expandableReviews.forEach(review => {
        const readMore = review.querySelector('.review-read-more');
        if (readMore) {
            readMore.addEventListener('click', () => {
                review.classList.add('expanded');
            });
        }
    });



});
