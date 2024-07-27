import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  country: string;
  city: string;
  address: string;
  role: string;
  photo?: string;
  password: string;
  passwordConfirm: string;
  userCreatedAt?: Date;
  active?: boolean;
  correctPassword: (
    candidatePassword: string,
    userPassword: string
  ) => Promise<boolean>;
}

const userSchema: Schema<IUser> = new Schema({
  name: {
    type: String,
    required: [true, "All users should have a name"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "User email is required"],
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  role: {
    type: String,
    enum: ["customer", "staff", "admin"],
    default: "customer",
  },
  country: {
    type: String,
    default: "Kenya",
  },
  city: {
    type: String,
    default: "Nairobi",
  },
  address: { type: String, default: "123 Main St" },
  photo: {
    type: String,
  },
  password: {
    type: String,
    // required: [true, "Please provide a password"],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    // required: [true, "User password is required"],
    validate: {
      validator: function (this: IUser, val: string) {
        return val === this.password;
      },
      message: "Passwords are not the same",
    },
  },
  userCreatedAt: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  (this.passwordConfirm as unknown) = undefined;
});

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
