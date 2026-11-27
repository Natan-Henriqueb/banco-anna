"use strict";

window.DiceSystem = {

    roll() {

        const first =
            Math.floor(
                Math.random() * 6
            ) + 1;

        const second =
            Math.floor(
                Math.random() * 6
            ) + 1;

        return {

            first,

            second,

            total:
                first + second,

            doubles:
                first === second

        };

    },

    face(value) {

        const faces = {

            1: "⚀",
            2: "⚁",
            3: "⚂",
            4: "⚃",
            5: "⚄",
            6: "⚅"

        };

        return faces[value] || "";

    }

};
