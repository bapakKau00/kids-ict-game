const toolbox = document.getElementById('toolbox');
const dropzones = document.querySelectorAll('.dropzone');
const victoryModal = document.getElementById('victory-modal');

// Hardware specs definition
const parts = [
    { id: 'cpu', name: 'Pemproses (CPU)', icon: 'bi-cpu-fill', color: '#ff4757', width: '110px', height: '110px' },
    { id: 'ram', name: 'RAM', icon: 'bi-memory', color: '#ffa502', width: '60px', height: '170px' },
    { id: 'gpu', name: 'Kad Grafik (GPU)', icon: 'bi-gpu-card', color: '#2ed573', width: '280px', height: '70px' },
    { id: 'hdd', name: 'Storan (HDD)', icon: 'bi-hdd-fill', color: '#1e90ff', width: '120px', height: '80px' },
    { id: 'psu', name: 'Bekalan Kuasa', icon: 'bi-plug-fill', color: '#3742fa', width: '140px', height: '110px' }
];

let correctlyPlacedCount = 0;

function initGame() {
    // Scaffold UI
    parts.sort(() => Math.random() - 0.5); // Randomize layout slightly
    
    parts.forEach(part => {
        const el = document.createElement('div');
        el.classList.add('draggable-part');
        el.draggable = true;
        el.dataset.id = part.id;
        el.style.width = part.width;
        el.style.height = part.height;
        el.style.backgroundColor = '#f1f2f6';
        el.style.border = `4px solid ${part.color}`;
        el.style.borderRadius = '10px';
        el.style.display = 'flex';
        el.style.flexDirection = 'column';
        el.style.justifyContent = 'center';
        el.style.alignItems = 'center';
        el.style.cursor = 'grab';
        el.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
        el.style.color = '#2f3542';
        el.style.flexShrink = '0'; // prevent flexing
        
        // Custom text layout per shape ratio
        if (part.id === 'ram') {
            el.innerHTML = `<i class="bi ${part.icon}" style="font-size: 1.8rem; color: ${part.color};"></i>`;
        } else {
            el.innerHTML = `
                <i class="bi ${part.icon}" style="font-size: 2.2rem; color: ${part.color};"></i>
                <span style="font-weight: bold; font-size: 0.9rem; margin-top: 5px; text-align: center;">${part.name}</span>
            `;
        }

        // HTML5 Drag Event Listeners
        el.addEventListener('dragstart', (e) => {
            el.classList.add('dragging');
            e.dataTransfer.setData('text/plain', part.id);
            e.dataTransfer.effectAllowed = 'move';
        });

        el.addEventListener('dragend', () => {
            el.classList.remove('dragging');
        });

        toolbox.appendChild(el);
    });
}

// Map dropzones logic
dropzones.forEach(zone => {
    zone.addEventListener('dragenter', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
    });

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('dragover');
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        
        const draggedId = e.dataTransfer.getData('text/plain');
        const targetId = zone.dataset.target;
        
        if (draggedId === targetId) {
            // Valid match!
            const draggedElement = document.querySelector(`.draggable-part[data-id="${draggedId}"]`);
            
            // Re-render DOM location into motherboard
            zone.innerHTML = ''; 
            draggedElement.style.margin = '0';
            draggedElement.style.boxShadow = 'none';
            draggedElement.draggable = false;
            draggedElement.style.cursor = 'default';
            // Constraint lock matching
            draggedElement.style.width = '100%';
            draggedElement.style.height = '100%';
            draggedElement.style.border = 'none';
            
            zone.appendChild(draggedElement);
            
            // Visual feedback loop
            zone.style.border = '4px solid #fff';
            zone.style.background = 'transparent';
            zone.dataset.filled = 'true';

            correctlyPlacedCount++;
            checkWinState();
        } else {
            // Failure logic -> reject placement visually
            zone.style.borderColor = '#FF6B6B';
            zone.style.background = 'rgba(255,107,107,0.3)';
            setTimeout(() => {
                if(!zone.dataset.filled) {
                    zone.style.borderColor = '#fff';
                    zone.style.background = 'rgba(0,0,0,0.25)';
                }
            }, 500);
        }
    });
});

function checkWinState() {
    if (correctlyPlacedCount === dropzones.length) {
        setTimeout(() => {
            victoryModal.classList.remove('hidden');
        }, 600);
    }
}

// Start sequence
initGame();
