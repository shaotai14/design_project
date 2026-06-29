import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Waypoints, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { ROUTES } from '../../utils/constants'

const navItems = [
  { path: ROUTES.HOME, label: '首页' },
  { path: ROUTES.PLAY, label: '闯关模式' },
  { path: ROUTES.SOLVE, label: '算法演示' },
  { path: ROUTES.EDITOR, label: '迷宫编辑' },
  { path: ROUTES.ABOUT, label: '关于' },
]

export default function Header() {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              <Waypoints className="w-8 h-8 text-primary-500" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              迷宫求解器
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className={isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary-50 dark:bg-primary-900/30 rounded-lg -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden pb-4"
          >
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </motion.nav>
        )}
      </div>
    </header>
  )
}
