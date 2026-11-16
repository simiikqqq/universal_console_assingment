    function updateDashboard() {
        const state = window.cityState || {};

        // Stav města
        document.getElementById("ui-population").textContent = (state.population || 0).toLocaleString('cs-CZ');
        document.getElementById("ui-money").textContent     = (state.budget || 0).toLocaleString('cs-CZ');
        document.getElementById("ui-energy").textContent    = Math.round(state.energy || 0);
        document.getElementById("ui-day").textContent       = state.day || 0;

        // Kompaktní seznam budov: "Obytný dům (3)"
        const buildingsContainer = document.getElementById("ui-buildings");
        if (buildingsContainer) {
            buildingsContainer.innerHTML = '';

            const buildings = state.buildings || [];
            
            if (buildings.length === 0) {
                buildingsContainer.innerHTML = '<span style="color:#8b949e">Zatím žádné budovy</span>';
            } else {
                // Seskupení podle typu
                const grouped = {};
                buildings.forEach(b => {
                    const name = b.name || b.type || "Neznámá budova";
                    grouped[name] = (grouped[name] || 0) + (b.count || 1);
                });

                Object.keys(grouped).forEach(name => {
                    const count = grouped[name];
                    const span = document.createElement('span');
                    span.textContent = `${name} (${count})`;
                    buildingsContainer.appendChild(span);
                });
            }
        }

        // Aktualizace grafů
        if (typeof addToChart === 'function') {
            addToChart('population', state.population || 0);
            addToChart('budget',     state.budget || 0);
            addToChart('energy',     state.energy || 0);
        }

        if (typeof updateAllCharts === 'function') {
            updateAllCharts();
        }
    }

    window.updateDashboard = updateDashboard;
