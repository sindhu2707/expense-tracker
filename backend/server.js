require('dotenv').config()
const express = require('express')
const cors = require('cors')
const db = require('./database')  
const expensesRouter = require('./routes/expenses')
const budgetsRouter = require('./routes/budgets')  
const goalsRouter = require('./routes/goals')
const authRouter = require('./routes/auth') 

const app = express()
const PORT = 3001

// Middleware — these two lines let your server read JSON and accept requests from React
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRouter) 
app.use('/api/expenses', expensesRouter)
app.use('/api/budgets', budgetsRouter)    
app.use('/api/goals', goalsRouter)

// Your first route — just to test everything works
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is alive!' })
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})