import { create } from 'zustand'
import { generateMaze } from '../core/mazeGenerator'
import { solveMaze } from '../core/mazeSolver'
import { createEmptyMaze, deepClone2D } from '../utils/helpers'
import { MAZE_CONFIG, GAME_STATUS } from '../utils/constants'

const useMazeStore = create((set, get) => ({
  // 迷宫数据
  maze: [],
  start: { row: 1, col: 1 },
  end: { row: 9, col: 9 },
  rows: MAZE_CONFIG.DEFAULT_ROWS,
  cols: MAZE_CONFIG.DEFAULT_COLS,

  // 求解相关
  solution: null,
  explorationSteps: [],
  currentStepIndex: -1,
  isAnimating: false,

  // 游戏相关（闯关模式）
  playerPosition: { row: 1, col: 1 },
  moveHistory: [],
  steps: 0,
  gameStatus: GAME_STATUS.IDLE,

  // 编辑器相关
  editMode: 'wall', // 'wall' | 'start' | 'end'
  isEditing: false,

  // 初始化迷宫
  initMaze: (rows, cols) => {
    const r = rows || get().rows
    const c = cols || get().cols
    const { maze, start, end } = generateMaze(r, c)
    set({
      maze,
      start,
      end,
      rows: r,
      cols: c,
      playerPosition: { ...start },
      solution: null,
      explorationSteps: [],
      currentStepIndex: -1,
      moveHistory: [],
      steps: 0,
      gameStatus: GAME_STATUS.IDLE,
    })
  },

  // 生成新迷宫
  generateNewMaze: () => {
    const { rows, cols } = get()
    const { maze, start, end } = generateMaze(rows, cols)
    set({
      maze,
      start,
      end,
      playerPosition: { ...start },
      solution: null,
      explorationSteps: [],
      currentStepIndex: -1,
      moveHistory: [],
      steps: 0,
      gameStatus: GAME_STATUS.IDLE,
    })
  },

  // 求解迷宫
  solve: () => {
    const { maze, start, end } = get()
    const result = solveMaze(maze, start, end)
    set({
      solution: result.path,
      explorationSteps: result.steps,
      currentStepIndex: -1,
    })
    return result
  },

  // 设置迷宫尺寸
  setSize: (rows, cols) => {
    set({ rows, cols })
  },

  // 闯关模式 - 移动玩家
  movePlayer: (direction) => {
    const { maze, playerPosition, end, gameStatus, moveHistory, steps } = get()
    if (gameStatus !== GAME_STATUS.PLAYING && gameStatus !== GAME_STATUS.IDLE) return false

    const { dr, dc } = direction
    const newRow = playerPosition.row + dr
    const newCol = playerPosition.col + dc
    const rows = maze.length
    const cols = maze[0].length

    // 边界检查
    if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) return false
    // 墙壁检查
    if (maze[newRow][newCol] === 1) return false

    const newPosition = { row: newRow, col: newCol }
    const newStatus = newRow === end.row && newCol === end.col ? GAME_STATUS.WON : GAME_STATUS.PLAYING

    set({
      playerPosition: newPosition,
      moveHistory: [...moveHistory, { ...playerPosition }],
      steps: steps + 1,
      gameStatus: newStatus,
    })

    return true
  },

  // 开始游戏
  startGame: () => {
    const { start } = get()
    set({
      playerPosition: { ...start },
      moveHistory: [],
      steps: 0,
      gameStatus: GAME_STATUS.PLAYING,
    })
  },

  // 重置游戏
  resetGame: () => {
    const { start } = get()
    set({
      playerPosition: { ...start },
      moveHistory: [],
      steps: 0,
      gameStatus: GAME_STATUS.IDLE,
    })
  },

  // 编辑器 - 设置单元格
  setCell: (row, col, value) => {
    const { maze } = get()
    const newMaze = deepClone2D(maze)
    newMaze[row][col] = value
    set({ maze: newMaze })
  },

  // 编辑器 - 切换墙壁
  toggleWall: (row, col) => {
    const { maze } = get()
    const newMaze = deepClone2D(maze)
    newMaze[row][col] = newMaze[row][col] === 0 ? 1 : 0
    set({ maze: newMaze })
  },

  // 编辑器 - 设置编辑模式
  setEditMode: (mode) => {
    set({ editMode: mode })
  },

  // 清空迷宫
  clearMaze: () => {
    const { rows, cols } = get()
    set({
      maze: createEmptyMaze(rows, cols),
      start: { row: 1, col: 1 },
      end: { row: rows - 2, col: cols - 2 },
      solution: null,
      explorationSteps: [],
      currentStepIndex: -1,
    })
  },
}))

export default useMazeStore
