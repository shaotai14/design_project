import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Flag } from 'lucide-react'
import { formatSolutionPath } from '../../core/mazeSolver'

export default function PathDisplay({ path, className = '' }) {
  if (!path || path.length === 0) {
    return (
      <div className={`text-sm text-gray-500 dark:text-gray-400 italic ${className}`}>
        尚未求解，请点击"求解"按钮
      </div>
    )
  }

  const pathStr = formatSolutionPath(path)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-3 ${className}`}
    >
      {/* 路径统计 */}
      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4 text-green-500" />
          <span>起点: ({path[0].position.row}, {path[0].position.col})</span>
        </div>
        <ArrowRight className="w-4 h-4" />
        <div className="flex items-center gap-1">
          <Flag className="w-4 h-4 text-red-500" />
          <span>终点: ({path[path.length - 1].position.row}, {path[path.length - 1].position.col})</span>
        </div>
        <span className="ml-auto">
          共 <strong className="text-primary-600">{path.length}</strong> 步
        </span>
      </div>

      {/* 路径三元组显示 */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 overflow-x-auto">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          路径格式：(行,列,方向)  1:东 2:南 3:西 4:北
        </div>
        <div className="font-mono text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
          {pathStr}
        </div>
      </div>

      {/* 路径可视化 */}
      <div className="flex flex-wrap gap-1">
        {path.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02 }}
            className="inline-flex items-center gap-0.5"
          >
            <span className="px-1.5 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded text-xs font-mono">
              ({step.position.row},{step.position.col})
            </span>
            {index < path.length - 1 && (
              <ArrowRight className="w-3 h-3 text-gray-400" />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
