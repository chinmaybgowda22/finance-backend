const db = require('../config/db');

exports.createRecord = async (req, res) => {
  const { amount, type, category, date, notes } = req.body;

  if (!amount || !type || !category || !date) {
    return res.status(400).json({ error: 'Amount, type, category, and date are required.' });
  }
  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'Type must be "income" or "expense".' });
  }
  if (isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO financial_records (amount, type, category, date, notes, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [amount, type, category, date, notes || null, req.user.id]
    );
    res.status(201).json({ message: 'Record created.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

exports.getAllRecords = async (req, res) => {
  const { type, category, start_date, end_date, page = 1, limit = 10 } = req.query;

  let query = 'SELECT * FROM financial_records WHERE is_deleted = 0';
  const params = [];

  if (type) { query += ' AND type = ?'; params.push(type); }
  if (category) { query += ' AND category = ?'; params.push(category); }
  if (start_date) { query += ' AND date >= ?'; params.push(start_date); }
  if (end_date) { query += ' AND date <= ?'; params.push(end_date); }

  query += ' ORDER BY date DESC';

  const offset = (parseInt(page) - 1) * parseInt(limit);
  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  try {
    const [rows] = await db.query(query, params);
    res.json({ page: parseInt(page), limit: parseInt(limit), data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

exports.getRecordById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM financial_records WHERE id = ? AND is_deleted = 0',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

exports.updateRecord = async (req, res) => {
  const { amount, type, category, date, notes } = req.body;

  if (type && !['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'Type must be "income" or "expense".' });
  }

  try {
    const [existing] = await db.query(
      'SELECT id FROM financial_records WHERE id = ? AND is_deleted = 0',
      [req.params.id]
    );
    if (existing.length === 0) return res.status(404).json({ error: 'Record not found.' });

    const updates = [];
    const values = [];
    if (amount) { updates.push('amount = ?'); values.push(amount); }
    if (type) { updates.push('type = ?'); values.push(type); }
    if (category) { updates.push('category = ?'); values.push(category); }
    if (date) { updates.push('date = ?'); values.push(date); }
    if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update.' });

    values.push(req.params.id);
    await db.query(`UPDATE financial_records SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'Record updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const [existing] = await db.query(
      'SELECT id FROM financial_records WHERE id = ? AND is_deleted = 0',
      [req.params.id]
    );
    if (existing.length === 0) return res.status(404).json({ error: 'Record not found.' });

    await db.query('UPDATE financial_records SET is_deleted = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Record deleted (soft delete).' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};