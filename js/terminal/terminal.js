window.Terminal = {
    init() {
        this.output = document.getElementById("terminal-output");
        this.input = document.getElementById("terminal-input");

        if (!this.output || !this.input) {
            console.error("Terminal elementy nenalezeny!");
            return;
        }

        this.input.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                const val = this.input.value.trim();
                if (!val) return;

                if (window.History) window.History.add(val);

                this.handleCommand(val);
                this.input.value = "";
            }

            if (e.key === "ArrowUp" && window.History) {
                e.preventDefault();
                this.input.value = window.History.previous();
            }

            if (e.key === "ArrowDown" && window.History) {
                e.preventDefault();
                this.input.value = window.History.next();
            }
        });
    },

    handleCommand(input) {
        this.print(`> ${input}`, "input");

        if (!window.Parser) {
            this.print("Parser nenalezen!", "error");
            return;
        }

        const result = window.Parser.parse(input);
        if (result) this.print(result, "system");

        this.scrollToBottom();
    },

    print(text, type = "system") {
        const div = document.createElement("div");
        div.className = `terminal-line ${type}`;
        div.innerHTML = text.replace(/\n/g, "<br>");
        this.output.appendChild(div);
    },

    clear() {
        this.output.innerHTML = "";
    },

    scrollToBottom() {
        this.output.scrollTop = this.output.scrollHeight;
    }
};
