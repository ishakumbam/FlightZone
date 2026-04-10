// ============================================================
// FlightZone AI — Auth Routes
// Task 3.5 — routes/auth.js
// POST /api/auth/login
// ============================================================
const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../database/db');

/**
 * POST /api/auth/login
 * Body: { employeeId, password }
 * Returns: { token, user: { userId, employeeId, name, role } }
 */
router.post('/login', async (req, res, next) => {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      return res.status(400).json({ error: 'Employee ID and password are required' });
    }

    // Look up user by employee_id
    const result = await pool.query(
      'SELECT id, employee_id, name, role, password_hash, status FROM users WHERE employee_id = $1',
      [employeeId.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is inactive. Contact your administrator.' });
    }

    // Compare password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Sign JWT
    const token = jwt.sign(
      { userId: user.id, employeeId: user.employee_id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      token,
      user: {
        userId: user.id,
        employeeId: user.employee_id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
