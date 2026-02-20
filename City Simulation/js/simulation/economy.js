import { cityState } from './city.js';

export function updateEconomy() {
    // Příjem: 10 peněz za každého obyvatele
    const taxes = Math.floor(cityState.population * 0.5);
    
    // Výdaje: Každá budova v poli cityState.buildings může mít maintenance
    const maintenance = cityState.buildings.length * 20;

    cityState.budget += (taxes - maintenance);
}
