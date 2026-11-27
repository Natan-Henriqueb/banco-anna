"use strict";

window.EconomySystem = {

    format(value) {

        return "$" +
            Number(
                value || 0
            ).toLocaleString(
                "pt-BR"
            );

    },

    canBuy(
        player,
        price
    ) {

        return Boolean(
            player &&
            player.money >=
                price
        );

    },

    calculateNetWorth(
        player,
        properties
    ) {

        let total =
            Number(
                player?.money || 0
            );

        for (
            const propertyId
            of player?.properties || []
        ) {

            const property =
                properties?.find(
                    item =>
                        item.id ===
                        propertyId
                );

            if (property) {

                total +=
                    property.price || 0;

            }

        }

        return total;

    }

};