import { useState } from 'react'
import { login, signup } from '../api'

export default function AuthPage({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = isLogin
        ? await login(email, password)
        : await signup(email, password)

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      onAuth(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-gray-100">Expense Tracker</h1>
          <p className="text-gray-400 mt-2">Track your spending, reach your goals</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          
          {/* Toggle */}
          <div className="flex bg-white/5 rounded-2xl p-1 mb-8">
            <button
              onClick={() => { setIsLogin(true); setError('') }}
              className={`flex-1 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                isLogin ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError('') }}
              className={`flex-1 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                !isLogin ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg transition-all duration-200 mt-2"
            >
              {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError('') }}
            className="text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}