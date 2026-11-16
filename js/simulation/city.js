// js/simulation/city.js
// Začínáme s malým městem (10 obyvatel) – roste postupně, odpovídá mapě

window.cityState = {
    population: 10,
    budget: 5000,
    energyProduction: 0,
    energyConsumption: 0,
    energy: 100,
    happiness: 50,
    buildings: [],
    day: 1,
    isPaused: false,
    income: 0,
    expenses: 0
};
