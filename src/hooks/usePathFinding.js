import { useState, useCallback } from 'react'
import useMazeStore from '../store/mazeStore'
import { solveMaze } from '../core/mazeSolver'
import { useAnimation } from './useAnimation'

/**
 * 路径查找 Hook
 * 结合迷宫求解和动画控制
 */
export function usePathFinding() {
  const { maze, start, end } = useMazeStore()
  const [steps, setSteps] = useState([])
  const [visitedCells, setVisitedCells] = useState(new Set())
  const [currentPath, setCurrentPath] = useState([])
  const [solutionPath, setSolutionPath] = useState(null)

  const handleStepChange = useCallback((stepIndex) => {
    if (!steps || steps.length === 0 || stepIndex < 0) return

    const visited = new Set()
    const path = []
    const maxIndex = Math.min(stepIndex, steps.length - 1)

    // 重建到当前步骤的状态
    for (let i = 0; i <= maxIndex; i++) {
      const step = steps[i]
      if (!step) continue
      if (step.type === 'visit') {
        visited.add(`${step.position.row},${step.position.col}`)
      } else if (step.type === 'backtrack') {
        visited.delete(`${step.position.row},${step.position.col}`)
      } else if (step.type === 'found') {
        setSolutionPath(step.path)
      }
    }

    setVisitedCells(visited)
    setCurrentPath(path)
  }, [steps])

  const animation = useAnimation(steps, handleStepChange)

  // 开始求解
  const startSolving = useCallback(() => {
    if (!maze || maze.length === 0) return

    const result = solveMaze(maze, start, end)
    setSteps(result.steps)
    setVisitedCells(new Set())
    setCurrentPath([])
    setSolutionPath(null)

    // 重置动画
    animation.reset()

    return result
  }, [maze, start, end, animation])

  return {
    ...animation,
    steps,
    visitedCells,
    currentPath,
    solutionPath,
    startSolving,
  }
}
