import { cityState } from './city.js';

export function updatePopulation() {
    // Základní růst (např. 2 lidé za den)
    let growth = 2;

    // Postih za nedostatek energie
    if (cityState.energyConsumption > cityState.energyProduction) {
        growth = -5; // Lidé odcházejí, protože nefunguje elektřina
    }

    // Postih, pokud dojdu peníze
    if (cityState.budget < 0) {
        growth -= 3;
    }

    cityState.population += growth;

    // Populace nemůže být záporná
    if (cityState.population < 0) cityState.population = 0;
}
