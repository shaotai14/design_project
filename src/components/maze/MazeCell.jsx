import { memo } from 'react'
import { motion } from 'framer-motion'
import { CELL_TYPES } from '../../utils/constants'

const cellColors = {
  wall: 'bg-maze-wall',
  path: 'bg-white dark:bg-gray-100',
  visited: 'bg-maze-visited',
  current: 'bg-maze-current',
  solution: 'bg-maze-solution',
  player: 'bg-maze-player',
  backtrack: 'bg-maze-backtrack',
  start: 'bg-green-500',
  end: 'bg-red-500',
}

const MazeCell = memo(({
  type,
  state = 'path',
  size = 40,
  isStart = false,
  isEnd = false,
  isPlayer = false,
  onClick,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  showCoordinates = false,
  row,
  col,
}) => {
  const getCellClass = () => {
    if (isPlayer) return cellColors.player
    if (isStart) return cellColors.start
    if (isEnd) return cellColors.end
    if (state === 'current') return cellColors.current
    if (state === 'solution') return cellColors.solution
    if (state === 'visited') return cellColors.visited
    if (state === 'backtrack') return cellColors.backtrack
    if (type === CELL_TYPES.WALL) return cellColors.wall
    return cellColors.path
  }

  const getCellAnimation = () => {
    if (isPlayer) {
      return { scale: [1, 1.1, 1], transition: { duration: 1, repeat: Infinity } }
    }
    if (state === 'current') {
      return { scale: [1, 1.05, 1], transition: { duration: 0.5 } }
    }
    return {}
  }

  return (
    <motion.div
      animate={getCellAnimation()}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
      className={`
        maze-cell rounded-sm border border-gray-200/20 dark:border-gray-700/30
        flex items-center justify-center select-none
        ${getCellClass()}
      `}
      style={{ width: size, height: size }}
    >
      {isStart && (
        <span className="text-white text-xs font-bold">S</span>
      )}
      {isEnd && (
        <span className="text-white text-xs font-bold">E</span>
      )}
      {isPlayer && (
        <span className="text-white text-xs">🧑</span>
      )}
      {showCoordinates && (
        <span className="text-[8px] text-gray-400 pointer-events-none">
          {row},{col}
        </span>
      )}
    </motion.div>
  )
})

MazeCell.displayName = 'MazeCell'

export default MazeCell
