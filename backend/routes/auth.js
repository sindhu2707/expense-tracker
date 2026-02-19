const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../database')
const { authMiddleware } = require('../middleware/auth')

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await db.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
      [email, hashedPassword]
    )

    const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({
      message: 'Account created!',
      token,
      user: { id: result.rows[0].id, email }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' })
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.json({
      message: 'Logged in!',
      token,
      user: { id: user.id, email: user.email }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Update username
router.put('/profile', authMiddleware, async (req, res) => {
  const { username } = req.body
  try {
    await db.query('UPDATE users SET username = $1 WHERE id = $2', [username, req.userId])
    res.json({ username })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// Change password
router.put('/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.userId])
    const user = result.rows[0]
    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' })
    const hashed = await bcrypt.hash(newPassword, 10)
    await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.userId])
    res.json({ message: 'Password updated' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password' })
  }
})

// Delete account
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM expenses WHERE user_id = $1', [req.userId])
    await db.query('DELETE FROM budgets WHERE user_id = $1', [req.userId])
    await db.query('DELETE FROM goals WHERE user_id = $1', [req.userId])
    await db.query('DELETE FROM users WHERE id = $1', [req.userId])
    res.json({ message: 'Account deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account' })
  }
})

module.exports = router