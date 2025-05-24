import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../../modules/users/models/userMode";
import dotenv from "dotenv";
import { generateToken } from "../../modules/users/utils/jwt";
import jwt from "jsonwebtoken";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          where: { email: profile.emails?.[0]?.value },
        });

        console.log(profile);
        if (!user) {
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value || null,
            emailVerified: true,
            lastLogin: new Date(),
          });
          await user.save();
        } else {
          if (!user.googleId) {
            user.googleId = profile.id;
          }
          user.lastLogin = new Date();
          await user.save();
        }
        const token = generateToken({ id: user.id, email: user.email });
        return done(null, user, { token });
      } catch (error) {
        console.error("Error during Google authentication:", error);
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
