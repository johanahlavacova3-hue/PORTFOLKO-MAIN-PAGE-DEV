const body = document.body;
const modeLabel = document.getElementById('mode-label');
const rybaIcon = document.getElementById('ryba-icon');

const interactiveElements = document.querySelectorAll(
    '#name, #description, .main-title, .sub-text, .game-icon'
);

const MAX_SHIFT = 600;
const REACTION_DISTANCE = 800;
const MIN_DISTANCE = 40;  // Minimální vzdálenost od kurzoru (ryba se nesmí přiblížit blíž)
const BOUND_LIMIT = 150; // Limit pro ostatní prvky, ryba nemá
const JITTER_MAX = 2;
let jitterInterval;

// Pomocná funkce: aplikuje transform (translate + rotate) pro rybu
function applyRybaTransform(translateX, translateY, angle) {
    if (!rybaIcon) return;
    rybaIcon.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${angle}deg)`;
}

// Pomocná funkce: aplikuje transform pro ostatní prvky
function applyNormalTransform(element, translateX, translateY) {
    element.style.transform = `translate(${translateX}px, ${translateY}px)`;
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

        const centerX = rect.left + rect.width / 2 - baseX;
        const centerY = rect.top + rect.height / 2 - baseY;

        let dx = e.clientX - centerX;
        let dy = e.clientY - centerY;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < REACTION_DISTANCE) {
            const factor = 1 - (distance / REACTION_DISTANCE);
            let targetX = (dx / distance) * -MAX_SHIFT * factor;
            let targetY = (dy / distance) * -MAX_SHIFT * factor;

            // Speciální pravidlo pro rybu: minimální vzdálenost 40px
            if (element.id === 'ryba-icon') {
                const desiredDistance = distance + MAX_SHIFT * factor; // přibližná vzdálenost po posunu
                if (desiredDistance < MIN_DISTANCE) {
                    // Posuneme rybu dál, aby byla minimálně 40px od kurzoru
                    const extra = MIN_DISTANCE - desiredDistance;
                    targetX = (dx / distance) * - (MAX_SHIFT * factor + extra);
                    targetY = (dy / distance) * - (MAX_SHIFT * factor + extra);
                }

                // Rotace ryby (sledování kurzoru)
                const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90; // uprav +90 podle orientace ryby
                applyRybaTransform(targetX, targetY, angle);
            } else {
                // Ostatní prvky s limitem
                targetX = Math.max(-BOUND_LIMIT, Math.min(BOUND_LIMIT, targetX));
                targetY = Math.max(-BOUND_LIMIT, Math.min(BOUND_LIMIT, targetY));
                applyNormalTransform(element, targetX, targetY);
            }

            // Uložíme novou základní pozici
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
                // Pro rybu zachováme rotaci
                const currentRotate = element.style.transform.match(/rotate\([^)]*\)/);
                const rotatePart = currentRotate ? currentRotate[0] : 'rotate(0deg)';
                applyRybaTransform(baseX + jitterX, baseY + jitterY, parseFloat(rotatePart.match(/-?\d+\.?\d*/)[0]));
            } else {
                applyNormalTransform(element, baseX + jitterX, baseY + jitterY);
            }
        });
    }, 100);
}

function stopJitter() {
    if (jitterInterval) clearInterval(jitterInterval);
    jitterInterval = null;
}

function resetElementsPosition(initialize) {
    interactiveElements.forEach(element => {
        if (!initialize) {
            if (element.id === 'ryba-icon') {
                element.style.transform = 'translate(0, 0) rotate(0deg)';
            } else {
                element.style.transform = 'translate(0, 0)';
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
