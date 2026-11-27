"use strict";

window.ShopSystem = {

    items: [

        {
            id: "classic",
            name: "Clássico",
            price: 0,
            unlocked: true
        },

        {
            id: "royal",
            name: "Royal Gold",
            price: 500,
            unlocked: false
        },

        {
            id: "neon",
            name: "Neon City",
            price: 750,
            unlocked: false
        }

    ],

    getItems() {

        return this.items;

    },

    getItem(id) {

        return this.items.find(
            item =>
                item.id === id
        );

    }

};