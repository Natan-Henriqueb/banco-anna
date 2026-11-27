"use strict";

window.Router = {

    go(url) {

        window.location.href =
            url;

    },

    home() {

        this.go("/");

    },

    lobby() {

        this.go(
            "/pages/lobby.html"
        );

    },

    game() {

        this.go(
            "/pages/game.html"
        );

    },

    createRoom() {

        this.go(
            "/pages/create-room.html"
        );

    },

    joinRoom() {

        this.go(
            "/pages/join-room.html"
        );

    }

};