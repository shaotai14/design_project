import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export default function Sidebar({ children, title, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 280 : 48 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-3 right-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
        aria-label={isOpen ? '收起侧边栏' : '展开侧边栏'}
      >
        {isOpen ? (
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* Content */}
      <div className="h-full overflow-y-auto p-4">
        {isOpen && title && (
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 pr-8">
            {title}
          </h3>
        )}
        {isOpen && children}
      </div>
    </motion.aside>
  )
}
