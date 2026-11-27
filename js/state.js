"use strict";

window.GameState = {

    roomCode:
        sessionStorage.getItem(
            "roomCode"
        ) || null,

    playerId:
        sessionStorage.getItem(
            "playerId"
        ) || null,

    playerName:
        sessionStorage.getItem(
            "playerName"
        ) || null,

    game: null,

    room: null,

    setRoom(room) {

        this.room = room;

        if (room?.code) {

            this.roomCode =
                room.code;

            sessionStorage.setItem(
                "roomCode",
                room.code
            );

        }

    },

    setPlayer(
        playerId,
        playerName
    ) {

        this.playerId =
            playerId;

        this.playerName =
            playerName;

        sessionStorage.setItem(
            "playerId",
            playerId
        );

        sessionStorage.setItem(
            "playerName",
            playerName
        );

    },

    clear() {

        sessionStorage.removeItem(
            "roomCode"
        );

        sessionStorage.removeItem(
            "playerId"
        );

        sessionStorage.removeItem(
            "playerName"
        );

        this.roomCode = null;
        this.playerId = null;
        this.playerName = null;
        this.room = null;
        this.game = null;

    }

};