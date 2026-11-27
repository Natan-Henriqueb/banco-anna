"use strict";

window.SettingsSystem = {

    key:
        "banco-imobiliario-settings",

    defaults: {

        volume: 70,

        animations: true,

        particles: true,

        notifications: true,

        quality: "high"

    },

    get() {

        const saved =
            localStorage.getItem(
                this.key
            );

        if (!saved) {

            return {
                ...this.defaults
            };

        }

        try {

            return {
                ...this.defaults,
                ...JSON.parse(saved)
            };

        } catch {

            return {
                ...this.defaults
            };

        }

    },

    save(settings) {

        localStorage.setItem(
            this.key,
            JSON.stringify(
                settings
            )
        );

    },

    update(
        property,
        value
    ) {

        const settings =
            this.get();

        settings[property] =
            value;

        this.save(
            settings
        );

        return settings;

    }

};