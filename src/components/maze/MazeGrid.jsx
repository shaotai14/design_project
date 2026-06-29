import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import MazeCell from './MazeCell'
import { getResponsiveCellSize } from '../../utils/helpers'
import { CELL_TYPES } from '../../utils/constants'

const MazeGrid = memo(({
  maze,
  start,
  end,
  playerPosition,
  visitedCells,
  solutionPath,
  currentCell,
  cellSize: customCellSize,
  showCoordinates = false,
  onCellClick,
  onCellMouseDown,
  onCellMouseEnter,
  onCellMouseUp,
  className = '',
}) => {
  if (!maze || maze.length === 0) return null

  const rows = maze.length
  const cols = maze[0].length
  const cellSize = customCellSize || getResponsiveCellSize(cols)

  // 计算单元格状态
  const getCellState = useMemo(() => {
    return (row, col) => {
      const key = `${row},${col}`
      if (currentCell && currentCell.row === row && currentCell.col === col) return 'current'
      if (solutionPath?.some(p => p.position.row === row && p.position.col === col)) return 'solution'
      if (visitedCells?.has(key)) return 'visited'
      return null
    }
  }, [currentCell, solutionPath, visitedCells])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`inline-grid gap-[2px] p-[2px] bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
      }}
    >
      {maze.map((row, rowIdx) =>
        row.map((cell, colIdx) => (
          <MazeCell
            key={`${rowIdx}-${colIdx}`}
            type={cell}
            state={getCellState(rowIdx, colIdx)}
            size={cellSize}
            row={rowIdx}
            col={colIdx}
            isStart={start?.row === rowIdx && start?.col === colIdx}
            isEnd={end?.row === rowIdx && end?.col === colIdx}
            isPlayer={playerPosition?.row === rowIdx && playerPosition?.col === colIdx}
            showCoordinates={showCoordinates}
            onClick={() => onCellClick?.(rowIdx, colIdx)}
            onMouseDown={() => onCellMouseDown?.(rowIdx, colIdx)}
            onMouseEnter={() => onCellMouseEnter?.(rowIdx, colIdx)}
            onMouseUp={() => onCellMouseUp?.()}
          />
        ))
      )}
    </motion.div>
  )
})

MazeGrid.displayName = 'MazeGrid'

export default MazeGrid
