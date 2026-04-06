const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, status, created_at FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, status, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { name, role, status } = req.body;
  const validRoles = ['viewer', 'analyst', 'admin'];
  const validStatuses = ['active', 'inactive'];

  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'User not found.' });

    const updates = [];
    const values = [];
    if (name) { updates.push('name = ?'); values.push(name); }
    if (role) { updates.push('role = ?'); values.push(role); }
    if (status) { updates.push('status = ?'); values.push(status); }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update.' });

    values.push(req.params.id);
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'User updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'User not found.' });

    await db.query('UPDATE users SET status = "inactive" WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deactivated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
};