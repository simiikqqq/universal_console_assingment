const History = {

    commands: [],
    index: -1,

    add(command) {
        this.commands.push(command);
        this.index = this.commands.length;
    },

    previous() {
        if (this.index > 0) {
            this.index--;
        }
        return this.commands[this.index] || "";
    },

    next() {
        if (this.index < this.commands.length - 1) {
            this.index++;
            return this.commands[this.index];
        } else {
            this.index = this.commands.length;
            return "";
        }
    }

};
