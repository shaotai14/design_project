import { CELL_TYPES, MAZE_CONFIG } from './constants'

/**
 * 创建空迷宫
 * @param {number} rows 行数
 * @param {number} cols 列数
 * @returns {number[][]} 迷宫二维数组
 */
export function createEmptyMaze(rows = MAZE_CONFIG.DEFAULT_ROWS, cols = MAZE_CONFIG.DEFAULT_COLS) {
  return Array.from({ length: rows }, () => Array(cols).fill(CELL_TYPES.WALL))
}

/**
 * 验证坐标是否在迷宫范围内
 * @param {number} row 行
 * @param {number} col 列
 * @param {number} rows 总行数
 * @param {number} cols 总列数
 * @returns {boolean}
 */
export function isInBounds(row, col, rows, cols) {
  return row >= 0 && row < rows && col >= 0 && col < cols
}

/**
 * 格式化路径为三元组字符串
 * @param {Array} path 路径数组
 * @returns {string} 格式化后的路径字符串
 */
export function formatPath(path) {
  if (!path || path.length === 0) return ''

  return path
    .map((step, index) => {
      const { row, col } = step.position
      const direction = index < path.length - 1 ? path[index + 1].direction ?? '' : ''
      return `(${row},${col}${direction ? ',' + direction : ''})`
    })
    .join(' → ')
}

/**
 * 计算单元格大小（响应式）
 * @param {number} cols 列数
 * @returns {number} 单元格像素大小
 */
export function getResponsiveCellSize(cols) {
  if (cols <= 11) return MAZE_CONFIG.DEFAULT_CELL_SIZE
  if (cols <= 21) return 30
  if (cols <= 31) return 24
  return 18
}

/**
 * 深拷贝二维数组
 * @param {any[][]} arr 二维数组
 * @returns {any[][]}
 */
export function deepClone2D(arr) {
  return arr.map(row => [...row])
}

/**
 * 生成随机整数 [min, max)
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}
