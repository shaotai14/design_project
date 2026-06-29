import { motion } from 'framer-motion'

export default function Card({
  children,
  title,
  description,
  icon: Icon,
  className = '',
  hover = true,
  onClick,
  ...props
}) {
  const Component = onClick ? motion.button : motion.div

  return (
    <Component
      whileHover={hover ? { y: -2, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' } : {}}
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
        p-6 text-left transition-shadow
        ${onClick ? 'cursor-pointer hover:border-primary-300 dark:hover:border-primary-600' : ''}
        ${className}
      `}
      {...props}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
      )}
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {description}
        </p>
      )}
      {children}
    </Component>
  )
}
