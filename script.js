const body = document.body;
const interactableElements = document.querySelectorAll('.dark-mode .interactable');
const modeSwitcher = document.getElementById('mode-switcher');
const modeLabel = document.getElementById('mode-label');
const mainTitles = document.querySelectorAll('.main-title');

// Maximální posun v pixelech, jak daleko se text posune od kurzoru
const MAX_SHIFT = 60; 

/**
 * Přepíná mezi tmavým ("ZÁBAVNÝ") a světlým ("NORMAL") režimem.
 */
function toggleMode() {
    // 1. Přepnutí třídy na <body>
    const isDarkMode = body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode', !isDarkMode);

    // 2. Aktualizace popisku přepínače
    modeLabel.textContent = isDarkMode ? 'ZÁBAVNÝ REŽIM' : 'NORMAL REŽIM';

    // 3. Aktualizace posluchačů událostí
    if (isDarkMode) {
        // ZÁBAVNÝ REŽIM: Aktivuje uhýbání
        document.addEventListener('mousemove', moveTitles);
        // Zabrání navigaci
        mainTitles.forEach(title => title.style.pointerEvents = 'auto'); 
    } else {
        // NORMAL REŽIM: Deaktivuje uhýbání a resetuje pozice
        document.removeEventListener('mousemove', moveTitles);
        resetTitles();
        // Povolí klikání na odkazy
        mainTitles.forEach(title => title.style.pointerEvents = 'auto'); 
    }
    
    // Změna odkazů na normální chování v light módu
    document.querySelectorAll('.interactable').forEach(a => {
        if (!isDarkMode) {
            // V light módu se použije skutečný odkaz
            a.href = a.getAttribute('data-url');
            a.onclick = null; // Odebereme JavaScriptový handler
        } else {
            // V dark módu se klikání zabrání a použije se jen #
            a.href = "#";
            a.onclick = (e) => e.preventDefault();
        }
    });
}

/**
 * Funkce, která posouvá texty pryč od kurzoru myši (efekt "uhýbání").
 * Aplikuje se POUZE v tmavém (zábavném) režimu.
 * @param {MouseEvent} e - Událost pohybu myši.
 */
function moveTitles(e) {
    if (body.classList.contains('dark-mode')) {
        mainTitles.forEach(title => {
            const rect = title.getBoundingClientRect();
            // Střed prvku
            const titleCenterX = rect.left + rect.width / 2;
            const titleCenterY = rect.top + rect.height / 2;

            // Vzdálenost kurzoru od středu prvku
            const dx = e.clientX - titleCenterX;
            const dy = e.clientY - titleCenterY;

            // Vzdálenost
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Výpočet posunu: čím blíže, tím větší posun (až do MAX_SHIFT)
            if (distance < 200) { // Pouze pokud je kurzor v blízkosti 200px
                const factor = 1 - (distance / 200); // 1.0 je max posun, 0.0 je žádný
                
                // Směr posunu je opačný než směr ke kurzoru
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

// Spuštění na začátku pro nastavení dark-mode
toggleMode();
