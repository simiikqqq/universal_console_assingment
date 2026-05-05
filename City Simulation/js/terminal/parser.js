// js/terminal/parser.js

window.Parser = {
    parse: function(input) {
        if (!input || typeof input !== 'string') {
            return "Žádný vstup.";
        }

        const trimmed = input.trim();
        if (!trimmed) {
            return null;  // prázdný řádek → nic nedělat
        }

        const parts = trimmed.split(/\s+/);
        const commandName = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Speciální příkaz build – má vlastní logiku
        if (commandName === "build") {
            if (!window.buildingsData) {
                return "CHYBA: Seznam budov nebyl načten (zkontroluj fetch v loadBuildings)";
            }
            if (!window.buildBuilding) {
                return "CHYBA: Funkce pro stavění budov není dostupná";
            }

            if (args.length === 0) {
                const available = window.buildingsData.map(b => b.id).join(", ");
                return "Použití: build <id>\nDostupné typy: " + available;
            }

            const buildingId = args[0].toLowerCase();
            const template = window.buildingsData.find(b => b.id.toLowerCase() === buildingId);

            if (!template) {
                const available = window.buildingsData.map(b => b.id).join(", ");
                return `Neznámý typ budovy: "${buildingId}"\nDostupné: ${available}`;
            }

            const result = window.buildBuilding(template);

            // Pokud chceme notifikaci při úspěchu
            if (window.showNotification && result.includes("postavena")) {
                window.showNotification(result);
            }

            return result;
        }

        // Normální příkazy z window.Commands
        if (!window.Commands) {
            return "Systém příkazů není načtený (zkontroluj commands.js)";
        }

        const commandFunc = window.Commands[commandName];

        if (!commandFunc || typeof commandFunc !== 'function') {
            return `Neznámý příkaz: ${commandName}\nNapiš help pro seznam příkazů.`;
        }

        try {
            // Předáme argumenty, pokud nějaké jsou
            const output = args.length > 0 
                ? commandFunc(...args) 
                : commandFunc();

            // Pokud příkaz vrací null (např. clear), nic nevypisujeme
            return output !== null && output !== undefined ? output : null;
        }
        catch (error) {
            console.error("Chyba při spuštění příkazu:", commandName, error);
            return `CHYBA při provádění příkazu "${commandName}": ${error.message || "neznámá chyba"}`;
        }
    }
};
