const body = document.body;
const modeLabel = document.getElementById('mode-label');

// KLÍČOVÁ ZMĚNA: Vybereme VŠECHNY prvky s data-base-x/y atributem
const interactiveElements = document.querySelectorAll(
    '#name, #description, .main-title, .sub-text, .game-icon'
);

// Zvýšené hodnoty pro silnější reakci
const MAX_SHIFT = 600; // Maximální posun po uhnutí
const REACTION_DISTANCE = 800; // Vzdálenost, ve které prvek začne reagovat

// Nastavení pro náhodné chvění
const JITTER_MAX = 2; // Maximální náhodný posun v pixelech
let jitterInterval; // Proměnná pro ukládání intervalu chvění

/**
 * Přepíná mezi tmavým (CHAOS) a světlým (NORMAL) režimem.
 */
function toggleMode() {
    const isDarkMode = body.classList.contains('dark-mode');
    
    // Tady probíhá přepnutí
    body.classList.toggle('dark-mode', !isDarkMode);
    body.classList.toggle('light-mode', isDarkMode);
    
    const isNewDarkMode = body.classList.contains('dark-mode');

    // 2. Aktualizace popisku přepínače
    modeLabel.textContent = isNewDarkMode ? 'ZÁBAVNÝ REŽIM (CHAOS)' : 'NORMAL REŽIM';

    // 3. Aktivace/Deaktivace chaosu
    if (isNewDarkMode) {
        // ZÁBAVNÝ REŽIM: Aktivuje uhýbání a chvění
        document.addEventListener('mousemove', moveElements); // Změna názvu funkce
        startJitter();
        // Zajistíme, že data-base-x/y jsou inicializovány na 0 (pro Jitter)
        resetElementsPosition(true); 

    } else {
        // NORMAL REŽIM: Deaktivuje uhýbání, chvění a resetuje pozice
        document.removeEventListener('mousemove', moveElements); // Změna názvu funkce
        stopJitter();
        resetElementsPosition(false); // Resetuje na původní pozici (0,0)
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
 * Funkce, která posouvá VŠECHNY interaktivní prvky pryč od kurzoru myši a ZACHOVÁVÁ POZICI.
 * @param {MouseEvent} e - Událost pohybu myši.
 */
function moveElements(e) {
    if (body.classList.contains('dark-mode')) {
        interactiveElements.forEach(element => { // Iterujeme přes VŠECHNY prvky
            const rect = element.getBoundingClientRect();
            
            // Původní pozice prvku (bez aktuálního posunu) - JS ji musí uchovávat
            const elementBaseX = parseFloat(element.dataset.baseX) || 0;
            const elementBaseY = parseFloat(element.dataset.baseY) || 0;
            
            // Střed prvku (relativní k původní pozici)
            // Používáme rect.left/top, ale musíme odečíst uchovanou bázi, aby výpočet byl správný
            const elementCenterX = rect.left + rect.width / 2 - elementBaseX;
            const elementCenterY = rect.top + rect.height / 2 - elementBaseY;

            const dx = e.clientX - elementCenterX;
            const dy = e.clientY - elementCenterY;

            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < REACTION_DISTANCE) { 
                const factor = 1 - (distance / REACTION_DISTANCE);
                
                // Cílový posun (posun UTÍKÁNÍ)
                const targetTranslateX = (dx / distance) * -MAX_SHIFT * factor;
                const targetTranslateY = (dy / distance) * -MAX_SHIFT * factor;

                // Uložíme novou pozici, kam prvek uteče, pokud je myš blízko
                element.dataset.baseX = targetTranslateX.toFixed(2);
                element.dataset.baseY = targetTranslateY.toFixed(2);
            }
            
            // Aplikace transformace (posun + jitter se aplikuje v jitterLoop)
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
        interactiveElements.forEach(element => { // Iterujeme přes VŠECHNY prvky
            // Aktuální "uhnutá" pozice
            const baseX = parseFloat(element.dataset.baseX) || 0;
            const baseY = parseFloat(element.dataset.baseY) || 0;
            
            // Náhodný posun pro chvění
            const jitterX = (Math.random() - 0.5) * JITTER_MAX * 2;
            const jitterY = (Math.random() - 0.5) * JITTER_MAX * 2;
            
            // Aplikace transformace: Uchovaná pozice + náhodné chvění
            element.style.transform = `translate(${baseX + jitterX}px, ${baseY + jitterY}px)`;
        });
    }, 100); // Rychlé chvění každých 100ms
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
 * @param {boolean} initialize - Pokud true, jen inicializuje pozici na (0,0).
 */
function resetElementsPosition(initialize) {
    interactiveElements.forEach(element => { // Iterujeme přes VŠECHNY prvky
        // Reset transformace pouze v light-mode
        if (!initialize) {
            element.style.transform = 'translate(0, 0)';
        }
        // Reset uložené pozice
        element.dataset.baseX = 0;
        element.dataset.baseY = 0;
    });
}

// Spuštění na začátku
toggleMode();
