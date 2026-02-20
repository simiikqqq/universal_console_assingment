window.Parser = {

    parse(input) {
        const parts = input.trim().split(" ");
        const commandName = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (!window.Commands) {
            return "Commands system not loaded.";
        }

        const command = Commands[commandName];

        if (!command) {
            return `Unknown command: ${commandName}`;
        }

        return command(args);
    }

};
