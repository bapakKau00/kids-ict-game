const itemsData = {
    headphone: {
        title: "Fon Telinga 🎧",
        desc: "Saya memainkan semua muzik dan bunyi terus ke telinga anda! Anda boleh mendengar perkara tanpa mengganggu orang lain.",
        iconClass: "bi-headphones",
        color: "#F27059",
        audio: "assets/audio/fon%20telinga.ogg"
    },
    mouse: {
        title: "Tetikus 🖱️",
        desc: "Squeak! Saya membantu anda menggerakkan anak panah kecil pada skrin dan klik pada perkara yang menyeronokkan! Cuba gerakkan saya.",
        iconClass: "bi-mouse",
        color: "#FF6B6B",
        audio: "assets/audio/tetikus.ogg"
    },
    keyboard: {
        title: "Papan Kekunci ⌨️",
        desc: "Klik klak! Saya mempunyai banyak butang dengan huruf, nombor dan simbol supaya anda boleh menaip kata-kata ajaib.",
        iconClass: "bi-keyboard",
        color: "#4ECDC4",
        audio: "assets/audio/papan%20kekunci.ogg"
    },
    laptop: {
        title: "Komputer Riba 💻",
        desc: "Saya komputer yang boleh anda bawa! Saya mempunyai skrin, papan kekunci dan pad jejak semuanya dalam satu. Anda boleh melipat saya dan membawa saya ke mana-mana.",
        iconClass: "bi-laptop",
        color: "#FFE66D",
        audio: "assets/audio/komputer%20riba.ogg"
    },
    tablet: {
        title: "Telefon Pintar 📱",
        desc: "Saya seperti telefon ajaib! Saya tidak memerlukan papan kekunci yang besar—hanya ketik, leret dan lukis terus pada skrin saya.",
        iconClass: "bi-tablet",
        color: "#FF9F43",
        audio: "assets/audio/telefon%20pintar.ogg"
    },
    monitor: {
        title: "Monitor 🖥️",
        desc: "Saya skrin yang ajaib sepenuhnya! Segala-galanya yang anda lakukan pada komputer ditunjukkan di sini.",
        iconClass: "bi-display",
        color: "#8854d0",
        audio: "assets/audio/monitor.ogg"
    },
    camera: {
        title: "Kamera Digital 📷",
        desc: "Cheese! Saya merakam gambar dan video anda supaya keluarga dan rakan-rakan anda dapat melihat senyuman anda.",
        iconClass: "bi-camera",
        color: "#DC2839",
        audio: "assets/audio/kamera%20digital.ogg"
    },
    speaker: {
        title: "Pembesar Suara 🔊",
        desc: "Boom! Saya mengeluarkan semua bunyi dan muzik yang kuat supaya semua orang di dalam bilik dapat mendengar komputer.",
        iconClass: "bi-speaker",
        color: "#25df82ff",
        audio: "assets/audio/pembesar%20suara.ogg"
    },
    joystick: {
        title: "Alat Kawalan Permainan 🎮",
        desc: "Sedia untuk bermain? Gunakan saya untuk mengawal watak, mengemudi kereta dan memenangi permainan video! Atas, bawah, kiri, kanan!",
        iconClass: "bi-controller",
        color: "#0099FF",
        audio: "assets/audio/alat%20kawalan%20permainan.ogg"
    }
};

const cards = document.querySelectorAll('.interactive-item');
const modal = document.getElementById('info-modal');
const closeBtn = document.querySelector('.close-btn');
const modalIcon = document.getElementById('modal-icon');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const playSoundBtn = document.getElementById('play-sound-btn');

let foundItems = new Set();
const totalItems = Object.keys(itemsData).length;

// Persistent audio handle
let currentAudio = null;

function stopCurrentAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
}

// Short pop sound base64 or external url for hover events
const hoverSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');

cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        hoverSound.currentTime = 0;
        hoverSound.volume = 0.3;
        hoverSound.play().catch(e => { /* Ignore auto-play strict errors */ });
    });

    card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const data = itemsData[id];
        
        foundItems.add(id);
        
        modalIcon.className = 'bi ' + data.iconClass;
        modalIcon.style.color = data.color;
        modalIcon.style.filter = `drop-shadow(0 0 15px ${data.color})`;
        modalTitle.textContent = data.title;
        modalDesc.textContent = data.desc;
        
        modal.classList.remove('hidden');

        // Play discovery audio
        stopCurrentAudio();
        currentAudio = new Audio(data.audio);
        currentAudio.play().catch(e => console.log("Audio play failed:", e));
        
        // Check win condition (All items found!)
        if (foundItems.size === totalItems) {
            const darkOverlay = document.querySelector('.dark-overlay');
            if (darkOverlay && !darkOverlay.classList.contains('cleared')) {
                darkOverlay.classList.add('cleared');
                darkOverlay.style.transition = 'opacity 2s ease-in-out';
                darkOverlay.style.opacity = '0';
                
                // Play celebratory win sounds in sequence
                stopCurrentAudio();
                const winSound1 = new Audio('assets/audio/yayyy-sound.mp3');
                const winSound2 = new Audio('assets/audio/jumpa%20semua.ogg');
                
                winSound1.play().catch(e => console.log("Win audio 1 failed:", e));
                winSound1.onended = () => {
                    winSound2.play().catch(e => console.log("Win audio 2 failed:", e));
                };

                setTimeout(() => {
                    darkOverlay.style.display = 'none';
                    
                    // Update header title to success message
                    const heroTitle = document.querySelector('.bounce-title');
                    const subtitle = document.querySelector('.hero .subtitle');
                    if(heroTitle) heroTitle.innerHTML = 'Tahniah! Anda jumpa semuanya! 🎉';
                    if(subtitle) subtitle.innerHTML = 'Bilik kini terang-benderang! Semua komponen dijumpai!';
                }, 2000);
            }
        }
    });
});

closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    stopCurrentAudio();
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
        stopCurrentAudio();
    }
});

playSoundBtn.addEventListener('click', () => {
    if (currentAudio) {
        currentAudio.currentTime = 0;
        currentAudio.play().catch(e => console.log("Audio play failed:", e));
    } else {
        alert("Hebat! " + modalDesc.textContent);
    }
});

// Add floating particles/stars to the background for an extra premium feel
const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F43'];

function createParticle() {
    const particle = document.createElement('div');
    const size = Math.random() * 15 + 5; // 5 to 20px
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particle.style.position = 'absolute';
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.background = color;
    particle.style.borderRadius = '50%';
    particle.style.opacity = '0.4';
    particle.style.top = Math.random() * 100 + 'vh';
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.animation = `float ${Math.random() * 4 + 3}s infinite ease-in-out`;
    particle.style.zIndex = '-1';
    
    document.querySelector('.background-overlay').appendChild(particle);
}

// Initialize particles playfully
for(let i=0; i<30; i++) {
    createParticle();
}

// Flashlight Minigame Logic
const darkOverlay = document.querySelector('.dark-overlay');
if (darkOverlay) {
    document.addEventListener('mousemove', (e) => {
        darkOverlay.style.setProperty('--cursor-x', e.clientX + 'px');
        darkOverlay.style.setProperty('--cursor-y', e.clientY + 'px');
    });

    document.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        darkOverlay.style.setProperty('--cursor-x', touch.clientX + 'px');
        darkOverlay.style.setProperty('--cursor-y', touch.clientY + 'px');
    });
}
