import { cityState } from './city.js';
import { updateEconomy } from './economy.js';
import { updatePopulation } from './population.js';
import { updateEnergy } from './energy.js';

export function startSimulation() {
    setInterval(() => {
        if (!cityState.isPaused) {
            // Davidovy výpočty
            updateEconomy(); 
            updatePopulation();
            updateEnergy();
            cityState.day++;
            
            console.log("Simulace běží, den:", cityState.day);
        }
    }, 3000); // Nový den každé 3 sekundy
}
