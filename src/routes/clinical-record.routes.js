const express = require("express");
const router = express.Router();
const clinicalRecordController = require("../controllers/clinical-record.controller");
const { verifyToken, isRole } = require("../middlewares/authjwt.middleware");
const { findById } = require("../middlewares/search.middleware");

router.post("/", verifyToken, isRole("Doctor", "Admin"), clinicalRecordController.createClinicalRecord);
router.get("/:id", verifyToken, findById('ClinicalRecord'), clinicalRecordController.getClinicalRecord);
router.put("/:id", verifyToken, isRole("Doctor", "Admin"), findById('ClinicalRecord'), clinicalRecordController.updateClinicalRecord);
router.delete("/:id", verifyToken, isRole("Doctor", "Admin"), findById('ClinicalRecord'), clinicalRecordController.deleteClinicalRecord);
router.get("/", verifyToken, clinicalRecordController.searchClinicalRecords);

module.exports = router;
