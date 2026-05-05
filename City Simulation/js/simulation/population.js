// js/simulation/population.js
// Populace roste podle ubytovací kapacity (obytné domy) + bonusy ze školy/parku

function updatePopulation() {
    const state = window.cityState;

    // Součet kapacity všech obytných budov
    let capacity = 0;
    let growthBonus = 0;
    (state.buildings || []).forEach(b => {
        capacity    += (b.populationCapacity || 0);
        growthBonus += (b.growthBonus || 0);
    });

    // Základní přírůstek
    let growth = 1 + growthBonus;

    // Bez kapacity může růst jen do hranice 10 (základní osídlení)
    if (state.population >= capacity + 10) {
        growth = 0;
    }

    // Problémy = úbytek
    if (state.energyConsumption > state.energyProduction && state.energyProduction > 0) {
        growth = -3;
    }
    if (state.budget < 0) {
        growth -= 2;
    }

    state.population += growth;
    if (state.population < 0) state.population = 0;

    // Synchronizace počtu teček na mapě
    if (window.CityMap && typeof window.CityMap.setPopulation === 'function') {
        window.CityMap.setPopulation(state.population);
    }
}

window.updatePopulation = updatePopulation;
