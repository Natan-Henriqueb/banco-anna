"use strict";

window.GameSocket = {

    socket: null,

    connect() {

        if (
            typeof io ===
            "undefined"
        ) {

            console.error(
                "Socket.IO não foi carregado."
            );

            return null;

        }

        if (!this.socket) {

            this.socket = io();

            this.socket.on(
                "connect",
                () => {

                    console.log(
                        "Socket conectado:",
                        this.socket.id
                    );

                }
            );

            this.socket.on(
                "disconnect",
                () => {

                    console.warn(
                        "Socket desconectado."
                    );

                }
            );

        }

        return this.socket;

    }

};