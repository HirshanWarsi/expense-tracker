const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { analyzeFinancialHealth } = require("../controllers/aiController");

router.post("/analyze", protect, analyzeFinancialHealth);

module.exports = router;
