import { cityState } from './city.js';

/**
 * Funkce pro postavení budovy.
 * @param {Object} buildingTemplate - Objekt z buildings.json
 */
export function buildBuilding(buildingTemplate) {
    // 1. Kontrola peněz
    if (cityState.budget < buildingTemplate.cost) {
        return `Chyba: Nedostatek financí (potřebuješ ${buildingTemplate.cost} Kč).`;
    }

    // 2. Provedení transakce
    cityState.budget -= buildingTemplate.cost;
    
    // 3. Aktualizace energetické bilance
    cityState.energyProduction += buildingTemplate.energyProduction;
    cityState.energyConsumption += buildingTemplate.energyConsumption;

    // 4. Přidání do seznamu postavených budov
    cityState.buildings.push({
        id: Date.now(),
        type: buildingTemplate.id,
        name: buildingTemplate.name,
        maintenance: buildingTemplate.maintenance
    });

    return `Úspěch: ${buildingTemplate.name} byla postavena.`;
}
