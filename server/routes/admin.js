// ============================================================
// FlightZone AI — Admin Routes
// Task 3.9 — routes/admin.js
// GET   /api/admin/users        (admin only)
// PATCH /api/admin/users/:id    (update role)
// POST  /api/admin/users        (invite new user)
// ============================================================
const router = require('express').Router();
const bcrypt = require('bcrypt');
const { pool } = require('../database/db');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

// All admin routes require auth + admin role
router.use(authMiddleware);
router.use(requireRole('admin'));

/**
 * GET /api/admin/users
 * Returns all users (without password_hash).
 */
router.get('/users', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT id, employee_id, name, role, email, status, created_at
      FROM users
      ORDER BY created_at ASC
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/users/:id
 * Update a user's role and/or status.
 * Body: { role?, status? }
 */
router.patch('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    const validRoles = ['admin', 'dispatcher', 'pilot'];
    const validStatuses = ['active', 'inactive', 'pending'];

    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    // Build dynamic UPDATE
    const updates = [];
    const params = [];
    let idx = 1;

    if (role) { updates.push(`role = $${idx++}`); params.push(role); }
    if (status) { updates.push(`status = $${idx++}`); params.push(status); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    params.push(id);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}
       RETURNING id, employee_id, name, role, email, status`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `User ${id} not found` });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/users
 * Invite (create) a new user with a temporary password.
 * Body: { employeeId, name, role, email }
 * Returns the created user + the temporary password (show once only).
 */
router.post('/users', async (req, res, next) => {
  try {
    const { employeeId, name, role, email } = req.body;

    if (!employeeId || !name || !role || !email) {
      return res.status(400).json({ error: 'employeeId, name, role, and email are all required' });
    }

    const validRoles = ['admin', 'dispatcher', 'pilot'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    // Check for duplicate
    const existing = await pool.query(
      'SELECT id FROM users WHERE employee_id = $1 OR email = $2',
      [employeeId, email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Employee ID or email already exists' });
    }

    // Generate a temp password
    const tempPassword = `Temp@${Math.random().toString(36).slice(2, 10)}`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const result = await pool.query(
      `INSERT INTO users (employee_id, name, role, email, password_hash, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING id, employee_id, name, role, email, status`,
      [employeeId, name, role, email, passwordHash]
    );

    res.status(201).json({
      user: result.rows[0],
      tempPassword, // Show to admin once — they must share securely
      message: 'User created. Share the temporary password securely. User must change it on first login.',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
