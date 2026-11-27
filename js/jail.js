"use strict";

window.JailSystem = {

    isInJail(player) {

        return Boolean(
            player?.inJail
        );

    },

    turnsRemaining(player) {

        if (!player?.inJail) {
            return 0;
        }

        return Math.max(
            0,
            3 -
                Number(
                    player.jailTurns || 0
                )
        );

    }

};