const { generateFinancialReport } = require("../services/aiService");

const analyzeFinancialHealth = async (req, res) => {
  try {
    const result = await generateFinancialReport(req.user.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "AI analysis failed",
    });
  }
};

module.exports = {
  analyzeFinancialHealth,
};
