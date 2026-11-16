async function loadBuildings() {
    try {
        const response = await fetch('data/buildings.json');
        window.buildingsData = await response.json();
        console.log("Načteny budovy:", window.buildingsData);
    } catch (err) {
        console.error("Chyba při načítání budov:", err);
    }
}

window.loadBuildings = async function() {
    try {
        // Zkus různé možné cesty – vyber si tu správnou podle tvé struktury
        const possiblePaths = [
            'data/buildings.json',
            '/data/buildings.json',
            'buildings.json',
            '/buildings.json'
        ];

        let response = null;
        for (const path of possiblePaths) {
            try {
                response = await fetch(path);
                if (response.ok) break;
            } catch {}
        }

        if (!response || !response.ok) {
            throw new Error("buildings.json se nepodařilo najít na žádné cestě");
        }

        window.buildingsData = await response.json();
        console.log("Budovy načteny úspěšně:", window.buildingsData);
        return true;
    } catch (err) {
        console.error("CHYBA při načítání budov:", err);
        return false;
    }
};

window.Commands = {
    help() {
        const list = Object.keys(window.Commands)
            .filter(k => typeof window.Commands[k] === 'function')
            .sort()
            .map(k => `  ${k}`)
            .join('\n');
        return `Dostupné příkazy:\n${list}\n\nPříklady:\nbuild powerplant\ncity_status\nnext_day`;
    },

    clear() {
        if (window.Terminal) window.Terminal.clear();
        return null;
    },

    city_status() {
        const c = window.cityState || {};
        const bal = (c.energyProduction || 0) - (c.energyConsumption || 0);
        return `
Stav města (den ${c.day || 0}):
  Obyvatelé:    ${c.population || 0}
  Rozpočet:     ${c.budget || 0} Kč
  Energie:      ${c.energy || 0}% (${bal >= 0 ? '+' : ''}${bal})
  Spokojenost:  ${c.happiness || 0}%
  Budov:        ${c.buildings?.length || 0}
        `.trim();
    },

    population() {
        return `Obyvatelé: ${window.cityState?.population || 0}`;
    },

    economy() {
        const c = window.cityState || {};
        return `Rozpočet: ${c.budget || 0} Kč\nPříjem/den: ${c.income || 0}\nVýdaje/den: ${c.expenses || 0}`;
    },

    energy_status() {
        const c = window.cityState || {};
        const bal = (c.energyProduction || 0) - (c.energyConsumption || 0);
        return `Energie:\n  Produkce: ${c.energyProduction || 0}\n  Spotřeba: ${c.energyConsumption || 0}\n  Bilance: ${bal >= 0 ? '+' : ''}${bal}\n  Úroveň: ${c.energy || 0}%`;
    },

    buildings() {
        const bs = window.cityState?.buildings || [];
        if (!bs.length) return "Žádné budovy.";
        return bs.map((b,i) => `${i+1}. ${b.name} (${b.maintenance} Kč/den)`).join('\n');
    },

    freeze() {
        window.cityState.isPaused = true;
        return "Simulace pozastavena.";
    },

    resume() {
        window.cityState.isPaused = false;
        return "Simulace obnovena.";
    },

    next_day() {
        if (window.simulateDay) {
            window.simulateDay();
            return "Posunut o jeden den.";
        }
        return "Chyba: simulateDay není dostupná.";
    },

    money() {
        return `Rozpočet: ${window.cityState?.budget || 0} Kč`;
    },

    power(arg = '') {
        arg = arg.toLowerCase();
        if (arg === 'on') {
            window.cityState.energyProduction = Math.round((window.cityState.energyProduction || 0) * 1.2);
            return "Elektrárny na plný výkon (+20%).";
        }
        if (arg === 'off') {
            window.cityState.energyProduction = Math.round((window.cityState.energyProduction || 0) * 0.5);
            return "Výroba energie snížena (-50%).";
        }
        return "Použití: power on | power off";
    },
    loan(amount) {
        return window.requestLoan(parseInt(amount, 10));
    },
    yes() {
        if (window.bankState?.pendingOffer) return window.confirmLoan();
        return "Neni co potvrdit.";
    },
    no() {
        if (window.bankState?.pendingOffer) return window.cancelLoan();
        return "Neni co zrusit.";
    },
    loan_status() {
        const l = window.bankState?.activeLoan;
        if (!l) return "Zadna aktivni pujcka.";
        return `Aktivni pujcka: ${l.weeklyPayment} Kc/tyden, zbyva ${l.remainingWeeks} tydnu.`;
    }
};
