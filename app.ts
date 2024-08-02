import express from "express";
import cors from "cors";
import cookiParser from "cookie-parser";
import userRouter from "./routes/users";
import Order from "./routes/order";

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

app.use("/api/orders", Order);

export default app;
