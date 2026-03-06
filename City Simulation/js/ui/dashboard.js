import { formatNumber, percentage } from "../utils/helpers.js";

export function initDashboard(data) {
    const dashboard = document.getElementById("dashboard");

    dashboard.innerHTML = `
        <div class="card">
            <h2>Město: ${data.name}</h2>
            <p>Populace: <span class="stat">${formatNumber(data.population)}</span></p>
            <p>Rozpočet: <span class="stat">${formatNumber(data.budget)} Kč</span></p>
            <p>Energie: <span class="stat">${percentage(data.energy)}</span></p>
            <p>Spokojenost: <span class="stat">${percentage(data.happiness)}</span></p>
        </div>
    `;
}
