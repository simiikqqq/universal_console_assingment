// js/simulation/buildings.js
// Staví budovu, propojí s ekonomikou/energií a vyvolá event pro mapu (CityMap)

function buildBuilding(template) {
    const state = window.cityState;

    if (state.budget < template.cost) {
        return `Nedostatek peněz: potřeba ${template.cost} Kč`;
    }

    state.budget -= template.cost;
    state.energyProduction += (template.energyProduction || 0);
    state.energyConsumption += (template.energyConsumption || 0);

    const newBuilding = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        type: template.id,
        name: template.name,
        maintenance: template.maintenance || 0,
        incomeBonus: template.incomeBonus || 0,
        growthBonus: template.growthBonus || 0,
        populationCapacity: template.populationCapacity || 0
    };

    state.buildings.push(newBuilding);

    // Vizuální notifikace na mapě – umístí budovu na další volnou parcelu
    if (window.CityMap && typeof window.CityMap.addBuilding === 'function') {
        window.CityMap.addBuilding(template.id, newBuilding.id);
    }

    // Okamžitá aktualizace UI
    if (window.updateDashboard) window.updateDashboard();
    if (window.updateAllCharts) window.updateAllCharts();

    return `${template.name} postavena úspěšně. (-${template.cost} Kč)`;
}

window.buildBuilding = buildBuilding;
