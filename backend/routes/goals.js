const express = require('express')
const router = express.Router()
const db = require('../database')
const { authMiddleware } = require('../middleware/auth')

router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, target_amount, saved_amount, deadline } = req.body
    if (!name || !target_amount) {
      return res.status(400).json({ error: 'name and target_amount are required' })
    }

    const result = await db.query(
      `INSERT INTO goals (user_id, name, target_amount, saved_amount, deadline)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, name, target_amount, saved_amount || 0, deadline || null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, target_amount, saved_amount, deadline } = req.body

    const existing = await db.query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    )
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Goal not found' })

    const result = await db.query(
      `UPDATE goals SET name = $1, target_amount = $2, saved_amount = $3, deadline = $4
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [name, target_amount, saved_amount, deadline || null, id, req.userId]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const existing = await db.query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    )
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Goal not found' })

    await db.query('DELETE FROM goals WHERE id = $1', [id])
    res.json({ message: 'Goal deleted', id: Number(id) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router