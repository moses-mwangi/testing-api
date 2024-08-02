"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const restaurantSchema = new mongoose_1.Schema({
    restName: {
        type: String,
        require: [true, "Restaurant should have a name"],
    },
    image: {
        type: String,
        // require: [true, "Restaurant should have a name"],
        default: "/images/quick.png",
    },
    location: {
        type: String,
        require: [true, "Restaurant should have a name"],
    },
    deliveryPrice: {
        type: Number,
        default: 23,
    },
    food_lists: [
        {
            type: {
                type: String,
                default: "pizza",
            },
            image: {
                type: String,
                default: "/assets/food_10.png",
            },
            description: String,
            rating: Number,
            price: Number,
        },
    ],
});
const Restaurant = (0, mongoose_1.model)("Restaurant", restaurantSchema);
exports.default = Restaurant;
