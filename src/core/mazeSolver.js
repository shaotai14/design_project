import { LinkedStack } from './stack'
import { DIRECTIONS, CELL_TYPES } from '../utils/constants'
import { isInBounds } from '../utils/helpers'

/**
 * 使用基于栈的深度优先搜索求解迷宫（DFS）
 * @param {number[][]} maze 迷宫二维数组
 * @param {{row: number, col: number}} start 起点
 * @param {{row: number, col: number}} end 终点
 * @returns {{path: Array|null, steps: Array}}
 */
export function solveMaze(maze, start, end) {
  const rows = maze.length
  const cols = maze[0].length
  const stack = new LinkedStack()
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false))
  const steps = []

  visited[start.row][start.col] = true
  stack.push({ position: start, direction: 0 })
  steps.push({ type: 'visit', position: start })

  while (!stack.isEmpty()) {
    const current = stack.peek()
    const { row, col } = current.position

    if (row === end.row && col === end.col) {
      const path = stack.toArray().reverse()
      steps.push({ type: 'found', path })
      return { path, steps }
    }

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

    if (!found) {
      stack.pop()
      steps.push({ type: 'backtrack', position: { row, col } })
    }
  }

  steps.push({ type: 'no-solution' })
  return { path: null, steps }
}

/**
 * 使用基于队列的广度优先搜索求解迷宫（BFS）
 * BFS 找到的路径保证是最短路径
 * @param {number[][]} maze 迷宫二维数组
 * @param {{row: number, col: number}} start 起点
 * @param {{row: number, col: number}} end 终点
 * @returns {{path: Array|null, steps: Array}}
 */
export function solveMazeBFS(maze, start, end) {
  const rows = maze.length
  const cols = maze[0].length
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false))
  const parent = Array.from({ length: rows }, () => Array(cols).fill(null))
  const steps = []

  // 队列：每个元素是 {row, col}
  const queue = []
  queue.push(start)
  visited[start.row][start.col] = true
  steps.push({ type: 'visit', position: start })

  let found = false

  while (queue.length > 0) {
    const current = queue.shift()
    const { row, col } = current

    // 到达终点
    if (row === end.row && col === end.col) {
      found = true
      break
    }

    // 尝试四个方向
    for (const { dr, dc } of DIRECTIONS) {
      const newRow = row + dr
      const newCol = col + dc

      if (
        isInBounds(newRow, newCol, rows, cols) &&
        maze[newRow][newCol] === CELL_TYPES.PATH &&
        !visited[newRow][newCol]
      ) {
        visited[newRow][newCol] = true
        parent[newRow][newCol] = { row, col }
        queue.push({ row: newRow, col: newCol })
        steps.push({ type: 'visit', position: { row: newRow, col: newCol } })
      }
    }
  }

  if (!found) {
    steps.push({ type: 'no-solution' })
    return { path: null, steps }
  }

  // 回溯路径
  const path = []
  let current = end
  while (current) {
    path.push({ position: current, direction: 0 })
    current = parent[current.row][current.col]
  }
  path.reverse()

  // 补充方向信息
  for (let i = 0; i < path.length - 1; i++) {
    const curr = path[i].position
    const next = path[i + 1].position
    const dr = next.row - curr.row
    const dc = next.col - curr.col
    const dir = DIRECTIONS.find(d => d.dr === dr && d.dc === dc)
    if (dir) path[i].direction = dir.code - 1
  }

  steps.push({ type: 'found', path })
  return { path, steps }
}

/**
 * 查找从起点到所有终点的所有路径
 * @param {number[][]} maze 迷宫
 * @param {{row,col}} start 起点
 * @param {{row,col}[]} ends 终点数组
 * @returns {{results: Array<{end, path, steps}>, allPaths: Array}}
 */
export function findAllPaths(maze, start, ends) {
  const results = []
  const allPaths = []

  for (const end of ends) {
    // 使用 DFS 找到一条路径
    const dfsResult = solveMaze(maze, start, end)
    // 使用 BFS 找到最短路径
    const bfsResult = solveMazeBFS(maze, start, end)

    const paths = []
    if (dfsResult.path) paths.push({ algorithm: 'DFS', path: dfsResult.path })
    if (bfsResult.path) paths.push({ algorithm: 'BFS', path: bfsResult.path })

    results.push({
      end,
      paths,
      hasSolution: paths.length > 0,
    })

    allPaths.push(...paths)
  }

  return { results, allPaths }
}

/**
 * 验证迷宫是否有解（所有终点可达）
 * @param {number[][]} maze 迷宫
 * @param {{row,col}} start 起点
 * @param {{row,col}[]} ends 终点数组
 * @returns {boolean}
 */
export function validateMaze(maze, start, ends) {
  for (const end of ends) {
    const result = solveMaze(maze, start, end)
    if (!result.path) return false
  }
  return true
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
      const dir = index < path.length - 1 ? step.direction : ''
      const dirName = dir !== '' ? DIRECTIONS[dir]?.name ?? '' : ''
      return `(${row},${col},${dirName || '终'})`
    })
    .join(' → ')
}
