const express = require("express");
const router = express.Router();
const { findById } = require("../middlewares/search.middleware");
const userCtrl = require("../controllers/user.controller");
const { verifyToken, isRole } = require("../middlewares/authjwt.middleware");

router.post("/", verifyToken, isRole("Admin"), userCtrl.createUser);
router.post("/search", verifyToken, isRole("Admin"), userCtrl.searchUser);
router.put("/:id", verifyToken, isRole("Admin"), findById("User"), userCtrl.updateUser);
router.delete("/:id", verifyToken, isRole("Admin"), findById("User"), userCtrl.deleteUser);

module.exports = router;
