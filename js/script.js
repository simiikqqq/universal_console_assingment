// js/script.js – hlavní entry point

document.addEventListener("DOMContentLoaded", async () => {
    console.log("=== City Manager – inicializace start ===");

    // 1. Načtení budov
    if (typeof window.loadBuildings === "function") {
        try {
            const success = await window.loadBuildings();
            console.log(success ? "Budovy načteny OK" : "Budovy nenalezeny");
        } catch (err) {
            console.error("Chyba při načítání budov:", err);
        }
    }

    // 2. Inicializace mapy města
    if (window.CityMap && typeof window.CityMap.init === "function") {
        try {
            window.CityMap.init('city-map');
        } catch (err) {
            console.error("Chyba při inicializaci CityMap:", err);
        }
    }

    // 3. Inicializace terminálu
    if (window.Terminal && typeof window.Terminal.init === "function") {
        try {
            window.Terminal.init();
            console.log("Terminál inicializován");
        } catch (err) {
            console.error("Chyba při inicializaci terminálu:", err);
        }
    }

    // 4. Spuštění automatické simulace
    if (typeof window.startSimulation === "function") {
        try {
            window.startSimulation();
            console.log("Simulace spuštěna");
        } catch (err) {
            console.error("Chyba při spuštění simulace:", err);
        }
    }

    // 5. Prvotní aktualizace UI
    if (typeof window.updateDashboard === "function") window.updateDashboard();
    if (typeof window.updateAllCharts === "function") window.updateAllCharts();
    if (typeof window.initAnimations === "function")  window.initAnimations();

    // Sync počátečních lidí na mapě s populací
    if (window.CityMap && window.cityState) {
        window.CityMap.setPopulation(window.cityState.population);
    }

    // 6. Periodický UI refresh
    setInterval(() => {
        if (typeof window.updateDashboard === "function") window.updateDashboard();
        if (typeof window.updateAllCharts === "function") window.updateAllCharts();
    }, 1500);

    console.log("=== Inicializace dokončena ===");
});
