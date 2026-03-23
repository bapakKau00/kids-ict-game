(function () {
    // 1. Setup Audio
    const bgMusic = new Audio('assets/audio/bckgrnd%20music.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.5;

    // SVG Icons (Independent of Bootstrap/External Fonts)
    const iconUnmuted = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M14.66 17c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zm3 0c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zM7 9v6h4l5 5V4l-5 5H7z"/></svg>';
    const iconMuted = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';

    // 2. Check Persistence
    let isMuted = localStorage.getItem('bg_music_muted') === 'true';

    // 3. Create Toggle Button UI
    const musicBtn = document.createElement('div');
    musicBtn.id = 'global-music-toggle';
    musicBtn.innerHTML = isMuted ? iconMuted : iconUnmuted;

    // Inline Styles for the Toggle
    const style = document.createElement('style');
    style.textContent = `
        #global-music-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 45px;
            height: 45px;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            z-index: 9999;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        #global-music-toggle:hover {
            transform: scale(1.1);
            background: rgba(255, 255, 255, 0.3);
        }
        #global-music-toggle.active {
            background: #ff4757;
            border-color: #ff6b81;
            box-shadow: 0 0 20px rgba(255, 71, 87, 0.5);
        }
    `;

    function initUI() {
        if (document.getElementById('global-music-toggle')) return;
        document.head.appendChild(style);
        document.body.appendChild(musicBtn);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUI);
    } else {
        initUI();
    }

    // 4. Logic Functions
    function toggleMusic() {
        if (bgMusic.paused) {
            playMusic();
        } else {
            pauseMusic();
        }
    }

    function playMusic() {
        bgMusic.play().then(() => {
            isMuted = false;
            localStorage.setItem('bg_music_muted', 'false');
            musicBtn.innerHTML = iconUnmuted;
            musicBtn.classList.remove('active');
        }).catch(err => {
            console.log("Autoplay prevented. Waiting for user interaction.");
        });
    }

    function pauseMusic() {
        bgMusic.pause();
        isMuted = true;
        localStorage.setItem('bg_music_muted', 'true');
        musicBtn.innerHTML = iconMuted;
        musicBtn.classList.add('active');
    }

    // 5. Initial State & AutoPlay attempts
    function autoStart() {
        if (!isMuted && bgMusic.paused) {
            playMusic();
        }
        // CLEANUP: once they interact, we can remove these listeners
        ['click', 'mousedown', 'keydown', 'touchstart'].forEach(type => {
            window.removeEventListener(type, autoStart);
        });
    }

    if (!isMuted) {
        // Broad interaction trigger for modern browser autoplay policies
        ['click', 'mousedown', 'keydown', 'touchstart'].forEach(type => {
            window.addEventListener(type, autoStart, { once: true });
        });
    } else {
        musicBtn.classList.add('active');
    }

    // 6. Event Listeners
    musicBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMusic();
    });

    // 7. Simple Page Transitions
    function initFadeTransition() {
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        document.body.appendChild(overlay);

        // Fade out on load
        requestAnimationFrame(() => {
            overlay.classList.add('hidden');
        });

        // Intercept internal link clicks to fade in before navigating
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href &&
                link.href.includes(window.location.origin) &&
                !link.target &&
                !link.hasAttribute('download') &&
                !link.href.includes('#')) {

                e.preventDefault();
                overlay.classList.remove('hidden');
                overlay.classList.add('visible');

                setTimeout(() => {
                    window.location.href = link.href;
                }, 400); // Match CSS transition duration
            }
        });
    }

    initFadeTransition();

})();

