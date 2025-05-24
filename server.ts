import app from "./app";
import dotenv from "dotenv";
import sequelize from "./shared/config/pg_database";
import orderAssociations from "./modules/order/models/orderAssociations";
import Order from "./modules/order/models/ordersModel";
import OrderItem from "./modules/order/models/itemOrder";
import User from "./modules/users/models/userMode";
import categoryAssociations from "./modules/product/models/category/categoryAssociations";
import { Sequelize } from "sequelize";
import { cpus } from "os";
import cluster, { Worker } from "cluster";
import ProductImage from "./modules/product/models/product/productImageModel";
import productAssociation from "./modules/product/models/product/productAssociation";
import Product from "./modules/product/models/product/productModels";
import reviewAssociation from "./modules/reviews/models/reviewModel/reviewAssociation";
import paymentAssociation from "./modules/payments/models/paymentAssociation";
import Review from "./modules/reviews/models/reviewModel/reviewModels";
import Payment from "./modules/payments/models/paymentModel";
import logger from "./modules/payments/utils/logger";

orderAssociations();
categoryAssociations();
productAssociation();
reviewAssociation();
// paymentAssociation();

dotenv.config();
dotenv.config({ path: "./.env" });

process.on("uncaughtException", (err) => {
  console.error("Handling Exceptional Error. Shutting down...💥💥💥💥");
  console.error(err.name, err.message);
  process.exit(1);
});

const pg_connect = async () => {
  try {
    sequelize.authenticate();
    console.log("The PostgreSQL database has successfully connected");
    // await sequelize.sync({ force: true });
    // await Payment.sync({ force: true });

    // await sequelize.sync({ alter: true }); /////does not delete data
    // await Order.sync({ alter: true });
    // await Payment.sync({ alter: true });

    // Review.destroy({ where: {}, truncate: true }),
    // Review.destroy({ where: {} });
  } catch (err) {
    console.log("Unable to connect to database", err);
  }
};
pg_connect();

const numCpu = cpus().length + 6;

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);

  for (let i = 0; i < numCpu; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `Worker ${worker.process.pid} exit with code ${code}, signal ${signal}`
    );
    cluster.fork();
  });
} else {
  const workerIndex = cluster.worker?.id;
  const port = Number(process.env.PORT) + Number(workerIndex);

  const server = app.listen(port, "127.0.0.1", () => {
    console.log(`Server running at ${port}`);
  });

  // process.on("unhandledRejection", (err) => {
  //   console.error("Unhandled Rejection. Shutting down...💥💥💥💥");
  //   console.error(err);
  //   server.close(() => {
  //     process.exit(1);
  //   });
  //   app.use((req, res, next) => {
  //     console.log(`Request received by Worker ${process.pid} on port ${port}`);
  //     next();
  //   });
  // });
}

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", {
    promise,
    reason,
  });
});

// "@types/express-validatosssssssr": "4.4",
//     "@types/sequelize": "4.4",
//     "@types/os": "4.4",
//     "@types/cluster": "4.4",
//     "@types/cloudinary": "4.4",
//     "@types/dotenv": "9"
