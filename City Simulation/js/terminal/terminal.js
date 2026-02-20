window.Terminal = {

    init() {
        this.output = document.getElementById("terminal-output");
        this.input = document.getElementById("terminal-input");

        if (!this.output || !this.input) {
            console.error("Terminal DOM elements not found!");
            return;
        }

        this.input.addEventListener("keydown", (e) => {

            if (e.key === "Enter") {
                const value = this.input.value.trim();
                if (!value) return;

                if (window.History) {
                    History.add(value);
                }

                this.handleCommand(value);
                this.input.value = "";
            }

            if (e.key === "ArrowUp" && window.History) {
                e.preventDefault();
                this.input.value = History.previous();
            }

            if (e.key === "ArrowDown" && window.History) {
                e.preventDefault();
                this.input.value = History.next();
            }

        });
    },

    handleCommand(input) {
        this.print(`> ${input}`, "user");

        if (!window.Parser) {
            this.print("Parser not found!", "error");
            return;
        }

        const result = Parser.parse(input);

        if (result) {
            this.print(result, "system");
        }

        this.scrollToBottom();
    },

    print(text, type = "system") {
        const line = document.createElement("div");
        line.classList.add("terminal-line", type);
        line.innerHTML = text.replace(/\n/g, "<br>");
        this.output.appendChild(line);
    },

    clear() {
        this.output.innerHTML = "";
    },

    scrollToBottom() {
        this.output.scrollTop = this.output.scrollHeight;
    }

};
