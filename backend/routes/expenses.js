const express = require('express')
const router = express.Router()
const db = require('../database')
const { authMiddleware } = require('../middleware/auth')

router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC',
      [req.userId]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { title, amount, category, date, note } = req.body
    if (!title || !amount || !category || !date) {
      return res.status(400).json({ error: 'title, amount, category and date are required' })
    }

    const result = await db.query(
      `INSERT INTO expenses (user_id, title, amount, category, date, note)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.userId, title, amount, category, date, note || '']
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, amount, category, date, note } = req.body

    const existing = await db.query(
      'SELECT * FROM expenses WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    )
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Expense not found' })

    const result = await db.query(
      `UPDATE expenses SET title = $1, amount = $2, category = $3, date = $4, note = $5
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [title, amount, category, date, note || '', id, req.userId]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' })
    }
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ')
    await db.query(
      `DELETE FROM expenses WHERE id IN (${placeholders}) AND user_id = $${ids.length + 1}`,
      [...ids, req.userId]
    )
    res.json({ message: `${ids.length} expenses deleted`, ids })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const existing = await db.query(
      'SELECT * FROM expenses WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    )
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Expense not found' })

    await db.query('DELETE FROM expenses WHERE id = $1 AND user_id = $2', [id, req.userId])
    res.json({ message: 'Expense deleted', id: Number(id) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router