"use strict";

window.ChatSystem = {

    messages: [],

    add(message) {

        this.messages.push(
            message
        );

        if (
            this.messages.length >
            100
        ) {

            this.messages.shift();

        }

        document.dispatchEvent(
            new CustomEvent(
                "chat:update",
                {
                    detail:
                        this.messages
                }
            )
        );

    },

    clear() {

        this.messages = [];

    },

    sanitize(text) {

        const element =
            document.createElement(
                "div"
            );

        element.textContent =
            String(text || "");

        return element.innerHTML;

    }

};