const body = document.body;
const modeLabel = document.getElementById('mode-label');

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

    // Text přepínače je pořád stejný
    modeLabel.textContent = 'ZÁBAVNÝ REŽIM';

    if (isNowDark) {
        document.addEventListener('mousemove', moveElements);
        startJitter();
        resetElementsPosition(true);

        // Blokovat odkazy v chaosu
        document.querySelectorAll('.interactable').forEach(a => {
            a.href = "#";
            a.onclick = (e) => e.preventDefault();
        });
    } else {
        document.removeEventListener('mousemove', moveElements);
        stopJitter();
        resetElementsPosition(false);

        // Povolit odkazy
        document.querySelectorAll('.interactable').forEach(a => {
            a.href = a.getAttribute('data-url');
            a.onclick = null;
        });
    }
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
            element.style.transform = `translate(${baseX + jitterX}px, ${baseY + jitterY}px)`;
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

// Zapnout chaos hned při načtení (výchozí je dark-mode)
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('mousemove', moveElements);
    startJitter();
    resetElementsPosition(true);

    // Blokovat odkazy na začátku
    document.querySelectorAll('.interactable').forEach(a => {
        a.href = "#";
        a.onclick = (e) => e.preventDefault();
    });
});
