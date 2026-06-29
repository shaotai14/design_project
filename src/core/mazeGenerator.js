import { CELL_TYPES } from '../utils/constants'
import { isInBounds, randomInt } from '../utils/helpers'

/**
 * 使用 Prim 算法生成迷宫
 * @param {number} rows 行数（奇数）
 * @param {number} cols 列数（奇数）
 * @returns {{maze: number[][], start: {row,col}, end: {row,col}}}
 */
export function generateMaze(rows, cols) {
  // 确保行列为奇数
  rows = rows % 2 === 0 ? rows + 1 : rows
  cols = cols % 2 === 0 ? cols + 1 : cols

  // 初始化迷宫，全部为墙
  const maze = Array.from({ length: rows }, () => Array(cols).fill(CELL_TYPES.WALL))

  // 起点（奇数位置）
  const start = { row: 1, col: 1 }
  maze[start.row][start.col] = CELL_TYPES.PATH

  // 墙列表
  const walls = []
  addWalls(walls, start, maze, rows, cols)

  while (walls.length > 0) {
    const randomIndex = randomInt(0, walls.length)
    const wall = walls[randomIndex]
    walls.splice(randomIndex, 1)

    const { row, col } = wall

    // 检查墙两侧的单元格
    const neighbors = getPassageNeighbors(wall, maze, rows, cols)

    if (neighbors.length === 1) {
      maze[row][col] = CELL_TYPES.PATH
      addWalls(walls, wall, maze, rows, cols)
    }
  }

  // 设置入口和出口
  const end = { row: rows - 2, col: cols - 2 }
  maze[start.row][start.col] = CELL_TYPES.PATH
  maze[end.row][end.col] = CELL_TYPES.PATH

  return { maze, start, end }
}

/**
 * 添加周围的墙到列表
 */
function addWalls(walls, cell, maze, rows, cols) {
  const directions = [
    { dr: -2, dc: 0 },
    { dr: 2, dc: 0 },
    { dr: 0, dc: -2 },
    { dr: 0, dc: 2 },
  ]

  for (const { dr, dc } of directions) {
    const wallRow = cell.row + dr / 2
    const wallCol = cell.col + dc / 2
    const nextRow = cell.row + dr
    const nextCol = cell.col + dc

    if (
      isInBounds(nextRow, nextCol, rows, cols) &&
      maze[nextRow][nextCol] === CELL_TYPES.WALL &&
      !walls.some(w => w.row === wallRow && w.col === wallCol)
    ) {
      walls.push({ row: wallRow, col: wallCol })
    }
  }
}

/**
 * 获取墙两侧已打通的邻居
 */
function getPassageNeighbors(wall, maze, rows, cols) {
  const neighbors = []
  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ]

  for (const { dr, dc } of directions) {
    const nr = wall.row + dr
    const nc = wall.col + dc

    if (isInBounds(nr, nc, rows, cols) && maze[nr][nc] === CELL_TYPES.PATH) {
      neighbors.push({ row: nr, col: nc })
    }
  }

  return neighbors
}
