"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const pg_database_1 = __importDefault(require("../../../shared/config/pg_database")); // Setup your Sequelize connection
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const generateUniqueId = () => (0, uuid_1.v4)();
const defId = Math.floor(10000000 + Math.random() * 999999);
class User extends sequelize_1.Model {
    // Instance methods
    async comparePassword(password) {
        return await bcryptjs_1.default.compare(password, this.passwordHash || "");
    }
}
User.init({
    uuidv4: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    emailVerified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
    },
    passwordHash: {
        type: sequelize_1.DataTypes.STRING,
    },
    googleId: {
        type: sequelize_1.DataTypes.STRING,
    },
    facebookId: {
        type: sequelize_1.DataTypes.STRING,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    tradeRole: {
        type: sequelize_1.DataTypes.STRING,
    },
    telephone: {
        type: sequelize_1.DataTypes.STRING,
    },
    country: {
        type: sequelize_1.DataTypes.STRING,
    },
    city: {
        type: sequelize_1.DataTypes.STRING,
    },
    state: {
        type: sequelize_1.DataTypes.STRING,
    },
    zipcode: {
        type: sequelize_1.DataTypes.STRING,
    },
    passwordResetToken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    passwordResetExpires: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    lastLogin: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    refreshToken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize: pg_database_1.default,
    tableName: "users",
    modelName: "User",
});
// Hook to hash password before saving
User.beforeSave(async (user) => {
    if (user.passwordHash && user.changed("passwordHash")) {
        const salt = await bcryptjs_1.default.genSalt(10);
        user.passwordHash = await bcryptjs_1.default.hash(user.passwordHash, salt);
    }
});
// const user = new User();
// user.comparePassword("");
exports.default = User;
