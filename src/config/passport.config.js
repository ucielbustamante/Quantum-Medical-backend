const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User, OAuthAccount, Patient } = require("../models");
const logger = require("./logger");

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const firstName = profile.name?.givenName || profile.displayName?.split(" ")[0] || "";
    const lastName = profile.name?.familyName || profile.displayName?.split(" ").slice(1).join(" ") || "";
    
    logger.info(`Intento de autenticación OAuth con Google: ${email}`);
    
    let user = await User.findOne({ where: { email } });
    let isNewUser = false;
    
    if (!user) {
      isNewUser = true;
      logger.info(`Creando nuevo usuario para OAuth: ${email}`);
      user = await User.create({ 
        email, 
        role: "Patient", 
        name: firstName, 
        lastname: lastName, 
        dni: null, 
        password_hash: null 
      });
      
      // Crear el registro de Patient para los usuarios nuevos
      logger.info(`Creando registro de paciente para usuario: ${user.id}`);
      await Patient.create({ 
        user_id: user.id 
      });
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
    
    logger.info(`Login OAuth exitoso: ${email}, ID: ${user.id}, Rol: ${user.role}`);
    done(null, user);
  } catch (error) {
    logger.error(`Error en autenticación OAuth: ${error.message}`, { stack: error.stack });
    done(error, null);
  }
}));