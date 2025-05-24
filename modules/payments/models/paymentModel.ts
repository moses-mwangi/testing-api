import { DataTypes, Model } from "sequelize";
import sequelize from "../../../shared/config/pg_database";
type PaymentMethod =
  | "card"
  | "bank"
  | "ussd"
  | "qr"
  | "mobile_money"
  | "bank_transfer";

interface PaymentAttributes {
  id?: number;
  orderId: number;
  userId: number;

  amount: number;
  currency: string;
  status: "initiated" | "pending" | "success" | "failed" | "refunded";
  paymentMethod?: PaymentMethod;
  reference: string;
  paymentReference?: string;
  authorizationUrl?: string;
  gatewayResponse?: string;

  stripePaymentId?: string;
}

class Payment extends Model<PaymentAttributes> implements PaymentAttributes {
  public id!: number;
  public userId!: number;
  public orderId!: number;

  public status!: "initiated" | "pending" | "success" | "failed" | "refunded";
  public paymentMethod?: PaymentMethod;

  public amount!: number;
  public currency!: string;

  public reference!: string;
  public paymentReference?: string;
  public authorizationUrl?: string;
  public gatewayResponse?: string;

  public stripePaymentId!: string;

  public createdAt!: Date;
  public updatedAt!: Date;
}

Payment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    stripePaymentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "KES",
    },

    status: {
      type: DataTypes.ENUM(
        "initiated",
        "pending",
        "success",
        "failed",
        "refunded"
      ),
      defaultValue: "initiated",
    },
    paymentMethod: {
      type: DataTypes.ENUM(
        "card",
        "bank",
        "bank_transfer",
        "mobile_money",
        "ussd",
        "qr"
      ),
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    paymentReference: {
      type: DataTypes.STRING,
    },
    authorizationUrl: {
      type: DataTypes.TEXT,
    },
    gatewayResponse: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: "Payment",
    tableName: "payments",
    timestamps: true,
    indexes: [
      // {
      //   fields: ["reference"],
      //   unique: true,
      // },
      {
        fields: ["orderId"],
      },
    ],
  }
);

export default Payment;
