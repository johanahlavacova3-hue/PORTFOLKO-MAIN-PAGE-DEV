const body = document.body;
const modeLabel = document.getElementById('mode-label');
const rybaIcon = document.getElementById('ryba-icon');

const interactiveElements = document.querySelectorAll(
    '#name, #description, .main-title, .sub-text, .game-icon'
);

const MAX_SHIFT = 600;
const REACTION_DISTANCE = 800;
const MIN_DISTANCE_RYBA = 50;  // Minimální odstup ryby od kurzoru (~50px pro jistotu, můžeš změnit na 40)
const BOUND_LIMIT = 150;
const JITTER_MAX = 2;
let jitterInterval;

// Aplikuje transform pro rybu (translate + rotate)
function applyRybaTransform(x, y, angle) {
    if (rybaIcon) {
        rybaIcon.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
    }
}

// Aplikuje transform pro ostatní prvky
function applyNormalTransform(element, x, y) {
    element.style.transform = `translate(${x}px, ${y}px)`;
}

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

    if (rybaIcon) {
        rybaIcon.src = isNowDark ? 'RYBA-BL.png' : 'RYBA-WH.png';
    }

    if (isNowDark) {
        document.addEventListener('mousemove', moveElements);
        startJitter();
        resetElementsPosition(true);

        document.querySelectorAll('.interactable').forEach(a => {
            a.href = "#";
            a.onclick = (e) => e.preventDefault();
        });
    } else {
        document.removeEventListener('mousemove', moveElements);
        stopJitter();
        resetElementsPosition(false);

        document.querySelectorAll('.interactable').forEach(a => {
            a.href = a.getAttribute('data-url');
            a.onclick = null;
        });
    }
}

function moveElements(e) {
    if (!body.classList.contains('dark-mode')) return;

    interactiveElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const baseX = parseFloat(element.dataset.baseX) || 0;
        const baseY = parseFloat(element.dataset.baseY) || 0;

        const centerX = rect.left + rect.width / 2 + baseX;  // Opravený výpočet středu s aktuálním posunem
        const centerY = rect.top + rect.height / 2 + baseY;

        let dx = e.clientX - centerX;
        let dy = e.clientY - centerY;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < REACTION_DISTANCE && distance > 0) {
            let factor = 1 - (distance / REACTION_DISTANCE);
            let targetX = (dx / distance) * -MAX_SHIFT * factor;
            let targetY = (dy / distance) * -MAX_SHIFT * factor;

            if (element.id === 'ryba-icon') {
                // Minimální odstup pro rybu
                const projectedDistance = distance - MAX_SHIFT * factor;
                if (projectedDistance < MIN_DISTANCE_RYBA) {
                    const extraPush = MIN_DISTANCE_RYBA - projectedDistance;
                    targetX -= (dx / distance) * extraPush;
                    targetY -= (dy / distance) * extraPush;
                }

                // Otáčení ryby za cursorem
                const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90; // Uprav +90 podle orientace ryby v obrázku
                applyRybaTransform(targetX, targetY, angle);
            } else {
                // Ostatní prvky s limitem
                targetX = Math.max(-BOUND_LIMIT, Math.min(BOUND_LIMIT, targetX));
                targetY = Math.max(-BOUND_LIMIT, Math.min(BOUND_LIMIT, targetY));
                applyNormalTransform(element, targetX, targetY);
            }

            // Uložení nové základní pozice
            element.dataset.baseX = targetX.toFixed(2);
            element.dataset.baseY = targetY.toFixed(2);
        }
    });
}

function startJitter() {
    if (jitterInterval) clearInterval(jitterInterval);

    jitterInterval = setInterval(() => {
        interactiveElements.forEach(element => {
            const baseX = parseFloat(element.dataset.baseX) || 0;
            const baseY = parseFloat(element.dataset.baseY) || 0;
            const jitterX = (Math.random() - 0.5) * JITTER_MAX * 2;
            const jitterY = (Math.random() - 0.5) * JITTER_MAX * 2;

            if (element.id === 'ryba-icon') {
                // Zachová aktuální rotaci
                const currentTransform = element.style.transform || 'rotate(0deg)';
                const currentAngle = currentTransform.match(/rotate\((-?\d+\.?\d*)deg\)/);
                const angle = currentAngle ? parseFloat(currentAngle[1]) : 0;
                applyRybaTransform(baseX + jitterX, baseY + jitterY, angle);
            } else {
                applyNormalTransform(element, baseX + jitterX, baseY + jitterY);
            }
        });
    }, 80); // Mírně rychlejší pro plynulejší chvění
}

function stopJitter() {
    if (jitterInterval) clearInterval(jitterInterval);
    jitterInterval = null;
}

function resetElementsPosition(initialize) {
    interactiveElements.forEach(element => {
        if (!initialize) {
            if (element.id === 'ryba-icon') {
                element.style.transform = 'translate(0px, 0px) rotate(0deg)';
            } else {
                element.style.transform = 'translate(0px, 0px)';
            }
        }
        element.dataset.baseX = 0;
        element.dataset.baseY = 0;
    });
}

// Inicializace
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('mousemove', moveElements);
    startJitter();
    resetElementsPosition(true);

    document.querySelectorAll('.interactable').forEach(a => {
        a.href = "#";
        a.onclick = (e) => e.preventDefault();
    });

    if (rybaIcon) rybaIcon.src = 'RYBA-BL.png';
});
