const express = require("express");
const router = express.Router();
const clinicalDocumentController = require("../controllers/clinical-document.controller");
const { verifyToken, isRole } = require("../middlewares/authjwt.middleware");
const { findById } = require("../middlewares/search.middleware");
const { upload, handleMulterError } = require("../middlewares/multer.upload.middleware");

router.get("/:id", verifyToken, isRole("Patient", "Doctor", "Admin"), findById('ClinicalDocument'), clinicalDocumentController.getDocument);
router.get("/record/:id", verifyToken, findById('ClinicalRecord'), clinicalDocumentController.listDocumentsByRecord);
router.post("/upload/:id", verifyToken, isRole("Doctor", "Admin"), findById('ClinicalRecord'), upload, handleMulterError, clinicalDocumentController.uploadDocument);
router.delete("/:id", verifyToken, isRole("Doctor", "Admin"), findById('ClinicalDocument'), clinicalDocumentController.deleteDocument);

module.exports = router;
