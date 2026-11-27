"use strict";

window.NotificationSystem = {

    show(
        message,
        type = "info"
    ) {

        document.dispatchEvent(
            new CustomEvent(
                "notification",
                {
                    detail: {
                        message,
                        type
                    }
                }
            )
        );

        console.log(
            `[${type}]`,
            message
        );

    },

    success(message) {

        this.show(
            message,
            "success"
        );

    },

    error(message) {

        this.show(
            message,
            "error"
        );

    },

    warning(message) {

        this.show(
            message,
            "warning"
        );

    }

};