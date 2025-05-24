import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";

import { authRouter, userRouter } from "./modules/users";
import { orderRouter } from "./modules/order";
import { payments } from "./modules/payments";
import { paystackPayments } from "./modules/payments";
import { productRouter } from "./modules/product";
import { categoryRouter } from "./modules/product";
import { reviewRouter } from "./modules/reviews";
import globalErrorHandler from "./shared/middleware/GlobalErrorHandler";

const app = express();

app.post(
  "/api/payment/card/webhook",
  bodyParser.raw({ type: "application/json" }),
  (req, res, next) => {
    (req as any).rawBody = req.body.toString("utf8");
    next();
  },
  (req, res, next) => {
    (req as any).skipBodyParsing = true;
    next();
  }
);

app.use(express.json());
app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:3000",
  "https://api.publicapis.org/entries",
  "http://localhost:3001",
  "http://localhost:8000",
  "https://e-commerce-e-commerce-brown.vercel.app/",
  "https://e-commerce-e-commerce-brown.vercel.app",
];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked CORS request from origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // This allows cookies to be sent and received if needed
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  console.log("Testing middleware");
  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: true,
      // maxAge: 30 * 60 * 1000,
      expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
      maxAge: 8 * 60 * 60 * 1000,
    },
  })
);

// Initialize Passport
// app.use(passport.initialize());
// app.use(passport.session());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.use("/api/product", productRouter);
app.use("/api/category", categoryRouter);
app.use("/api/order", orderRouter);
app.use("/api/review", reviewRouter);

app.use("/api/payment", payments);
app.use("/api/payments", paystackPayments);

app.use(globalErrorHandler);

// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//   console.error(err.stack);
//   res.status(500).json({ error: err.message });
// });

app.use((req, res, next) => {
  res
    .status(400)
    .json({ msg: `Cannot find that route ${req.originalUrl} on this server` });

  next();
});

// app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
//   const statusCode = err.statusCode || 500;
//   res.status(statusCode).json({
//     status: "error",
//     message: err.isOperational ? err.message : "Internal Server Error",
//   });
// });

export default app;
