// js/simulation/economy.js
// Daně z obyvatel + bonus příjem z obchodů – minus údržba všech budov

function updateEconomy() {
    const state = window.cityState;

    const taxes = Math.floor((state.population || 0) * 0.5);

    // Součet maintenance a incomeBonus ze všech budov (shop = +peníze)
    let maintenance = 0;
    let buildingIncome = 0;
    (state.buildings || []).forEach(b => {
        maintenance    += (b.maintenance  || 0);
        buildingIncome += (b.incomeBonus || 0);
    });

    state.income   = taxes + buildingIncome;
    state.expenses = maintenance;
    state.budget   += (state.income - state.expenses);
}

window.updateEconomy = updateEconomy;
