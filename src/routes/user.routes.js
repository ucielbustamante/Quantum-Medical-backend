const express = require("express");
const router = express.Router();
const { findById, findByEmail } = require("../middlewares/search.middleware");
const userCtrl = require("../controllers/user.controller");
const { isRole, verifyToken } = require("../middlewares/authjwt.middleware");

//A ser cambiado en el futuro por search (solo hecho para integrar al front)
router.get("/", userCtrl.getAllUsers);

router.get("/:id", findById("User"), userCtrl.getUser);
router.get("/email/:email", findByEmail("User"), userCtrl.getUserByEmail);
router.post("/", verifyToken, isRole("Admin"), userCtrl.createUser);
router.put("/:id", findById("User"), userCtrl.updateUser);
router.delete("/:id", findById("User"), userCtrl.deleteUser);

module.exports = router;
