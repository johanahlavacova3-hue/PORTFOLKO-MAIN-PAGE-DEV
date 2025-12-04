const body = document.body;
const modeLabel = document.getElementById('mode-label');
const rybaIcon = document.getElementById('ryba-icon');

const interactiveElements = document.querySelectorAll('#name, #description, .main-title, .sub-text, .game-icon');

const MAX_SHIFT = 600;
const REACTION_DISTANCE = 800;
const BOUND_LIMIT = 150;
const JITTER_MAX = 2;
let jitterInterval;

const isMobile = window.innerWidth <= 768;

// Funkce pro aplikaci transformu
function applyTransform(element, x, y) {
    element.style.transform = `translate(${x}px, ${y}px)`;
}

// Touch/Mouse handler – sjednocený pro PC i mobil
function handleMove(clientX, clientY) {
    if (!body.classList.contains('dark-mode')) return;

    interactiveElements.forEach(element => {
        // Rybu přeskočíme na mobilu
        if (isMobile && element.classList.contains('game-icon')) return;

        const rect = element.getBoundingClientRect();
        const baseX = parseFloat(element.dataset.baseX) || 0;
        const baseY = parseFloat(element.dataset.baseY) || 0;

        const centerX = rect.left + rect.width / 2 + baseX;
        const centerY = rect.top + rect.height / 2 + baseY;

        const dx = clientX - centerX;
        const dy = clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < REACTION_DISTANCE && distance > 0) {
            const factor = 1 - (distance / REACTION_DISTANCE);
            let targetX = (dx / distance) * -MAX_SHIFT * factor;
            let targetY = (dy / distance) * -MAX_SHIFT * factor;

            if (!isMobile || !element.classList.contains('game-icon')) {
                targetX = Math.max(-BOUND_LIMIT, Math.min(BOUND_LIMIT, targetX));
                targetY = Math.max(-BOUND_LIMIT, Math.min(BOUND_LIMIT, targetY));
            }

            element.dataset.baseX = targetX.toFixed(2);
            element.dataset.baseY = targetY.toFixed(2);
            applyTransform(element, targetX, targetY);
        }
    });
}

// Chvění jen na PC
function startJitter() {
    if (isMobile || jitterInterval) return;
    jitterInterval = setInterval(() => {
        interactiveElements.forEach(el => {
            if (el.classList.contains('game-icon')) return;
            const baseX = parseFloat(el.dataset.baseX) || 0;
            const baseY = parseFloat(el.dataset.baseY) || 0;
            const jX = (Math.random() - 0.5) * JITTER_MAX * 2;
            const jY = (Math.random() - 0.5) * JITTER_MAX * 2;
            applyTransform(el, baseX + jX, baseY + jY);
        });
    }, 100);
}

function stopJitter() {
    if (jitterInterval) clearInterval(jitterInterval);
    jitterInterval = null;
}

function resetElementsPosition() {
    interactiveElements.forEach(el => {
        el.style.transform = 'translate(0px, 0px)';
        el.dataset.baseX = 0;
        el.dataset.baseY = 0;
    });
}

function toggleMode() {
    const isDark = body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode', !isDark);

    modeLabel.textContent = 'ZÁBAVNÝ REŽIM';

    if (rybaIcon) {
        rybaIcon.src = isDark ? 'RYBA-BL.png' : 'RYBA-WH.png';
    }

    if (isDark) {
        // Chaos režim
        document.querySelectorAll('.interactable').forEach(a => {
            a.href = "#";
            a.onclick = e => e.preventDefault();
        });

        if (isMobile) {
            document.addEventListener('touchstart', touchHandler);
            document.addEventListener('touchmove', touchHandler);
        } else {
            document.addEventListener('mousemove', mouseHandler);
            startJitter();
        }
        resetElementsPosition();
    } else {
        // Normální režim
        document.querySelectorAll('.interactable').forEach(a => {
            a.href = a.getAttribute('data-url');
            a.onclick = null;
        });

        if (isMobile) {
            document.removeEventListener('touchstart', touchHandler);
            document.removeEventListener('touchmove', touchHandler);
        } else {
            document.removeEventListener('mousemove', mouseHandler);
            stopJitter();
        }
        resetElementsPosition();
    }
}

function mouseHandler(e) {
    handleMove(e.clientX, e.clientY);
}

function touchHandler(e) {
    e.preventDefault(); // Zabrání scrollování
    const touch = e.touches[0];
    if (touch) handleMove(touch.clientX, touch.clientY);
}

// Start
document.addEventListener('DOMContentLoaded', () => {
    if (body.classList.contains('dark-mode')) {
        toggleMode(); // Zapne chaos podle výchozího stavu
        toggleMode();
    }
});
