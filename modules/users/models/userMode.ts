import { DataTypes, Model } from "sequelize";
import sequelize from "../../../shared/config/pg_database"; // Setup your Sequelize connection
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const generateUniqueId = () => uuidv4();
const defId = Math.floor(10000000 + Math.random() * 999999);

class User extends Model {
  public id!: number;
  public uuidv4!: string;
  public email!: string;
  public passwordHash?: string;
  public emailVerified?: boolean; /////added later
  public googleId?: string;
  public facebookId?: string;
  public name!: string;
  public tradeRole?: string;
  public telephone?: string;
  public country?: string;
  public city?: string;
  public state?: string;
  public zipcode?: string;
  public passwordResetToken?: string;
  public passwordResetExpires?: Date;
  public refreshToken?: string;
  public lastLogin?: Date;

  // Instance methods
  public async comparePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.passwordHash || "");
  }
}

User.init(
  {
    uuidv4: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: DataTypes.UUIDV4,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
    },
    googleId: {
      type: DataTypes.STRING,
    },
    facebookId: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tradeRole: {
      type: DataTypes.STRING,
    },
    telephone: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    zipcode: {
      type: DataTypes.STRING,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "users",
    modelName: "User",
  }
);

// Hook to hash password before saving
User.beforeSave(async (user) => {
  if (user.passwordHash && user.changed("passwordHash")) {
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
  }
});

// const user = new User();
// user.comparePassword("");

export default User;
