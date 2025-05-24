"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const userMode_1 = __importDefault(require("../../modules/users/models/userMode"));
const dotenv_1 = __importDefault(require("dotenv"));
const jwt_1 = require("../../modules/users/utils/jwt");
dotenv_1.default.config();
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await userMode_1.default.findOne({
            where: { email: profile.emails?.[0]?.value },
        });
        console.log(profile);
        if (!user) {
            user = new userMode_1.default({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails?.[0]?.value || null,
                emailVerified: true,
                lastLogin: new Date(),
            });
            await user.save();
        }
        else {
            if (!user.googleId) {
                user.googleId = profile.id;
            }
            user.lastLogin = new Date();
            await user.save();
        }
        const token = (0, jwt_1.generateToken)({ id: user.id, email: user.email });
        return done(null, user, { token });
    }
    catch (error) {
        console.error("Error during Google authentication:", error);
        return done(error);
    }
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await userMode_1.default.findByPk(id);
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
});
exports.default = passport_1.default;
