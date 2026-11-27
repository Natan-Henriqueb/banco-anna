"use strict";

window.LobbyController = {

    socket: null,

    room: null,

    initialize() {

        this.socket =
            window.GameSocket?.connect();

        if (!this.socket) {
            return;
        }

        this.registerEvents();

    },

    registerEvents() {

        this.socket.on(
            "room:update",
            (room) => {

                this.room =
                    room;

                GameState.setRoom(
                    room
                );

                document.dispatchEvent(
                    new CustomEvent(
                        "lobby:update",
                        {
                            detail:
                                room
                        }
                    )
                );

            }
        );

    },

    setReady() {

        this.socket.emit(
            "room:ready",
            {
                code:
                    GameState.roomCode
            }
        );

    },

    startGame() {

        this.socket.emit(
            "room:start",
            {
                code:
                    GameState.roomCode
            },

            (response) => {

                if (
                    !response?.success
                ) {

                    NotificationSystem.error(
                        response?.error
                    );

                }

            }
        );

    },

    leave() {

        this.socket.emit(
            "room:leave",
            {
                code:
                    GameState.roomCode
            }
        );

        GameState.clear();

        Router.home();

    }

};