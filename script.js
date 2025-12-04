const body = document.body;
const modeLabel = document.getElementById('mode-label');

// KLÍČOVÁ ZMĚNAa: VŠECHNY prvky, včetně .sub-text
const interactiveElements = document.querySelectorAll(
    '#name, #description, .main-title, .sub-text, .game-icon'
);

// Maximální posun po uhnutí (relativně k původní pozici)
const MAX_SHIFT = 600; 
// Vzdálenost, ve které prvek začne reagovat
const REACTION_DISTANCE = 800; 

// NOVÉ OMEZENÍ: Jak daleko se prvek smí posunout od původního středu (v px)
const BOUND_LIMIT = 150; 

// Nastavení pro náhodné chvění
const JITTER_MAX = 2; // Maximální náhodný posun v pixelech
let jitterInterval; 

/**
 * Přepíná mezi tmavým (CHAOS) a světlým (NORMAL) režimem.
 */
function toggleMode() {
    const isDarkMode = body.classList.contains('dark-mode');
    
    body.classList.toggle('dark-mode', !isDarkMode);
    body.classList.toggle('light-mode', isDarkMode);
    
    const isNewDarkMode = body.classList.contains('dark-mode');

    modeLabel.textContent = isNewDarkMode ? 'ZÁBAVNÝ REŽIM (CHAOS)' : 'NORMAL REŽIM';

    if (isNewDarkMode) {
        document.addEventListener('mousemove', moveElements); 
        startJitter();
        resetElementsPosition(true); 

    } else {
        document.removeEventListener('mousemove', moveElements); 
        stopJitter();
        resetElementsPosition(false); 
    }
    
    // Nastavení klikatelnosti odkazů
    document.querySelectorAll('.interactable').forEach(a => {
        if (!isNewDarkMode) {
            a.href = a.getAttribute('data-url');
            a.onclick = null;
        } else {
            a.href = "#";
            a.onclick = (e) => e.preventDefault();
        }
    });
}

/**
 * Funkce, která posouvá VŠECHNY interaktivní prvky a OMEZUJE JEJICH POSUN.
 * @param {MouseEvent} e - Událost pohybu myši.
 */
function moveElements(e) {
    if (body.classList.contains('dark-mode')) {
        interactiveElements.forEach(element => { 
            const rect = element.getBoundingClientRect();
            
            // Původní pozice prvku (bez aktuálního posunu)
            const elementBaseX = parseFloat(element.dataset.baseX) || 0;
            const elementBaseY = parseFloat(element.dataset.baseY) || 0;
            
            // Střed prvku (relativní k původní pozici)
            const elementCenterX = rect.left + rect.width / 2 - elementBaseX;
            const elementCenterY = rect.top + rect.height / 2 - elementBaseY;

            const dx = e.clientX - elementCenterX;
            const dy = e.clientY - elementCenterY;

            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < REACTION_DISTANCE) { 
                const factor = 1 - (distance / REACTION_DISTANCE);
                
                // Cílový posun (posun UTÍKÁNÍ)
                let targetTranslateX = (dx / distance) * -MAX_SHIFT * factor;
                let targetTranslateY = (dy / distance) * -MAX_SHIFT * factor;

                // --- KLÍČOVÁ IMPLEMENTACE OMEZENÍ ---
                targetTranslateX = Math.max(-BOUND_LIMIT, Math.min(BOUND_LIMIT, targetTranslateX));
                targetTranslateY = Math.max(-BOUND_LIMIT, Math.min(BOUND_LIMIT, targetTranslateY));
                
                // Uložíme OMEZENOU pozici
                element.dataset.baseX = targetTranslateX.toFixed(2);
                element.dataset.baseY = targetTranslateY.toFixed(2);
            }
            // POZNÁMKA: Pokud myš opustí zónu (distance > REACTION_DISTANCE), uložená pozice se NEVRACÍ na nulu. 
            // Zůstane tam, kam prvek utekl naposledy, splňující požadavek.
        });
    }
}

/**
 * Zapne neustálé, náhodné chvění (jitter) pro VŠECHNY prvky.
 */
function startJitter() {
    if (jitterInterval) {
        clearInterval(jitterInterval);
    }
    
    jitterInterval = setInterval(() => {
        interactiveElements.forEach(element => { 
            // Aktuální "uhnutá" pozice
            const baseX = parseFloat(element.dataset.baseX) || 0;
            const baseY = parseFloat(element.dataset.baseY) || 0;
            
            // Náhodný posun pro chvění
            const jitterX = (Math.random() - 0.5) * JITTER_MAX * 2;
            const jitterY = (Math.random() - 0.5) * JITTER_MAX * 2;
            
            // Aplikace transformace: Uchovaná pozice + náhodné chvění
            element.style.transform = `translate(${baseX + jitterX}px, ${baseY + jitterY}px)`;
        });
    }, 100); 
}

/**
 * Vypne chvění.
 */
function stopJitter() {
    if (jitterInterval) {
        clearInterval(jitterInterval);
        jitterInterval = null;
    }
}

/**
 * Resetuje pozici všech prvků (a jejich uložené pozice).
 */
function resetElementsPosition(initialize) {
    interactiveElements.forEach(element => { 
        if (!initialize) {
            element.style.transform = 'translate(0, 0)';
        }
        element.dataset.baseX = 0;
        element.dataset.baseY = 0;
    });
}

// Spuštění na začátku
toggleMode();
