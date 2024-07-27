import mongoose, { Document, Schema } from "mongoose";

interface Adress {
  _id: string;
  name: string;
  email: string;
  country: string;
  city: string;
  address: string;
}

interface Items {
  _id: string;
  type: string;
  image: string;
  description: string;
  rating: number;
  price: number;
}

interface IOrder extends Document {
  userId: string;
  status: string;
  totalAmount: number;
  items: Items[]; // Adjust the type of items as needed
  date: Date;
  payment: boolean;
  address: Adress;
  paymentIntentId: number;
}

const orderSchema: Schema<IOrder> = new Schema({
  userId: {
    type: String,
    // required: true,
  },
  status: {
    type: String,
    enum: ["Food Processing", "Confirmed", "Out of order"],
    default: "Food Processing",
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  address: {
    type: Object,
    required: true,
  },
  items: {
    type: [],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  payment: {
    type: Boolean,
    default: false,
  },
  paymentIntentId: Number,
});

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
