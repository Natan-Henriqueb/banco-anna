"use strict";

document.addEventListener(
    "DOMContentLoaded",
    () => {

        createBackgroundParticles();

        setupGlobalButtons();

    }
);

function createBackgroundParticles() {

    const container =
        document.querySelector(
            "#particles"
        );

    if (!container) {
        return;
    }

    const amount = 60;

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const particle =
            document.createElement(
                "span"
            );

        particle.className =
            "particle";

        particle.style.left =
            `${Math.random() * 100}%`;

        particle.style.top =
            `${Math.random() * 100}%`;

        particle.style.animationDelay =
            `${Math.random() * 10}s`;

        particle.style.animationDuration =
            `${5 + Math.random() * 10}s`;

        container.appendChild(
            particle
        );

    }

}

function setupGlobalButtons() {

    document
        .querySelectorAll(
            "[data-back]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        history.back();

                    }
                );

            }
        );

}

window.App = {

    notify(message) {

        console.log(
            "[APP]",
            message
        );

    },

    error(message) {

        console.error(
            "[APP]",
            message
        );

    }

};