import express from "express";
import cors from "cors";
import cookiParser from "cookie-parser";
import userRouter from "./routes/users";
import Order from "./models/orderModel";
// import Order from "./routes/order";
import tour from "./routes/tour";
import Restaurant from "./models/restaurantModel";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3002",
  "https://food-delivery-bkrk.vercel.app",
  "https://food-delivery-dasboard-pk5j.vercel.app",
  "https://food-delivery-dasboard.vercel.app",
];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (allowedOrigins.includes(origin!) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookiParser());

app.use((req, res, next) => {
  console.log("Testing middleware");
  next();
});

app.use("/api/users", userRouter);
app.use("/api/tours", tour);

// app.use("/api/orders", Order);

app.get("/api/restaurants", async (req, res) => {
  console.log("Received request for /api/orders");

  try {
    const orders = await Restaurant.find();
    if (!orders.length) {
      console.log("No orders found");
      return res.status(200).json({ status: "success", data: { data: "no" } });
    }

    console.log("Orders retrieved successfully");
    res.status(200).json({ status: "success", data: { data: orders } });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ status: "error", message: "Server Error" });
  }
});

// Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Unhandled error:', err);
//   res.status(500).json({ status: 'error', message: 'Server Error' });
// });

export default app;
