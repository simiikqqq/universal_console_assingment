import { cityState } from './city.js';

export function updateEnergy() {
    // Energetická bilance: produkce - spotřeba
    const balance = cityState.energyProduction - cityState.energyConsumption;
    
    // Aktualizace zbývající energie (0-100%)
    cityState.energy = Math.max(0, Math.min(100, cityState.energy + balance * 0.1));
    
    // Pokud energií nedostává, má to negativní vliv
    if (cityState.energyConsumption > cityState.energyProduction) {
        // Snížení štěstí
        cityState.happiness = Math.max(0, cityState.happiness - 1);
    } else {
        // Zlepšení štěstí, když je elektřina v přebytku
        cityState.happiness = Math.min(100, cityState.happiness + 0.5);
    }
}
