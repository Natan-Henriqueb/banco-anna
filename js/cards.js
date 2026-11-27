"use strict";

window.CardSystem = {

    current: null,

    show(card) {

        this.current =
            card;

        const event =
            new CustomEvent(
                "game:card",
                {
                    detail: card
                }
            );

        document.dispatchEvent(
            event
        );

    },

    hide() {

        this.current =
            null;

    }

};