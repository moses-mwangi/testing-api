"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const pg_database_1 = __importDefault(require("./shared/config/pg_database"));
const orderAssociations_1 = __importDefault(require("./modules/order/models/orderAssociations"));
const categoryAssociations_1 = __importDefault(require("./modules/product/models/category/categoryAssociations"));
const os_1 = require("os");
const cluster_1 = __importDefault(require("cluster"));
const productAssociation_1 = __importDefault(require("./modules/product/models/product/productAssociation"));
const reviewAssociation_1 = __importDefault(require("./modules/reviews/models/reviewModel/reviewAssociation"));
const logger_1 = __importDefault(require("./modules/payments/utils/logger"));
(0, orderAssociations_1.default)();
(0, categoryAssociations_1.default)();
(0, productAssociation_1.default)();
(0, reviewAssociation_1.default)();
// paymentAssociation();
dotenv_1.default.config();
dotenv_1.default.config({ path: "./.env" });
process.on("uncaughtException", (err) => {
    console.error("Handling Exceptional Error. Shutting down...💥💥💥💥");
    console.error(err.name, err.message);
    process.exit(1);
});
const pg_connect = async () => {
    try {
        pg_database_1.default.authenticate();
        console.log("The PostgreSQL database has successfully connected");
        // await sequelize.sync({ force: true });
        // await Payment.sync({ force: true });
        // await sequelize.sync({ alter: true }); /////does not delete data
        // await Order.sync({ alter: true });
        // await Payment.sync({ alter: true });
        // Review.destroy({ where: {}, truncate: true }),
        // Review.destroy({ where: {} });
    }
    catch (err) {
        console.log("Unable to connect to database", err);
    }
};
pg_connect();
const numCpu = (0, os_1.cpus)().length + 6;
if (cluster_1.default.isPrimary) {
    console.log(`Primary process ${process.pid} is running`);
    for (let i = 0; i < numCpu; i++) {
        cluster_1.default.fork();
    }
    cluster_1.default.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} exit with code ${code}, signal ${signal}`);
        cluster_1.default.fork();
    });
}
else {
    const workerIndex = cluster_1.default.worker?.id;
    const port = Number(process.env.PORT) + Number(workerIndex);
    const server = app_1.default.listen(port, "127.0.0.1", () => {
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
    logger_1.default.error("Unhandled Rejection", {
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
