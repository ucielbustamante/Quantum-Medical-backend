const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User, OAuthAccount } = require("../models");

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;
  const firstName = profile.name?.givenName || profile.displayName?.split(" ")[0] || "";
  const lastName = profile.name?.familyName || profile.displayName?.split(" ").slice(1).join(" ") || "";
  let user = await User.findOne({ where: { email } });
  if (!user) {
    user = await User.create({ email, role: "Patient", name: firstName, lastname: lastName, dni: null, password_hash: null });
  }
  // guardar/actualizar OAuthAccount
  await OAuthAccount.upsert(
    {
      user_id:          user.id,
      provider:         "google",
      provider_user_id: profile.id,
      name:             firstName,
      lastname:         lastName,
      email,
      access_token:     accessToken,
      refresh_token:    refreshToken,
      expires_at:       new Date(Date.now() + 3600 * 1000)
    },
    {
      conflictFields: ["provider", "provider_user_id"]
    },
    {
      fields: ["user_id", "email", "name", "lastname", "access_token", "refresh_token", "expires_at"]
    }
  );  
  done(null, user);
}));