import { motion, AnimatePresence } from "framer-motion";

function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Yes",
  isDanger = true,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="bg-gray-900 border border-white/10 rounded-3xl shadow-2xl p-8 w-full max-w-sm mx-4"
            initial={{ scale: 0.85, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className={`w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center ${
              isDanger ? "bg-red-500/20" : "bg-indigo-500/20"
            }`}>
              {isDanger ? (
                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              ) : (
                <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )}
            </div>

            {/* Text */}
            <h2 className="text-xl font-bold text-gray-100 text-center mb-2">{title}</h2>
            <p className="text-sm text-gray-400 text-center mb-8 leading-relaxed">{message}</p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-gray-300 bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all duration-200 ${
                  isDanger
                    ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"
                    : "bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-lg shadow-indigo-500/20"
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmModal;