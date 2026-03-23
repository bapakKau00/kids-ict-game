const gameArea = document.getElementById('game-area');
const basket = document.getElementById('basket');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const livesEl = document.getElementById('lives-display');

let score = 0;
let timeLeft = 30;
let spawnInterval;
let timerInterval;
let isGameOver = false;

// Determine current lives from local storage memory across page refreshes
let currentLives = parseInt(localStorage.getItem('protect_lives'));
if (isNaN(currentLives) || currentLives <= 0) {
    currentLives = 3; 
    localStorage.setItem('protect_lives', currentLives);
}

function updateLivesUI() {
    let hearts = '';
    for(let i=0; i<currentLives; i++) hearts += '❤️';
    for(let i=currentLives; i<3; i++) hearts += '🖤';
    if(livesEl) livesEl.textContent = hearts;
}
updateLivesUI();

// Valid items that give points
const validItems = [
    { icon: 'bi-display', color: '#8854d0' },
    { icon: 'bi-mouse', color: '#FF6B6B' },
    { icon: 'bi-keyboard', color: '#4ECDC4' },
    { icon: 'bi-laptop', color: '#FFE66D' },
    { icon: 'bi-tablet', color: '#FF9F43' },
    { icon: 'bi-headphones', color: '#F27059' },
    { icon: 'bi-camera', color: '#DC2839' },
    { icon: 'bi-speaker', color: '#25df82ff' },
    { icon: 'bi-controller', color: '#0099FF' }
];

// Invalid distracting items that dock scores
const invalidItems = [
    { icon: 'bi-bug', color: '#000000' },
    { icon: 'bi-snow2', color: '#00B800' },
    { icon: 'bi-cup-hot', color: '#8d6e63' },
    { icon: 'bi-trash', color: '#636e72' },
    { icon: 'bi-cone-striped', color: '#e17055' }
];

// Basket movement listener (Mouse)
gameArea.addEventListener('mousemove', (e) => {
    if(isGameOver) return;
    const gameAreaRect = gameArea.getBoundingClientRect();
    const x = e.clientX - gameAreaRect.left;
    const basketWidth = basket.offsetWidth;
    let newLeft = x;
    
    // Bounds clamping based on game area
    if(newLeft < basketWidth/2) newLeft = basketWidth/2;
    if(newLeft > gameArea.offsetWidth - basketWidth/2) newLeft = gameArea.offsetWidth - basketWidth/2;
    
    basket.style.left = newLeft + 'px';
});

// Basket movement listener (Touch)
gameArea.addEventListener('touchmove', (e) => {
    if(isGameOver) return;
    const gameAreaRect = gameArea.getBoundingClientRect();
    const x = e.touches[0].clientX - gameAreaRect.left;
    const basketWidth = basket.offsetWidth;
    let newLeft = x;
    
    if(newLeft < basketWidth/2) newLeft = basketWidth/2;
    if(newLeft > gameArea.offsetWidth - basketWidth/2) newLeft = gameArea.offsetWidth - basketWidth/2;
    
    basket.style.left = newLeft + 'px';
}, {passive: true});

function spawnItem() {
    if(isGameOver) return;

    const itemObj = document.createElement('div');
    itemObj.classList.add('falling-item');
    
    // 70% valid spawn rate, 30% invalid payload
    const isValid = Math.random() < 0.7;
    const itemData = isValid ? 
        validItems[Math.floor(Math.random() * validItems.length)] : 
        invalidItems[Math.floor(Math.random() * invalidItems.length)];
        
    itemObj.innerHTML = `<i class="bi ${itemData.icon}"></i>`;
    itemObj.dataset.valid = isValid;
    
    // Rendering logic
    itemObj.style.position = 'absolute';
    itemObj.style.top = '-50px';
    itemObj.style.left = Math.random() * (gameArea.offsetWidth - 60) + 'px';
    itemObj.style.fontSize = '3.5rem';
    itemObj.style.color = itemData.color;
    itemObj.style.filter = `drop-shadow(0 0 10px ${itemData.color})`;
    itemObj.style.zIndex = '40';
    
    gameArea.appendChild(itemObj);
    
    // Item falling speed simulation (faster over time is optional)
    let speed = 3 + Math.random() * 4; 
    
    function fall() {
        if(isGameOver) return;
        
        let currentTop = parseFloat(itemObj.style.top);
        currentTop += speed;
        itemObj.style.top = currentTop + 'px';
        
        // 2D Box Collision Check
        const itemRect = itemObj.getBoundingClientRect();
        const basketRect = basket.getBoundingClientRect();
        
        if (
            itemRect.bottom > basketRect.top &&
            itemRect.top < basketRect.bottom &&
            itemRect.right > basketRect.left &&
            itemRect.left < basketRect.right
        ) {
            // Detected intersection overlap! Check identity payload.
            if(itemObj.dataset.valid === 'true') {
                score += 10;
                new Audio('assets/audio/catch%20correct.mp3').play().catch(e => {});
                
                // Win state 100 limit checker
                if (score >= 100) {
                    score = 100;
                    scoreEl.textContent = score;
                    showFloatingText('+10', itemRect.left, itemRect.top - 20, '#4ECDC4');
                    itemObj.remove();
                    endGame(true);
                    return;
                }
                
                showFloatingText('+10', itemRect.left, itemRect.top - 20, '#4ECDC4');
            } else {
                score -= 10;
                new Audio('assets/audio/wrong%20catch.mp3').play().catch(e => {});
                if(score < 0) score = 0; // Prevent score from bleeding negatively below zero
                showFloatingText('-10', itemRect.left, itemRect.top - 20, '#FF6B6B');
            }
            scoreEl.textContent = score;
            itemObj.remove();
            return; // terminate fall tick lifecycle
        }
        
        // Clear object from DOM if it falls out of view limits
        if (currentTop > gameArea.offsetHeight) {
            itemObj.remove();
            return;
        }
        
        requestAnimationFrame(fall);
    }
    
    // Begin 60 FPS fall execution loop
    requestAnimationFrame(fall);
}

// Emits visual payload text over successful caches
function showFloatingText(text, x, y, color) {
    const floatEl = document.createElement('div');
    floatEl.textContent = text;
    floatEl.style.position = 'absolute';
    floatEl.style.left = x + 'px';
    floatEl.style.top = y + 'px';
    floatEl.style.color = color;
    floatEl.style.fontSize = '2.5rem';
    floatEl.style.fontWeight = 'bold';
    floatEl.style.pointerEvents = 'none';
    floatEl.style.zIndex = '100';
    floatEl.style.textShadow = '2px 2px 0 #000';
    floatEl.style.transition = 'all 1s ease-out';
    document.body.appendChild(floatEl);
    
    // Trigger floating pop animation
    setTimeout(() => {
        floatEl.style.top = (y - 80) + 'px';
        floatEl.style.opacity = '0';
    }, 50);
    
    // De-allocate memory after execution
    setTimeout(() => floatEl.remove(), 1000);
}

function updateTimer() {
    if(isGameOver) return;
    timeLeft--;
    timerEl.textContent = timeLeft;
    
    if(timeLeft <= 0) {
        endGame(false);
    }
}

function endGame(isPerfectWin = false) {
    isGameOver = true;
    clearInterval(spawnInterval);
    clearInterval(timerInterval);
    
    const modal = document.getElementById('game-over-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    
    // Clear any falling items currently mid-air by clearing DOM nodes
    document.querySelectorAll('.falling-item').forEach(e => e.remove());
    
    if (isPerfectWin) {
        new Audio('assets/audio/yayyy-sound.mp3').play().catch(e => {});
        modalTitle.textContent = "Tahniah! 🏆";
        modalTitle.style.color = "#4ECDC4";
        modalDesc.innerHTML = `Hebat! Anda mencatat markah penuh 100!<br><span style="color: #4ECDC4; font-weight: bold; font-size: 3rem; display: block; margin-top: 10px;">${score}</span>`;
    } else {
        if (score >= 50) {
            modalTitle.textContent = "Masa Tamat! ⏰";
            modalTitle.style.color = "#FFE66D";
            modalDesc.innerHTML = `Syabas! Anda melepasi tahap 50 markah!<br>Main lagi untuk capai 100 markah!<br><span style="color: #FFE66D; font-weight: bold; font-size: 3rem; display: block; margin-top: 10px;">${score}</span>`;
        } else {
            // Failure boundary: Deduct 1 of 3 permanent lives.
            new Audio('assets/audio/awww-sound.mp3').play().catch(e => {});
            currentLives--;
            localStorage.setItem('protect_lives', currentLives);
            updateLivesUI();
            
            modalTitle.textContent = "Gagal! 💔";
            modalTitle.style.color = "#FF6B6B";
            
            if (currentLives <= 0) {
                modalDesc.innerHTML = `Markah akhir kurang dari 50. Game Over!<br>Semua 3 nyawa anda telah habis!<br><span style="color: #FF6B6B; font-weight: bold; font-size: 3rem; display: block; margin-top: 10px;">${score}</span>`;
                // Wipe lives tracker so the player defaults back to 3 on the next run
                localStorage.setItem('protect_lives', 3);
            } else {
                modalDesc.innerHTML = `Markah kurang dari 50. Anda Hilang 1 Nyawa!<br>Baki nyawa: ${currentLives}/3<br><span style="color: #FF6B6B; font-weight: bold; font-size: 3rem; display: block; margin-top: 10px;">${score}</span>`;
            }
        }
    }
    
    modal.classList.remove('hidden');
}

// Executes the overarching game lifecycle
function startGame() {
    // Generate new objects procedurally every 800ms
    spawnInterval = setInterval(spawnItem, 800);
    
    // Start countdown timer spanning 30s
    timerEl.textContent = timeLeft;
    timerInterval = setInterval(updateTimer, 1000);
}

function initCountdown() {
    isGameOver = true; // freeze game interactions until done
    
    const startOverlay = document.getElementById('start-countdown-overlay');
    if (!startOverlay) {
        isGameOver = false;
        startGame();
        return;
    }
    
    const startNum = document.getElementById('start-countdown-number');
    let count = 3;
    startNum.textContent = count;
    startOverlay.classList.remove('hidden');
    
    let countInterval = setInterval(() => {
        count--;
        if (count > 0) {
            startNum.textContent = count;
            startNum.style.transform = 'scale(1.2)';
            setTimeout(() => { startNum.style.transform = 'scale(1)'; }, 200);
        } else if (count === 0) {
            startNum.textContent = "Mula!";
            startNum.style.color = "#FF6B6B";
            startNum.style.fontSize = "8rem";
        } else {
            clearInterval(countInterval);
            startOverlay.classList.add('hidden');
            isGameOver = false;
            startGame();
        }
    }, 1000);
}

// Initiate the countdown simulation
initCountdown();
