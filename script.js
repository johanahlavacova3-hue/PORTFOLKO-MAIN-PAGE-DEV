const body = document.body;
const modeLabel = document.getElementById('mode-label');
const rybaIcon = document.getElementById('ryba-icon');

const interactiveElements = document.querySelectorAll(
    '#name, #description, .main-title, .sub-text, .game-icon'
);

const MAX_SHIFT = 600;
const REACTION_DISTANCE = 800;
const BOUND_LIMIT = 150;
const JITTER_MAX = 2;
let jitterInterval;

function toggleMode() {
    const isCurrentlyDark = body.classList.contains('dark-mode');

    if (isCurrentlyDark) {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
    }

    const isNowDark = body.classList.contains('dark-mode');
    modeLabel.textContent = 'ZÁBAVNÝ REŽIM';

    // Přepnutí obrázku ryby
    if (rybaIcon) {
        rybaIcon.src = isNowDark ? 'RYBA-BL.png' : 'RYBA-WH.png';
    }

    if (isNowDark) {
        document.addEventListener('mousemove', moveElements);
        document.addEventListener('mousemove', followCursor); // Přidáno sledování
        startJitter();
        resetElementsPosition(true);

        document.querySelectorAll('.interactable').forEach(a => {
            a.href = "#";
            a.onclick = (e) => e.preventDefault();
        });
    } else {
        document.removeEventListener('mousemove', moveElements);
        document.removeEventListener('mousemove', followCursor); // Vypne sledování
        rybaIcon.style.transform = rybaIcon.style.transform.replace(/rotate\([^)]*\)\s?/, '').trim() || 'translate(0,0)'; // Odstraní rotaci
        stopJitter();
        resetElementsPosition(false);

        document.querySelectorAll('.interactable').forEach(a => {
            a.href = a.getAttribute('data-url');
            a.onclick = null;
        });
    }
}

// Nová funkce: Ryba agresivně sleduje cursor (otáčí se k myši)
function followCursor(e) {
    if (!body.classList.contains('dark-mode') || !rybaIcon) return;

    const rect = rybaIcon.getBoundingClientRect();
    const rybaX = rect.left + rect.width / 2;
    const rybaY = rect.top + rect.height / 2;

    const dx = e.clientX - rybaX;
    const dy = e.clientY - rybaY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90; // +90 protože ryba směřuje nahoru (přizpůsob podle orientace obrázku)

    // Aplikujeme rotaci navíc k existující transformaci (utíkání + jitter)
    const currentTransform = rybaIcon.style.transform;
    const newTransform = currentTransform.replace(/rotate\([^)]*\)/, '') + ` rotate(${angle}deg)`;
    rybaIcon.style.transform = newTransform.trim();
}

function moveElements(e) {
    if (body.classList.contains('dark-mode')) {
        interactiveElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const elementBaseX = parseFloat(element.dataset.baseX) || 0;
            const elementBaseY = parseFloat(element.dataset.baseY) || 0;

            const elementCenterX = rect.left + rect.width / 2 - elementBaseX;
            const elementCenterY = rect.top + rect.height / 2 - elementBaseY;
            const dx = e.clientX - elementCenterX;
            const dy = e.clientY - elementCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < REACTION_DISTANCE) {
                const factor = 1 - (distance / REACTION_DISTANCE);
                let targetTranslateX = (dx / distance) * -MAX_SHIFT * factor;
                let targetTranslateY = (dy / distance) * -MAX_SHIFT * factor;

                targetTranslateX = Math.max(-BOUND_LIMIT, Math.min(BOUND_LIMIT, targetTranslateX));
                targetTranslateY = Math.max(-BOUND_LIMIT, Math.min(BOUND_LIMIT, targetTranslateY));

                element.dataset.baseX = targetTranslateX.toFixed(2);
                element.dataset.baseY = targetTranslateY.toFixed(2);
            }
        });
    }
}

function startJitter() {
    if (jitterInterval) clearInterval(jitterInterval);

    jitterInterval = setInterval(() => {
        interactiveElements.forEach(element => {
            const baseX = parseFloat(element.dataset.baseX) || 0;
            const baseY = parseFloat(element.dataset.baseY) || 0;
            const jitterX = (Math.random() - 0.5) * JITTER_MAX * 2;
            const jitterY = (Math.random() - 0.5) * JITTER_MAX * 2;

            let transform = `translate(${baseX + jitterX}px, ${baseY + jitterY}px)`;

            // Pro rybu zachová rotaci (pokud existuje)
            if (element.id === 'ryba-icon') {
                const currentRotate = element.style.transform.match(/rotate\([^)]*\)/);
                if (currentRotate) transform += ' ' + currentRotate[0];
            }

            element.style.transform = transform;
        });
    }, 100);
}

function stopJitter() {
    if (jitterInterval) {
        clearInterval(jitterInterval);
        jitterInterval = null;
    }
}

function resetElementsPosition(initialize) {
    interactiveElements.forEach(element => {
        if (!initialize) {
            element.style.transform = 'translate(0, 0)';
        }
        element.dataset.baseX = 0;
        element.dataset.baseY = 0;
    });
}

// Inicializace při načtení
document.addEventListener('DOMContentLoaded', () => {
    // Nastartujeme chaos (tmavý režim)
    document.addEventListener('mousemove', moveElements);
    document.addEventListener('mousemove', followCursor);
    startJitter();
    resetElementsPosition(true);

    // Blokujeme odkazy
    document.querySelectorAll('.interactable').forEach(a => {
        a.href = "#";
        a.onclick = (e) => e.preventDefault();
    });

    // Správný obrázek ryby na startu
    if (rybaIcon) rybaIcon.src = 'RYBA-BL.png';
});
