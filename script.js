const body = document.body;
const modeLabel = document.getElementById('mode-label');
const mainTitles = document.querySelectorAll('.main-title');

// Zvýšená hodnota: maximální posun (v pixelech)
const MAX_SHIFT = 250; 
// Zvýšená hodnota: vzdálenost v pixelech, ve které prvek začne reagovat
const REACTION_DISTANCE = 300; 

/**
 * Přepíná mezi tmavým ("ZÁBAVNÝ WILD") a světlým ("NORMAL") režimem.
 */
function toggleMode() {
    const isDarkMode = body.classList.contains('dark-mode');
    
    // Tady probíhá přepnutí
    body.classList.toggle('dark-mode', !isDarkMode);
    body.classList.toggle('light-mode', isDarkMode);
    
    // V "WILD" režimu je třída wild-mode na body (pro Dark)
    body.classList.toggle('wild-mode', !isDarkMode);

    const isNewDarkMode = body.classList.contains('dark-mode');

    // 2. Aktualizace popisku přepínače
    modeLabel.textContent = isNewDarkMode ? 'ZÁBAVNÝ REŽIM (WILD)' : 'NORMAL REŽIM';

    // 3. Aktivace/Deaktivace
    if (isNewDarkMode) {
        // ZÁBAVNÝ REŽIM: Aktivuje uhýbání
        document.addEventListener('mousemove', moveTitles);
    } else {
        // NORMAL REŽIM: Deaktivuje uhýbání a resetuje pozice
        document.removeEventListener('mousemove', moveTitles);
        resetTitles();
    }
    
    // Nastavení klikatelnosti odkazů
    document.querySelectorAll('.interactable').forEach(a => {
        if (!isNewDarkMode) {
            // Light mód: Normální odkaz a klikání
            a.href = a.getAttribute('data-url');
            a.onclick = null;
        } else {
            // Dark mód: Zabrání kliknutí
            a.href = "#";
            a.onclick = (e) => e.preventDefault();
        }
    });
}

/**
 * Funkce, která posouvá texty hrůzou pryč od kurzoru myši.
 * Zrychlený posun a velká reakční vzdálenost pro "WILD" efekt.
 * @param {MouseEvent} e - Událost pohybu myši.
 */
function moveTitles(e) {
    if (body.classList.contains('wild-mode')) {
        mainTitles.forEach(title => {
            const rect = title.getBoundingClientRect();
            // Střed prvku
            const titleCenterX = rect.left + rect.width / 2;
            const titleCenterY = rect.top + rect.height / 2;

            // Vzdálenost kurzoru od středu prvku
            const dx = e.clientX - titleCenterX;
            const dy = e.clientY - titleCenterY;

            // Vzdálenost (Pythagoras)
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Pokud je kurzor v reakční zóně
            if (distance < REACTION_DISTANCE) { 
                // Výpočet faktoru: 1.0 = max posun, 0.0 = žádný posun
                const factor = 1 - (distance / REACTION_DISTANCE);
                
                // Směr posunu je OPAČNÝ než směr ke kurzoru, text U-T-Í-K-Á
                // Normalizované DX a DY (směr) * MAX_SHIFT (síla) * factor (blízkost)
                const translateX = (dx / distance) * -MAX_SHIFT * factor;
                const translateY = (dy / distance) * -MAX_SHIFT * factor;

                // Aplikace transformace
                title.style.transform = `translate(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px)`;
            } else {
                // Vrátit zpět, pokud je kurzor daleko
                title.style.transform = 'translate(0, 0)';
            }
        });
    }
}

/**
 * Resetuje pozici všech hlavních nadpisů.
 */
function resetTitles() {
    mainTitles.forEach(title => {
        title.style.transform = 'translate(0, 0)';
    });
}

// Spuštění na začátku: Nastaví body jako dark-mode/wild-mode a aktivuje posluchače.
toggleMode();
