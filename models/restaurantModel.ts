import mongoose, { model, Schema } from "mongoose";

const restaurantSchema: Schema = new Schema({
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

const Restaurant = model("Restaurant", restaurantSchema);

export default Restaurant;
