const express = require("express");
const router = express.Router();
const { findById, findByEmail } = require("../middlewares/search.middleware");
const userCtrl = require("../controllers/user.controller");
const authJwt = require("../middlewares/authjwt.middleware");

//A ser cambiado en el futuro por search (solo hecho para integrar al front)
router.get("/", userCtrl.getAllUsers);

// Ruta pública: lista todas las Usuarios
router.get("/:id", findById("User"), userCtrl.getUser);
router.get("/email/:email", findByEmail("User"), userCtrl.getUserByEmail);

// Rutas protegidas: solo ADMIN tiene acceso
router.post("/", [authJwt.verifyToken, authJwt.isRole("Admin")], userCtrl.createUser);
router.put("/:id", [authJwt.verifyToken, authJwt.isRole("Admin")],findById("User"), userCtrl.updateUser);
router.delete("/:id", [authJwt.verifyToken, authJwt.isRole("Admin")],findById("User"), userCtrl.deleteUser);

module.exports = router;
