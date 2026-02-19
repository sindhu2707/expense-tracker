const BASE_URL = 'http://localhost:3001/api'

// Helper to get token from localStorage
const getToken = () => localStorage.getItem('token')

// Helper to make authenticated requests
const authFetch = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options.headers
    }
  })
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

// ── Auth ──────────────────────────────────────────────
export const signup = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Signup failed')
  return data
}

export const login = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Login failed')
  return data
}

// ── Expenses ──────────────────────────────────────────
export const getExpenses = () => authFetch(`${BASE_URL}/expenses`)

export const addExpense = (expense) => authFetch(`${BASE_URL}/expenses`, {
  method: 'POST',
  body: JSON.stringify(expense)
})

export const updateExpense = (id, expense) => authFetch(`${BASE_URL}/expenses/${id}`, {
  method: 'PUT',
  body: JSON.stringify(expense)
})

export const deleteExpense = (id) => authFetch(`${BASE_URL}/expenses/${id}`, {
  method: 'DELETE'
})

export const bulkDeleteExpenses = (ids) => authFetch(`${BASE_URL}/expenses`, {
  method: 'DELETE',
  body: JSON.stringify({ ids })
})

// ── Budgets ───────────────────────────────────────────
export const getBudgets = () => authFetch(`${BASE_URL}/budgets`)

export const saveBudget = (budget) => authFetch(`${BASE_URL}/budgets`, {
  method: 'POST',
  body: JSON.stringify(budget)
})

export const deleteBudget = (id) => authFetch(`${BASE_URL}/budgets/${id}`, {
  method: 'DELETE'
})

// ── Goals ─────────────────────────────────────────────
export const getGoals = () => authFetch(`${BASE_URL}/goals`)

export const addGoal = (goal) => authFetch(`${BASE_URL}/goals`, {
  method: 'POST',
  body: JSON.stringify(goal)
})

export const updateGoal = (id, goal) => authFetch(`${BASE_URL}/goals/${id}`, {
  method: 'PUT',
  body: JSON.stringify(goal)
})

export const deleteGoal = (id) => authFetch(`${BASE_URL}/goals/${id}`, {
  method: 'DELETE'
})

export const updateProfile = (data) => authFetch(`${BASE_URL}/auth/profile`, {
  method: 'PUT',
  body: JSON.stringify(data)
})

export const changePassword = (data) => authFetch(`${BASE_URL}/auth/password`, {
  method: 'PUT',
  body: JSON.stringify(data)
})

export const deleteAccount = () => authFetch(`${BASE_URL}/auth/account`, {
  method: 'DELETE'
})