// import { DataTypes, Model } from "sequelize";
// import sequelize from "../../../shared/config/pg_database";
// import User from "../../users/models/userMode";
// import Product from "../../product/models/product/productModels";
// import OrderItem from "./itemOrder";

// class Order extends Model {
//   static findOneAndUpdate(
//     arg0: { paymentIntentId: any },
//     arg1: {
//       status: string;
//       paymentStatus: string;
//       paymentDetails: { id: any };
//     },
//     arg2: { new: boolean }
//   ) {
//     throw new Error("Method not implemented.");
//   }
//   public id!: number;
//   public userId!: number;
//   public orderId!: number;
//   public totalPrice!: number;
//   public status!:
//     | "pending"
//     | "confirmed"
//     | "shipped"
//     | "delivered"
//     | "cancelled";
//   public paymentStatus!: "paid" | "unpaid" | "failed";
//   public paymentMethod!: string;
//   public statusHistory!: Object;
//   public mpesaReceiptNumber!: string;

//   public shippingAddress!: string;
//   public trackingNumber?: string;
//   paymentDetails: any;

//   public apartment!: string;
//   public city!: string;
//   public country!: string;
//   public county!: string;
//   public email!: string;
//   public fullName!: string;
//   public phoneNumber!: string;
//   public postcode!: string;
//   public streetAddress!: string;
// }

// Order.init(
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     userId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: { model: "users", key: "id" },
//     },
//     totalPrice: {
//       type: DataTypes.FLOAT,
//       allowNull: false,
//     },
//     status: {
//       type: DataTypes.ENUM(
//         "cancelled",
//         "pending",
//         "confirmed",
//         "shipped",
//         "delivered"
//       ),
//       defaultValue: "pending",
//     },
//     paymentStatus: {
//       type: DataTypes.ENUM("paid", "unpaid", "failed"),
//       defaultValue: "unpaid",
//     },
//     statusHistory: {
//       type: DataTypes.JSON,
//       defaultValue: {
//         pending: null,
//         confirmed: null,
//         processing: null,
//         shipped: null,
//         in_transit: null,
//         delivered: null,
//         cancelled: null,
//       },
//     },
//     paymentMethod: { type: DataTypes.STRING, allowNull: true },
//     mpesaReceiptNumber: { type: DataTypes.STRING, allowNull: true },
//     trackingNumber: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       defaultValue: DataTypes.UUIDV4,
//     },
//     shippingAddress: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },

//     streetAddress: { type: DataTypes.STRING, allowNull: true },
//     country: { type: DataTypes.STRING, allowNull: true },
//     county: { type: DataTypes.STRING, allowNull: true },
//     phoneNumber: { type: DataTypes.STRING, allowNull: true },
//     email: { type: DataTypes.STRING, allowNull: true },
//     fullName: { type: DataTypes.STRING, allowNull: true },
//     postcode: { type: DataTypes.STRING, allowNull: true },
//     city: { type: DataTypes.STRING, allowNull: true },
//     apartment: { type: DataTypes.STRING, allowNull: true },
//   },
//   {
//     sequelize,
//     tableName: "orders",
//     modelName: "Order",
//   }
// );

import { DataTypes, Model, Optional, Transactionable } from "sequelize";
import sequelize from "../../../shared/config/pg_database";
import User from "../../users/models/userMode";
import Product from "../../product/models/product/productModels";
import OrderItem from "./itemOrder";

interface OrderAttributes {
  id: number;
  userId: number;
  orderId?: number;
  totalPrice: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "in_transit"
    | "delivered"
    | "cancelled";
  paymentStatus: "paid" | "unpaid" | "failed" | "refunded";
  paymentMethod?: string;
  mpesaReceiptNumber?: string;
  trackingNumber?: string;
  paymentDetails?: any;
  paymentReference?: string;
  statusHistory: {
    pending: Date | null;
    confirmed: Date | null;
    processing: Date | null;
    shipped: Date | null;
    in_transit: Date | null;
    delivered: Date | null;
    cancelled: Date | null;
  };

  shippingAddress: string;
  streetAddress: string;
  country: string;
  county: string;
  phoneNumber: string;
  email: string;
  fullName: string;
  postcode: string;
  city: string;
  apartment?: string;
}

class Order extends Model {
  static findOneAndUpdate(
    arg0: { paymentIntentId: any },
    arg1: {
      status: string;
      paymentStatus: string;
      paymentDetails: { id: any };
    },
    arg2: { new: boolean }
  ) {
    throw new Error("Method not implemented.");
  }
  public id!: number;
  public userId!: number;
  public orderId!: number;
  public totalPrice!: number;
  public status!:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "in_transit"
    | "delivered"
    | "cancelled";
  public paymentStatus!: "paid" | "unpaid" | "failed" | "refunded";
  public paymentMethod!: string;
  public mpesaReceiptNumber!: string;
  public trackingNumber!: string;
  public paymentDetails!: any;
  public paymentReference!: string;

  public statusHistory!: {
    pending: Date | null;
    confirmed: Date | null;
    processing: Date | null;
    shipped: Date | null;
    in_transit: Date | null;
    delivered: Date | null;
    cancelled: Date | null;
  };

  // SHIPPING ADDRESS FIELD
  public shippingAddress!: string;
  public streetAddress!: string;
  public country!: string;
  public county!: string;
  public phoneNumber!: string;
  public email!: string;
  public fullName!: string;
  public postcode!: string;
  public city!: string;
  public apartment!: string;

  // TIMESTAMP
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /**
   * Updates order status and records the timestamp in statusHistory
   * @param orderId ID of the order to update
   * @param newStatus New status to set
   * @returns Updated order
   */
  static async updateStatus(
    orderId: number,
    newStatus: OrderAttributes["status"],
    options?: Transactionable
  ): Promise<Order> {
    const order = await Order.findByPk(orderId, options);
    if (!order) {
      throw new Error("Order not found");
    }

    const validTransitions: Record<
      OrderAttributes["status"],
      OrderAttributes["status"][]
    > = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["in_transit", "cancelled"],
      in_transit: ["delivered", "cancelled"],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[order.status].includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${order.status} to ${newStatus}`
      );
    }

    const updatedHistory = {
      ...order.statusHistory,
      [newStatus]: new Date(),
    };

    return order.update({
      status: newStatus,
      statusHistory: updatedHistory,
    });
  }
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "in_transit",
        "delivered",
        "cancelled"
      ),
      defaultValue: "pending",
    },
    paymentStatus: {
      type: DataTypes.ENUM("paid", "unpaid", "failed", "refunded"),
      defaultValue: "unpaid",
    },
    statusHistory: {
      type: DataTypes.JSONB,
      defaultValue: {
        pending: null,
        confirmed: null,
        processing: null,
        shipped: null,
        in_transit: null,
        delivered: null,
        cancelled: null,
      },
    },
    paymentMethod: { type: DataTypes.STRING, allowNull: true },
    paymentReference: { type: DataTypes.STRING, allowNull: true },
    mpesaReceiptNumber: { type: DataTypes.STRING, allowNull: true },
    trackingNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: DataTypes.UUIDV4,
    },

    shippingAddress: { type: DataTypes.STRING, allowNull: false },
    streetAddress: { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true },
    county: { type: DataTypes.STRING, allowNull: true },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      // validate: {
      //   is: /^\+?[\d\s-]+$/,
      // },
    },
    email: { type: DataTypes.STRING, allowNull: true },
    fullName: { type: DataTypes.STRING, allowNull: true },
    postcode: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    apartment: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    tableName: "orders",
    modelName: "Order",
    indexes: [
      {
        fields: ["userId"],
        name: "orders_userId_index",
      },
      {
        fields: ["status"],
        name: "orders_status_index",
      },
      {
        fields: ["trackingNumber"],
        name: "orders_trackingNumber_index",
      },
    ],
    hooks: {
      beforeValidate: (order: Order) => {
        if (!order.statusHistory) {
          order.statusHistory = {
            pending: null,
            confirmed: null,
            processing: null,
            shipped: null,
            in_transit: null,
            delivered: null,
            cancelled: null,
          };
        }
      },
      beforeCreate: (order: Order) => {
        order.statusHistory = {
          ...order.statusHistory,
          pending: new Date(),
        };
      },
    },
  }
);

User.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "userId" });

Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Product.hasMany(OrderItem, { foreignKey: "productId", onDelete: "CASCADE" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

export default Order;
