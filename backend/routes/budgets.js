const express = require('express')
const router = express.Router()
const db = require('../database')
const { authMiddleware } = require('../middleware/auth')

router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM budgets WHERE user_id = $1', [req.userId])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { category, amount, month } = req.body
    if (!category || !amount || !month) {
      return res.status(400).json({ error: 'category, amount and month are required' })
    }

    const existing = await db.query(
      'SELECT * FROM budgets WHERE user_id = $1 AND category = $2 AND month = $3',
      [req.userId, category, month]
    )

    if (existing.rows.length > 0) {
      const updated = await db.query(
        'UPDATE budgets SET amount = $1 WHERE id = $2 RETURNING *',
        [amount, existing.rows[0].id]
      )
      return res.json(updated.rows[0])
    }

    const result = await db.query(
      'INSERT INTO budgets (user_id, category, amount, month) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, category, amount, month]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const existing = await db.query(
      'SELECT * FROM budgets WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    )
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Budget not found' })

    await db.query('DELETE FROM budgets WHERE id = $1', [id])
    res.json({ message: 'Budget deleted', id: Number(id) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router