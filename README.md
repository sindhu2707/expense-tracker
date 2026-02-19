# Expense Tracker

A full-stack expense tracking web app built with React, Node.js, Express, and PostgreSQL.

## Features

- JWT authentication (signup, login, logout)
- Add, edit, delete expenses
- Bulk delete expenses
- Category-wise budget management
- Savings goals tracker
- Spending heatmap calendar
- Monthly expense charts
- Multi-currency support with live conversion
- Profile settings (username, password, delete account)

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Framer Motion, Recharts  
**Backend:** Node.js, Express, PostgreSQL  
**Auth:** JWT (JSON Web Tokens)  

## Local Setup

### Prerequisites
- Node.js
- PostgreSQL

### Backend
```bash
cd backend
npm install
```
Create a `.env` file:
```
JWT_SECRET=your-secret-key
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/expense_tracker
```
```bash
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

