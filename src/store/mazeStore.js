import { create } from 'zustand'
import { generateMaze } from '../core/mazeGenerator'
import { solveMaze, solveMazeBFS, validateMaze } from '../core/mazeSolver'
import { createEmptyMaze, deepClone2D } from '../utils/helpers'
import { MAZE_CONFIG, GAME_STATUS, ALGORITHM_TYPES } from '../utils/constants'

const useMazeStore = create((set, get) => ({
  // 迷宫数据
  maze: [],
  start: { row: 1, col: 1 },
  ends: [{ row: 9, col: 9 }],
  rows: MAZE_CONFIG.DEFAULT_ROWS,
  cols: MAZE_CONFIG.DEFAULT_COLS,

  // 算法选择
  algorithm: ALGORITHM_TYPES.DFS,

  // 求解相关
  solution: null,
  allSolutions: [],
  explorationSteps: [],
  currentStepIndex: -1,
  isAnimating: false,

  // 游戏相关（闯关模式）
  playerPosition: { row: 1, col: 1 },
  reachedEnds: new Set(),
  moveHistory: [],
  pathCells: new Set(), // 玩家走过的路径（用于染色）
  steps: 0,
  gameStatus: GAME_STATUS.IDLE,

  // 编辑器相关
  editMode: 'wall',
  isEditing: false,

  // 设置算法
  setAlgorithm: (algorithm) => {
    set({ algorithm })
  },

  // 初始化迷宫
  initMaze: (rows, cols, endCount = 1) => {
    const r = rows || get().rows
    const c = cols || get().cols
    const { maze, start, ends } = generateMaze(r, c, endCount)
    set({
      maze,
      start,
      ends,
      rows: r,
      cols: c,
      playerPosition: { ...start },
      reachedEnds: new Set(),
      solution: null,
      allSolutions: [],
      explorationSteps: [],
      currentStepIndex: -1,
      moveHistory: [],
      pathCells: new Set(),
      steps: 0,
      gameStatus: GAME_STATUS.IDLE,
    })
  },

  // 生成新迷宫
  generateNewMaze: (endCount) => {
    const { rows, cols, ends } = get()
    const count = endCount ?? ends.length
    const { maze, start, ends: newEnds } = generateMaze(rows, cols, count)
    set({
      maze,
      start,
      ends: newEnds,
      playerPosition: { ...start },
      reachedEnds: new Set(),
      solution: null,
      allSolutions: [],
      explorationSteps: [],
      currentStepIndex: -1,
      moveHistory: [],
      pathCells: new Set(),
      steps: 0,
      gameStatus: GAME_STATUS.IDLE,
    })
  },

  // 生成闯关用的有效迷宫（确保有解）
  generateValidPlayMaze: (endCount = 1) => {
    const { rows, cols } = get()
    let attempts = 0
    const maxAttempts = 50

    while (attempts < maxAttempts) {
      const { maze, start, ends } = generateMaze(rows, cols, endCount)
      if (validateMaze(maze, start, ends)) {
        set({
          maze,
          start,
          ends,
          playerPosition: { ...start },
          reachedEnds: new Set(),
          solution: null,
          allSolutions: [],
          explorationSteps: [],
          currentStepIndex: -1,
          moveHistory: [],
          pathCells: new Set(),
          steps: 0,
          gameStatus: GAME_STATUS.IDLE,
        })
        return true
      }
      attempts++
    }

    // 兜底：使用默认迷宫
    const result = generateMaze(rows, cols, endCount)
    set({
      maze: result.maze,
      start: result.start,
      ends: result.ends,
      playerPosition: { ...result.start },
      reachedEnds: new Set(),
      solution: null,
      allSolutions: [],
      explorationSteps: [],
      currentStepIndex: -1,
      moveHistory: [],
      pathCells: new Set(),
      steps: 0,
      gameStatus: GAME_STATUS.IDLE,
    })
    return false
  },

  // 求解迷宫（根据当前算法）
  solve: () => {
    const { maze, start, ends, algorithm } = get()
    const solveFn = algorithm === ALGORITHM_TYPES.BFS ? solveMazeBFS : solveMaze
    // 求解到第一个终点
    const result = solveFn(maze, start, ends[0])
    set({
      solution: result.path,
      explorationSteps: result.steps,
      currentStepIndex: -1,
    })
    return result
  },

  // 求解到指定终点
  solveToEnd: (endIndex) => {
    const { maze, start, ends, algorithm } = get()
    const end = ends[endIndex]
    if (!end) return null
    const solveFn = algorithm === ALGORITHM_TYPES.BFS ? solveMazeBFS : solveMaze
    const result = solveFn(maze, start, end)
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
    const { maze, playerPosition, ends, gameStatus, moveHistory, pathCells, steps, reachedEnds } = get()
    if (gameStatus !== GAME_STATUS.PLAYING && gameStatus !== GAME_STATUS.IDLE) return false

    const { dr, dc } = direction
    const newRow = playerPosition.row + dr
    const newCol = playerPosition.col + dc
    const rows = maze.length
    const cols = maze[0].length

    if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) return false
    if (maze[newRow][newCol] === 1) return false

    const newPosition = { row: newRow, col: newCol }

    // 检测回退：如果目标位置是 moveHistory 中的上一个位置，则为回退
    const isBacktrack = moveHistory.length > 0 &&
      moveHistory[moveHistory.length - 1].row === newRow &&
      moveHistory[moveHistory.length - 1].col === newCol

    const newReached = new Set(reachedEnds)
    const newPathCells = new Set(pathCells)

    if (isBacktrack) {
      // 回退：从路径中移除当前位置，不计入步数
      const currentKey = `${playerPosition.row},${playerPosition.col}`
      newPathCells.delete(currentKey)
      const newHistory = moveHistory.slice(0, -1)

      // 检查是否到达终点
      ends.forEach((end, index) => {
        if (newRow === end.row && newCol === end.col) {
          newReached.add(index)
        }
      })

      set({
        playerPosition: newPosition,
        reachedEnds: newReached,
        moveHistory: newHistory,
        pathCells: newPathCells,
        // 步数不增加（回退不计步）
        gameStatus: newReached.size === ends.length ? GAME_STATUS.WON : GAME_STATUS.PLAYING,
      })
    } else {
      // 正常前进：将当前位置加入路径
      const currentKey = `${playerPosition.row},${playerPosition.col}`
      newPathCells.add(currentKey)

      // 检查是否到达终点
      ends.forEach((end, index) => {
        if (newRow === end.row && newCol === end.col) {
          newReached.add(index)
        }
      })

      set({
        playerPosition: newPosition,
        reachedEnds: newReached,
        moveHistory: [...moveHistory, { ...playerPosition }],
        pathCells: newPathCells,
        steps: steps + 1,
        gameStatus: newReached.size === ends.length ? GAME_STATUS.WON : GAME_STATUS.PLAYING,
      })
    }

    return true
  },

  // 开始游戏
  startGame: () => {
    const { start } = get()
    set({
      playerPosition: { ...start },
      reachedEnds: new Set(),
      moveHistory: [],
      pathCells: new Set(),
      steps: 0,
      gameStatus: GAME_STATUS.PLAYING,
    })
  },

  // 重置游戏
  resetGame: () => {
    const { start } = get()
    set({
      playerPosition: { ...start },
      reachedEnds: new Set(),
      moveHistory: [],
      pathCells: new Set(),
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

  // 编辑器 - 添加终点
  addEnd: (row, col) => {
    const { ends, maze } = get()
    // 检查是否已经是起点或终点
    if (ends.some(e => e.row === row && e.col === col)) return
    const newMaze = deepClone2D(maze)
    newMaze[row][col] = 0
    set({
      ends: [...ends, { row, col }],
      maze: newMaze,
    })
  },

  // 编辑器 - 移除终点
  removeEnd: (index) => {
    const { ends } = get()
    if (ends.length <= 1) return // 至少保留一个终点
    set({ ends: ends.filter((_, i) => i !== index) })
  },

  // 编辑器 - 设置起点
  setStart: (row, col) => {
    const { maze, start } = get()
    const newMaze = deepClone2D(maze)
    if (start) newMaze[start.row][start.col] = 0
    newMaze[row][col] = 0
    set({ maze: newMaze, start: { row, col } })
  },

  // 清空迷宫
  clearMaze: () => {
    const { rows, cols } = get()
    set({
      maze: createEmptyMaze(rows, cols),
      start: { row: 1, col: 1 },
      ends: [{ row: rows - 2, col: cols - 2 }],
      solution: null,
      allSolutions: [],
      explorationSteps: [],
      currentStepIndex: -1,
    })
  },
}))

export default useMazeStore
