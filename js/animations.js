"use strict";

window.AnimationSystem = {

    playDice(element) {

        if (!element) {
            return;
        }

        element.classList.remove(
            "dice-rolling"
        );

        void element.offsetWidth;

        element.classList.add(
            "dice-rolling"
        );

    },

    movePiece(
        element,
        x,
        y
    ) {

        if (!element) {
            return;
        }

        element.style.transform =
            `translate(${x}px, ${y}px)`;

    },

    pulse(element) {

        if (!element) {
            return;
        }

        element.classList.add(
            "pulse"
        );

        setTimeout(
            () => {

                element.classList.remove(
                    "pulse"
                );

            },
            700
        );

    }

};