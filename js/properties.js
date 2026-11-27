"use strict";

window.PropertySystem = {

    getById(
        properties,
        id
    ) {

        return properties?.find(
            property =>
                property.id === id
        );

    },

    formatMoney(value) {

        return new Intl.NumberFormat(
            "pt-BR"
        ).format(
            Number(value || 0)
        );

    },

    getOwner(
        state,
        propertyId
    ) {

        return state?.players?.find(
            player =>
                player.properties
                    ?.includes(
                        propertyId
                    )
        );

    },

    getOwnedProperties(
        state,
        playerId
    ) {

        const player =
            state?.players?.find(
                item =>
                    item.id === playerId
            );

        if (!player) {
            return [];
        }

        return player.properties.map(
            id =>
                this.getById(
                    state.properties,
                    id
                )
        ).filter(Boolean);

    }

};