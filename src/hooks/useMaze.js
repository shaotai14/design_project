import { useEffect } from 'react'
import useMazeStore from '../store/mazeStore'

/**
 * 迷宫操作 Hook
 * 封装常用的迷宫操作逻辑
 */
export function useMaze() {
  const store = useMazeStore()

  // 初始化迷宫
  useEffect(() => {
    if (store.maze.length === 0) {
      store.initMaze()
    }
  }, [])

  return {
    maze: store.maze,
    start: store.start,
    end: store.end,
    rows: store.rows,
    cols: store.cols,
    solution: store.solution,
    explorationSteps: store.explorationSteps,
    currentStepIndex: store.currentStepIndex,

    // 操作方法
    initMaze: store.initMaze,
    generateNewMaze: store.generateNewMaze,
    solve: store.solve,
    setSize: store.setSize,
    clearMaze: store.clearMaze,
    toggleWall: store.toggleWall,
    setCell: store.setCell,
  }
}
