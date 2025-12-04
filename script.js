const body = document.body;
const modeLabel = document.getElementById('mode-label');
const mainTitles = document.querySelectorAll('.main-title');

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
        document.addEventListener('mousemove', moveTitles);
        startJitter();
        // Zajistíme, že data-base-x/y jsou inicializovány na 0 (pro Jitter)
        resetTitlesPosition(true); 

    } else {
        // NORMAL REŽIM: Deaktivuje uhýbání, chvění a resetuje pozice
        document.removeEventListener('mousemove', moveTitles);
        stopJitter();
        resetTitlesPosition(false); // Resetuje na původní pozici (0,0)
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
 * Funkce, která posouvá texty pryč od kurzoru myši a ZACHOVÁVÁ POZICI.
 * @param {MouseEvent} e - Událost pohybu myši.
 */
function moveTitles(e) {
    if (body.classList.contains('dark-mode')) {
        mainTitles.forEach(title => {
            const rect = title.getBoundingClientRect();
            
            // Původní pozice prvku (bez aktuálního posunu) - JS ji musí uchovávat
            const titleBaseX = parseFloat(title.dataset.baseX) || 0;
            const titleBaseY = parseFloat(title.dataset.baseY) || 0;
            
            // Střed prvku (relativní k původní pozici)
            const titleCenterX = rect.left + rect.width / 2 - titleBaseX;
            const titleCenterY = rect.top + rect.height / 2 - titleBaseY;

            const dx = e.clientX - titleCenterX;
            const dy = e.clientY - titleCenterY;

            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < REACTION_DISTANCE) { 
                const factor = 1 - (distance / REACTION_DISTANCE);
                
                // Cílový posun (posun UTÍKÁNÍ)
                const targetTranslateX = (dx / distance) * -MAX_SHIFT * factor;
                const targetTranslateY = (dy / distance) * -MAX_SHIFT * factor;

                // Uložíme novou pozici, kam prvek uteče, pokud je myš blízko
                title.dataset.baseX = targetTranslateX.toFixed(2);
                title.dataset.baseY = targetTranslateY.toFixed(2);
            }
            
            // Aplikace transformace (posun + jitter se aplikuje v jitterLoop)
        });
    }
}

/**
 * Zapne neustálé, náhodné chvění (jitter).
 */
function startJitter() {
    // Zastavíme předchozí interval, pokud existuje
    if (jitterInterval) {
        clearInterval(jitterInterval);
    }
    
    jitterInterval = setInterval(() => {
        mainTitles.forEach(title => {
            // Aktuální "uhnutá" pozice
            const baseX = parseFloat(title.dataset.baseX) || 0;
            const baseY = parseFloat(title.dataset.baseY) || 0;
            
            // Náhodný posun pro chvění
            const jitterX = (Math.random() - 0.5) * JITTER_MAX * 2;
            const jitterY = (Math.random() - 0.5) * JITTER_MAX * 2;
            
            // Aplikace transformace: Uchovaná pozice + náhodné chvění
            title.style.transform = `translate(${baseX + jitterX}px, ${baseY + jitterY}px)`;
        });
    }, 100); // Rychlé, ale znatelné chvění každých 100ms
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
 * Resetuje pozici všech hlavních nadpisů (a jejich uložené pozice).
 * @param {boolean} initialize - Pokud true, jen inicializuje pozici na (0,0).
 */
function resetTitlesPosition(initialize) {
    mainTitles.forEach(title => {
        // Reset transformace pouze v light-mode
        if (!initialize) {
            title.style.transform = 'translate(0, 0)';
        }
        // Reset uložené pozice
        title.dataset.baseX = 0;
        title.dataset.baseY = 0;
    });
}

// Spuštění na začátku pro nastavení dark-mode a aktivaci chaosu.
// První volání nastaví dark-mode a aktivuje moveTitles a startJitter.
toggleMode();
