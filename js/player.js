"use strict";

window.PlayerSystem = {

    colors: [
        "#e53935",
        "#1e88e5",
        "#43a047",
        "#fdd835",
        "#8e24aa",
        "#fb8c00",
        "#00acc1",
        "#6d4c41"
    ],

    getPlayer(players, id) {

        return players?.find(
            player =>
                player.id === id
        );

    },

    getCurrentPlayer(state) {

        if (!state) {
            return null;
        }

        return state.players[
            state.turnIndex
        ] || null;

    },

    isMyTurn(state) {

        const current =
            this.getCurrentPlayer(
                state
            );

        return Boolean(
            current &&
            current.id ===
                GameState.playerId
        );

    }

};