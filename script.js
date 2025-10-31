document.addEventListener('DOMContentLoaded', () => {
    // Инициализация общих функций
    MineLacsCommon.init();

    // --------------- 4. Типизированная анимация текста ---------------
    const typingSpan = document.getElementById('typing-span');
    if(typingSpan) {
        const words = ["один!", "уникальный!", "крутой!"];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function type() {
            const currentWord = words[wordIndex];
            
            if (isDeleting) {
                typingSpan.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingSpan.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }

            if (!isDeleting && charIndex === currentWord.length) {
                isDeleting = true;
                setTimeout(type, 2000);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                setTimeout(type, 500);
            } else {
                const typingSpeed = isDeleting ? 75 : 150;
                setTimeout(type, typingSpeed);
            }
        }
        type();
    }
    
    // --------------- 5. 3D эффект для карточек ---------------
    const interactiveCards = document.querySelectorAll('.feature-card, .dev-card, .link-block');
    
    interactiveCards.forEach(card => {
        const cardInner = card.querySelector('.feature-card-inner') || card.querySelector('.dev-card-inner') || card;
        
        if (cardInner) {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                const rotateX = -y / 25; 
                const rotateY = x / 25;
                
                cardInner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                cardInner.style.transform = `rotateX(0deg) rotateY(0deg)`;
            });
        }
    });

    // --------------- 6. Логика для FAQ-аккордеона ---------------
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').style.maxHeight = null;
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
    });

    // --------------- 7. Мобильное меню ---------------
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
        mainNav.querySelectorAll('a').forEach(link => {
            if (!link.parentElement.classList.contains('dropdown')) {
                link.addEventListener('click', () => {
                    if (mainNav.classList.contains('active')) {
                        mainNav.classList.remove('active');
                    }
                });
            }
        });
    }

    // --------------- 7.5. Копирование IP в hero ---------------
    const heroCopyBtn = document.getElementById('hero-copy-ip');
    if (heroCopyBtn) {
        heroCopyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('go.minelacs.fun').then(() => {
                MineLacsCommon.showNotification('IP скопирован!');
            });
        });
    }

    // --------------- 8. Логика пасхалки "2048" ---------------
    const footerLogo = document.querySelector('.footer-logo-img');
    const modal = document.getElementById('game-2048-modal');
    const closeBtn = document.querySelector('.modal-close');
    let clickCount = 0;
    let clickTimer = null;

    if (footerLogo && modal) {
        footerLogo.addEventListener('click', () => {
            clearTimeout(clickTimer);
            clickCount++;

            if (clickCount === 5) {
                modal.classList.remove('hidden');
                setTimeout(() => modal.classList.add('visible'), 10);
                initGame();
                clickCount = 0;
            }

            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 2000);
        });
    }

    const boardElement = document.getElementById('game-board-2048');
    const scoreElement = document.getElementById('score');
    const bestScoreElement = document.getElementById('best-score');
    const resetButton = document.getElementById('reset-button-2048');

    let board = [];
    let score = 0;
    let bestScore = localStorage.getItem('2048-best') || 0;

    function initGame() {
        board = Array(4).fill().map(() => Array(4).fill(0));
        score = 0;
        bestScore = localStorage.getItem('2048-best') || 0;
        updateScore();
        addRandomTile();
        addRandomTile();
        renderBoard();
    }

    function addRandomTile() {
        const empty = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (board[i][j] === 0) empty.push({i, j});
            }
        }
        if (empty.length > 0) {
            const {i, j} = empty[Math.floor(Math.random() * empty.length)];
            board[i][j] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    function renderBoard() {
        boardElement.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                const value = board[i][j];
                if (value > 0) {
                    tile.textContent = value;
                    tile.setAttribute('data-value', value);
                }
                boardElement.appendChild(tile);
            }
        }
    }

    function updateScore() {
        scoreElement.textContent = score;
        bestScoreElement.textContent = bestScore;
    }

    function move(direction) {
        let moved = false;
        const newBoard = board.map(row => [...row]);

        if (direction === 'left' || direction === 'right') {
            for (let i = 0; i < 4; i++) {
                let row = newBoard[i].filter(val => val !== 0);
                if (direction === 'right') row.reverse();
                
                for (let j = 0; j < row.length - 1; j++) {
                    if (row[j] === row[j + 1]) {
                        row[j] *= 2;
                        score += row[j];
                        row.splice(j + 1, 1);
                    }
                }
                
                while (row.length < 4) row.push(0);
                if (direction === 'right') row.reverse();
                
                if (JSON.stringify(newBoard[i]) !== JSON.stringify(row)) moved = true;
                newBoard[i] = row;
            }
        } else {
            for (let j = 0; j < 4; j++) {
                let col = [];
                for (let i = 0; i < 4; i++) col.push(newBoard[i][j]);
                col = col.filter(val => val !== 0);
                if (direction === 'down') col.reverse();
                
                for (let i = 0; i < col.length - 1; i++) {
                    if (col[i] === col[i + 1]) {
                        col[i] *= 2;
                        score += col[i];
                        col.splice(i + 1, 1);
                    }
                }
                
                while (col.length < 4) col.push(0);
                if (direction === 'down') col.reverse();
                
                for (let i = 0; i < 4; i++) {
                    if (newBoard[i][j] !== col[i]) moved = true;
                    newBoard[i][j] = col[i];
                }
            }
        }

        if (moved) {
            board = newBoard;
            addRandomTile();
            updateScore();
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem('2048-best', bestScore);
            }
            renderBoard();
            
            if (checkWin()) {
                setTimeout(() => alert('Поздравляем! Вы достигли 2048!'), 200);
            } else if (checkGameOver()) {
                setTimeout(() => alert('Игра окончена! Счёт: ' + score), 200);
            }
        }
    }

    function checkWin() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (board[i][j] === 2048) return true;
            }
        }
        return false;
    }

    function checkGameOver() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (board[i][j] === 0) return false;
                if (j < 3 && board[i][j] === board[i][j + 1]) return false;
                if (i < 3 && board[i][j] === board[i + 1][j]) return false;
            }
        }
        return true;
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('visible')) return;
        
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            if (e.key === 'ArrowLeft') move('left');
            else if (e.key === 'ArrowRight') move('right');
            else if (e.key === 'ArrowUp') move('up');
            else if (e.key === 'ArrowDown') move('down');
        }
    });

    if (boardElement) {
        boardElement.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });

        boardElement.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        });
    }

    function handleSwipe() {
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        const minSwipeDistance = 30;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > minSwipeDistance) {
                if (diffX > 0) move('right');
                else move('left');
            }
        } else {
            if (Math.abs(diffY) > minSwipeDistance) {
                if (diffY > 0) move('down');
                else move('up');
            }
        }
    }

    if (resetButton) {
        resetButton.addEventListener('click', initGame);
    }
    
    const closeModal = () => {
        modal.classList.remove('visible');
        setTimeout(() => modal.classList.add('hidden'), 300);
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
});