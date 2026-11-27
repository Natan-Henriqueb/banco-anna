"use strict";

window.RoomSystem = {

    create(
        socket,
        name,
        settings,
        callback
    ) {

        socket.emit(
            "room:create",
            {
                name,
                settings
            },
            callback
        );

    },

    join(
        socket,
        name,
        code,
        callback
    ) {

        socket.emit(
            "room:join",
            {
                name,
                code
            },
            callback
        );

    },

    saveSession(response) {

        if (!response?.success) {
            return;
        }

        GameState.setPlayer(
            response.playerId,
            response.room.players.find(
                player =>
                    player.id ===
                    response.playerId
            )?.name
        );

        GameState.setRoom(
            response.room
        );

    }

};