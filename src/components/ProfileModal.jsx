import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as api from '../api'
import toast from 'react-hot-toast'
import { CURRENCIES } from '../utils/currency'

function ProfileModal({ user, currency, onCurrencyChange, onClose, onUpdateUser, onDeleteAccount }) {
  const [tab, setTab] = useState('profile')
  const [username, setUsername] = useState(user?.username || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpdateUsername = async () => {
    if (!username.trim()) return toast.error('Username cannot be empty')
    setLoading(true)
    try {
      const updated = await api.updateProfile({ username })
      onUpdateUser({ ...user, username: updated.username })
      toast.success('Username updated!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match')
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await api.changePassword({ currentPassword, newPassword })
      toast.success('Password changed!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])


  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gray-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col"
          initial={{ scale: 0.85, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-gray-100">Profile Settings</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-gray-100 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-white/5 mx-6 mt-6 rounded-2xl p-1">
            {['profile', 'password', 'currency'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${
                  tab === t ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4 overflow-y-auto flex-1">

            {/* Profile Tab */}
            {tab === 'profile' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <input
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-400 transition-all"
                  />
                </div>
                <button
                  onClick={handleUpdateUsername}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-all"
                >
                  {loading ? 'Saving...' : 'Save Username'}
                </button>

                {/* Danger Zone */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-sm font-semibold text-red-400 mb-3">Danger Zone</p>
                  <button
                    onClick={() => { onClose(); onDeleteAccount() }}
                    className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-2xl font-semibold transition-all text-sm"
                  >
                    Delete Account
                  </button>
                </div>
              </>
            )}

            {/* Password Tab */}
            {tab === 'password' && (
              <>
                {['Current Password', 'New Password', 'Confirm New Password'].map((label, i) => {
                  const vals = [currentPassword, newPassword, confirmPassword]
                  const setters = [setCurrentPassword, setNewPassword, setConfirmPassword]
                  return (
                    <div key={label}>
                      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
                      <input
                        type="password"
                        value={vals[i]}
                        onChange={(e) => setters[i](e.target.value)}
                        placeholder="••••••"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-400 transition-all"
                      />
                    </div>
                  )
                })}
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-all"
                >
                  {loading ? 'Saving...' : 'Change Password'}
                </button>
              </>
            )}

            {/* Currency Tab */}
            {tab === 'currency' && (
              <>
                <p className="text-sm text-gray-400">Select your default currency. This will apply across the entire dashboard.</p>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {Object.entries(CURRENCIES).map(([code, { symbol, name }]) => (
                    <button
                      key={code}
                      onClick={() => { onCurrencyChange(code); toast.success(`Currency set to ${code}`) }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${
                        currency === code
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xl font-bold">{symbol}</span>
                      <div>
                        <p className="text-sm font-semibold">{code}</p>
                        <p className="text-xs text-gray-500">{name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ProfileModal;