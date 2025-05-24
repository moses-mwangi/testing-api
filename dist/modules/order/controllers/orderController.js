"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.updateOrderStatus = exports.updateOrder = exports.getOrderById = exports.getAllOrders = exports.createOrder = void 0;
const catchSync_1 = __importDefault(require("../../../shared/utils/catchSync"));
const AppError_1 = __importDefault(require("../../../shared/utils/AppError"));
const productModels_1 = __importDefault(require("../../product/models/product/productModels"));
const ordersModel_1 = __importDefault(require("../models/ordersModel"));
const itemOrder_1 = __importDefault(require("../models/itemOrder"));
const userMode_1 = __importDefault(require("../../users/models/userMode"));
const productImageModel_1 = __importDefault(require("../../product/models/product/productImageModel"));
const pg_database_1 = __importDefault(require("../../../shared/config/pg_database"));
exports.createOrder = (0, catchSync_1.default)(async (req, res, next) => {
    const { userId, orderItems: products, shippingAddress, 
    // paymentMethodId,
    country, county, streetAddress, phoneNumber, city, email, fullName, postcode, apartment, trackingNumber, totalPrice, } = req.body;
    console.log("BODY", req.body);
    if (!userId || !products || products.length === 0 || !shippingAddress) {
        return next(new AppError_1.default("Missing required fields", 400));
    }
    const transaction = await pg_database_1.default.transaction(); // Start transaction
    try {
        const productIds = products.map((item) => item.productId);
        const productList = await productModels_1.default.findAll({
            where: { id: productIds },
        });
        const productMap = new Map(productList.map((product) => [product.id, product]));
        let totalPrice = 0;
        for (const item of products) {
            const product = productMap.get(item.productId);
            if (!product) {
                throw new AppError_1.default(`Product with ID ${item.productId} not found`, 404);
            }
            totalPrice += product.price * item.quantity;
        }
        const order = await ordersModel_1.default.create({
            userId,
            totalPrice,
            shippingAddress,
            status: "pending",
            paymentStatus: "unpaid",
            trackingNumber,
            country,
            county,
            streetAddress,
            phoneNumber,
            city,
            email,
            fullName,
            postcode,
            apartment,
            // totalPrice,
        }, { transaction });
        const orderItems = products.map((item) => ({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: productMap.get(item.productId)?.price || 0,
        }));
        await itemOrder_1.default.bulkCreate(orderItems, { transaction });
        await transaction.commit();
        res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            order,
        });
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
});
exports.getAllOrders = (0, catchSync_1.default)(async (req, res, next) => {
    const orders = await ordersModel_1.default.findAll({
        include: [
            {
                model: userMode_1.default,
                attributes: [
                    "id",
                    "name",
                    "email",
                    "telephone",
                    "country",
                    "createdAt",
                ],
            },
            {
                model: itemOrder_1.default,
                include: [
                    {
                        model: productModels_1.default,
                        as: "Product",
                        include: [{ model: productImageModel_1.default, as: "productImages" }],
                    },
                ],
            },
            // {
            //   model: Payment,
            //   as: "",
            //   attributes: { exclude: ["status"] },
            // },
        ],
    });
    if (!orders || orders.length === 0) {
        return res.status(200).json({ success: "faill", orders: [] });
    }
    res.status(200).json({ success: true, orders });
});
exports.getOrderById = (0, catchSync_1.default)(async (req, res, next) => {
    const order = await ordersModel_1.default.findByPk(req.params.id, {
        include: [
            {
                model: itemOrder_1.default,
                include: [
                    {
                        model: productModels_1.default,
                        as: "Product",
                        include: [{ model: productImageModel_1.default, as: "productImages" }],
                    },
                ],
            },
        ],
    });
    if (!order)
        return next(new AppError_1.default("Order not found", 404));
    res.status(200).json({ success: true, order });
});
exports.updateOrder = (0, catchSync_1.default)(async (req, res, next) => {
    const { country, fullName, email, phoneNumber, streetAddress, apartment, postcode, city, county, } = req.body;
    const order = await ordersModel_1.default.findByPk(req.params.id);
    if (!order)
        return next(new AppError_1.default("Order not found", 404));
    const updatedOrder = await order.update({
        country,
        fullName,
        email,
        phoneNumber,
        streetAddress,
        apartment,
        postcode,
        city,
        county,
    });
    res.status(200).json({
        success: true,
        message: "Order updated successfully!",
        order: updatedOrder,
    });
});
exports.updateOrderStatus = (0, catchSync_1.default)(async (req, res, next) => {
    const { status } = req.body;
    const order = await ordersModel_1.default.findByPk(req.params.id);
    if (!order)
        return next(new AppError_1.default("Order not found", 404));
    order.status = status;
    await order.save();
    res
        .status(200)
        .json({ success: true, message: "Order updated successfully!", order });
});
exports.deleteOrder = (0, catchSync_1.default)(async (req, res, next) => {
    const order = await ordersModel_1.default.findByPk(req.params.id);
    if (!order)
        return next(new AppError_1.default("Order not found", 404));
    await order.destroy();
    res
        .status(200)
        .json({ success: true, message: "Order deleted successfully!" });
});
