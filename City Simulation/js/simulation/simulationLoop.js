function startSimulation() {
    setInterval(() => {
        if (!window.cityState.isPaused) {
            updateEconomy();
            updatePopulation();
            updateEnergy();
            
            // 🏦 Týdenní splátka půjčky (kontroluje se každý den)
            if (typeof window.processBankPayment === 'function') {
                window.processBankPayment();
            }
            
            window.cityState.day++;

            if (window.updateDashboard) window.updateDashboard();
            if (window.updateAllCharts) window.updateAllCharts();
            if (window.updateChart) window.updateChart();

            if (window.showNotification) {
                window.showNotification(`Den ${window.cityState.day} dokoncen`);
            }
        }
    }, 3000);
}

function simulateDay() {
    if (!window.cityState.isPaused) {
        updateEconomy();
        updatePopulation();
        updateEnergy();
        
        // 🏦 Týdenní splátka půjčky
        if (typeof window.processBankPayment === 'function') {
            window.processBankPayment();
        }
        
        window.cityState.day++;

        if (window.updateDashboard) window.updateDashboard();
        if (window.updateAllCharts) window.updateAllCharts();
        if (window.updateChart) window.updateChart();
        if (window.showNotification) {
            window.showNotification(`Simulovan den ${window.cityState.day}`);
        }
    }
}

window.startSimulation = startSimulation;
window.simulateDay = simulateDay;
