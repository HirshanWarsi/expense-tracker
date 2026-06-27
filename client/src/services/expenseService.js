import API from "../api/axios";

const getToken = () => localStorage.getItem("token");

export const getAnalytics = async () => {
  const response = await API.get("/expenses/analytics", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data;
};

export const addExpense = async (expenseData) => {
  const response = await API.post("/expenses", expenseData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data;
};

export const getExpenses = async () => {
  const response = await API.get("/expenses", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data;
};

export const deleteExpense = async (expenseId) => {
  const response = await API.delete(`/expenses/${expenseId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data;
};

export const updateExpense = async (expenseId, updatedData) => {
  const response = await API.put(`/expenses/${expenseId}`, updatedData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data;
};

export const getCategoryBreakdown = async () => {
  const response = await API.get("/expenses/categories", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data;
};

export const getMonthlyAnalytics = async () => {
  const response = await API.get("/expenses/monthly", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data;
};

export const analyzeFinancialInsights = async () => {
  const response = await API.post(
    "/ai/analyze",
    {},
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    },
  );

  return response.data;
};
