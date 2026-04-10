// ============================================================
// FlightZone AI — Contact Form Route
// Task 3.17 — routes/contact.js
// POST /api/contact
// ============================================================
const router = require('express').Router();
const { pool } = require('../database/db');

/**
 * POST /api/contact
 * Body: { name, email, message }
 * 1. Saves submission to contact_submissions table.
 * 2. Attempts to send email via Resend API.
 * 3. If Resend key is missing, still succeeds (graceful degradation).
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email, and message are all required' });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    let emailSent = false;

    // ── Send via Resend ───────────────────────────────────
    if (
      process.env.RESEND_API_KEY &&
      process.env.RESEND_API_KEY !== 'YOUR_RESEND_API_KEY_HERE'
    ) {
      try {
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: process.env.CONTACT_RECIPIENT_EMAIL || email,
          subject: `[FlightZone AI] Contact Form — ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          `,
        });
        emailSent = true;
        console.log(`[CONTACT] Email sent for submission from ${email}`);
      } catch (emailErr) {
        console.error('[CONTACT] Resend email failed:', emailErr.message);
        // Do NOT throw — still save to DB and return success
      }
    } else {
      console.log('[CONTACT] Resend key not configured — logging to DB only.');
    }

    // ── Save to DB ────────────────────────────────────────
    await pool.query(
      `INSERT INTO contact_submissions (name, email, message, sent)
       VALUES ($1, $2, $3, $4)`,
      [name, email, message, emailSent]
    );

    res.json({
      success: true,
      emailSent,
      message: emailSent
        ? 'Your message has been sent. We will get back to you shortly.'
        : 'Your message has been received. We will get back to you shortly.',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
