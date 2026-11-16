window.History = {
    commands: [],
    index: -1,

    add(cmd) {
        this.commands.push(cmd);
        this.index = this.commands.length;
    },

    previous() {
        if (this.index > 0) this.index--;
        return this.commands[this.index] || "";
    },

    next() {
        if (this.index < this.commands.length - 1) {
            this.index++;
            return this.commands[this.index];
        }
        this.index = this.commands.length;
        return "";
    }
};
