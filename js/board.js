"use strict";

window.BoardSystem = {

    boardSize: 40,

    getTile(state, position) {

        return state?.properties?.find(
            property =>
                property.id === position
        );

    },

    getTileName(state, position) {

        const tile =
            this.getTile(
                state,
                position
            );

        return tile
            ? tile.name
            : "";

    },

    getPlayersOnTile(
        state,
        position
    ) {

        return (
            state?.players || []
        ).filter(
            player =>
                player.position ===
                position
        );

    }

};