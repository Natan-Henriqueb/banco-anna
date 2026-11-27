"use strict";

window.ProfileSystem = {

    key:
        "banco-imobiliario-profile",

    get() {

        const saved =
            localStorage.getItem(
                this.key
            );

        if (!saved) {

            return {

                games: 0,

                wins: 0,

                losses: 0,

                moneyEarned: 0,

                propertiesBought: 0

            };

        }

        try {

            return JSON.parse(
                saved
            );

        } catch {

            return {};

        }

    },

    save(profile) {

        localStorage.setItem(
            this.key,
            JSON.stringify(
                profile
            )
        );

    },

    addGame() {

        const profile =
            this.get();

        profile.games =
            Number(
                profile.games || 0
            ) + 1;

        this.save(
            profile
        );

    },

    addWin() {

        const profile =
            this.get();

        profile.wins =
            Number(
                profile.wins || 0
            ) + 1;

        this.save(
            profile
        );

    }

};