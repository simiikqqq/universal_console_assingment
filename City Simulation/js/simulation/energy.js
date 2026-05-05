function updateEnergy() {
    const balance = window.cityState.energyProduction - window.cityState.energyConsumption;
    window.cityState.energy = Math.max(0, Math.min(100, window.cityState.energy + balance * 0.1));

    if (window.cityState.energyConsumption > window.cityState.energyProduction) {
        window.cityState.happiness = Math.max(0, window.cityState.happiness - 1);
    } else {
        window.cityState.happiness = Math.min(100, window.cityState.happiness + 0.5);
    }
}
