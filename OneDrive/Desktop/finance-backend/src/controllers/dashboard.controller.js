const db = require('../config/db');

exports.getSummary = async (req, res) => {
  try {
    const [[income]] = await db.query(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM financial_records WHERE type = "income" AND is_deleted = 0'
    );
    const [[expense]] = await db.query(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM financial_records WHERE type = "expense" AND is_deleted = 0'
    );

    res.json({
      total_income: parseFloat(income.total),
      total_expenses: parseFloat(expense.total),
      net_balance: parseFloat(income.total) - parseFloat(expense.total),
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

exports.getCategoryTotals = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT category, type, SUM(amount) AS total
       FROM financial_records
       WHERE is_deleted = 0
       GROUP BY category, type
       ORDER BY total DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

exports.getMonthlyTrends = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         DATE_FORMAT(date, '%Y-%m') AS month,
         type,
         SUM(amount) AS total
       FROM financial_records
       WHERE is_deleted = 0
       GROUP BY month, type
       ORDER BY month DESC
       LIMIT 24`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, amount, type, category, date, notes
       FROM financial_records
       WHERE is_deleted = 0
       ORDER BY created_at DESC
       LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};