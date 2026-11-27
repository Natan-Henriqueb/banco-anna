"use strict";

window.AuctionSystem = {

    auction: null,

    setAuction(data) {

        this.auction =
            data;

        document.dispatchEvent(
            new CustomEvent(
                "auction:update",
                {
                    detail: data
                }
            )
        );

    },

    getHighestBid() {

        return (
            this.auction?.highestBid ||
            0
        );

    }

};