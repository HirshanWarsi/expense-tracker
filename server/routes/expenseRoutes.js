const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  addExpense,
  getExpenses,
  deleteExpense,
  updateExpense,
  getAnalytics,
  getCategoryBreakdown,
  getMonthlyAnalytics,
} = require("../controllers/expenseController");

// protected routes
router.post("/", protect, addExpense);
router.get("/", protect, getExpenses);
router.get("/analytics", protect, getAnalytics);
router.get("/categories", protect, getCategoryBreakdown);
router.get("/monthly", protect, getMonthlyAnalytics);
router.put("/:id", protect, updateExpense);
router.delete("/:id", protect, deleteExpense);

module.exports = router;
