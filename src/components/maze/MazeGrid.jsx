import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import MazeCell from './MazeCell'
import { getResponsiveCellSize } from '../../utils/helpers'
import { CELL_TYPES } from '../../utils/constants'

const MazeGrid = memo(({
  maze,
  start,
  ends,
  end, // 兼容单终点
  playerPosition,
  reachedEnds,
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

  // 兼容：如果传了 end 但没传 ends，转为数组
  const endpoints = ends || (end ? [end] : [])

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

  // 判断是否是终点及其索引
  const getEndInfo = useMemo(() => {
    return (row, col) => {
      for (let i = 0; i < endpoints.length; i++) {
        if (endpoints[i].row === row && endpoints[i].col === col) {
          return { isEnd: true, index: i }
        }
      }
      return { isEnd: false, index: -1 }
    }
  }, [endpoints])

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
        row.map((cell, colIdx) => {
          const endInfo = getEndInfo(rowIdx, colIdx)
          return (
            <MazeCell
              key={`${rowIdx}-${colIdx}`}
              type={cell}
              state={getCellState(rowIdx, colIdx)}
              size={cellSize}
              row={rowIdx}
              col={colIdx}
              isStart={start?.row === rowIdx && start?.col === colIdx}
              isEnd={endInfo.isEnd}
              endIndex={endInfo.index}
              endReached={endInfo.isEnd && reachedEnds?.has(endInfo.index)}
              isPlayer={playerPosition?.row === rowIdx && playerPosition?.col === colIdx}
              showCoordinates={showCoordinates}
              onClick={() => onCellClick?.(rowIdx, colIdx)}
              onMouseDown={() => onCellMouseDown?.(rowIdx, colIdx)}
              onMouseEnter={() => onCellMouseEnter?.(rowIdx, colIdx)}
              onMouseUp={() => onCellMouseUp?.()}
            />
          )
        })
      )}
    </motion.div>
  )
})

MazeGrid.displayName = 'MazeGrid'

export default MazeGrid
