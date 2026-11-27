"use strict";

window.TradingSystem = {

    createOffer(
        targetPlayerId
    ) {

        return {

            from:
                GameState.playerId,

            to:
                targetPlayerId,

            offeredMoney: 0,

            requestedMoney: 0,

            offeredProperties: [],

            requestedProperties: []

        };

    },

    validateOffer(
        offer,
        state
    ) {

        const player =
            state.players.find(
                item =>
                    item.id ===
                    GameState.playerId
            );

        if (!player) {

            return {
                valid: false,
                reason:
                    "Jogador não encontrado."
            };

        }

        if (
            offer.offeredMoney >
            player.money
        ) {

            return {
                valid: false,
                reason:
                    "Dinheiro insuficiente."
            };

        }

        return {
            valid: true
        };

    }

};