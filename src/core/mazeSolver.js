import { LinkedStack } from './stack'
import { DIRECTIONS, CELL_TYPES } from '../utils/constants'
import { isInBounds } from '../utils/helpers'

/**
 * 使用基于栈的深度优先搜索求解迷宫
 * @param {number[][]} maze 迷宫二维数组
 * @param {{row: number, col: number}} start 起点
 * @param {{row: number, col: number}} end 终点
 * @returns {{path: Array|null, steps: Array}} 路径和所有探索步骤
 */
export function solveMaze(maze, start, end) {
  const rows = maze.length
  const cols = maze[0].length
  const stack = new LinkedStack()
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false))
  const steps = [] // 记录每一步用于动画

  // 标记起点为已访问
  visited[start.row][start.col] = true
  stack.push({ position: start, direction: 0 })
  steps.push({ type: 'visit', position: start })

  while (!stack.isEmpty()) {
    const current = stack.peek()
    const { row, col } = current.position

    // 到达终点
    if (row === end.row && col === end.col) {
      const path = stack.toArray().reverse()
      steps.push({ type: 'found', path })
      return { path, steps }
    }

    // 尝试四个方向
    let found = false
    for (let i = current.direction; i < 4; i++) {
      const { dr, dc } = DIRECTIONS[i]
      const newRow = row + dr
      const newCol = col + dc

      if (
        isInBounds(newRow, newCol, rows, cols) &&
        maze[newRow][newCol] === CELL_TYPES.PATH &&
        !visited[newRow][newCol]
      ) {
        visited[newRow][newCol] = true
        current.direction = i + 1
        stack.push({
          position: { row: newRow, col: newCol },
          direction: 0,
        })
        steps.push({ type: 'visit', position: { row: newRow, col: newCol } })
        found = true
        break
      }
    }

    // 死胡同，回溯
    if (!found) {
      stack.pop()
      steps.push({ type: 'backtrack', position: { row, col } })
    }
  }

  steps.push({ type: 'no-solution' })
  return { path: null, steps }
}

/**
 * 格式化路径为三元组显示
 * @param {Array} path 路径
 * @returns {string}
 */
export function formatSolutionPath(path) {
  if (!path || path.length === 0) return '无解'

  return path
    .map((step, index) => {
      const { row, col } = step.position
      // 方向是走向下一格的方向
      const dir = index < path.length - 1 ? step.direction : ''
      const dirName = dir !== '' ? DIRECTIONS[dir]?.name ?? '' : ''
      return `(${row},${col},${dirName || '终'})`
    })
    .join(' → ')
}
