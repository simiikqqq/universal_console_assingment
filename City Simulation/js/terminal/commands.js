window.Commands = {

    help() {
        const commandList = Object.keys(window.Commands)
            .map(cmd => `- ${cmd}`)
            .join("\n");

        return `Available commands:\n${commandList}`;
    },

    status() {
        const city = window.City || {};

        const population = city.population ?? 0;
        const money = city.money ?? 0;
        const energy = city.energy ?? 0;

        return `
City Status:
Population: ${population}
Budget: ${money}
Energy: ${energy}
        `;
    },

    clear() {
        if (window.Terminal) {
            Terminal.clear();
        }
        return null;
    }

};
