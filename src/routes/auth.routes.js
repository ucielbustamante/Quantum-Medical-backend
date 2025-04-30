const router   = require("express").Router();
const passport = require("passport");
const authCtrl = require("../controllers/auth.controller");

router.post("/register", authCtrl.register);

router.post("/login", authCtrl.login);

router.get("/google", passport.authenticate("google",{ scope:["profile","email"] }));
router.get("/google/callback",
  passport.authenticate("google",{ session:false, failureRedirect:"/login" }),
  (req,res) => {
    const token = require("jsonwebtoken")
      .sign({ id:req.user.id, role:req.user.role },
            require("../config/auth.config").secret,
            { expiresIn:require("../config/auth.config").expiresIn }
      );
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  }
);

module.exports = router;
