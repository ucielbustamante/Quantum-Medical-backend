const router   = require("express").Router();
const passport = require("passport");
const authCtrl = require("../controllers/auth.controller");
const logger = require("../config/logger");
const { findByEmailInBody } = require("../middlewares/search.middleware");

router.post("/register", authCtrl.register);

router.post("/login", findByEmailInBody("User"), authCtrl.login);

router.get("/google", passport.authenticate("google",{ scope:["profile","email"] }));
router.get("/google/callback",
  passport.authenticate("google",{ session:false, failureRedirect:"/login" }),
  (req,res) => {
    const jwt = require("jsonwebtoken");
    const authConfig = require("../config/auth.config");
    
    const token = jwt.sign(
      { id:req.user.id, role:req.user.role,firstName:req.user.name, lastName:req.user.lastname},
      authConfig.secret,
      { expiresIn:authConfig.expiresIn }
    );
    
    logger.info(`Redireccionando después de autenticación OAuth exitosa: Usuario ID ${req.user.id}, Email: ${req.user.email}`);
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  }
);

router.post("/reset-password", authCtrl.resetPassword);
router.post("/reset-password/confirm", authCtrl.confirmResetPassword);

module.exports = router;
