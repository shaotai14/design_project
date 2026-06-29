import { useState, useCallback } from 'react'
import useMazeStore from '../store/mazeStore'
import { solveMaze, solveMazeBFS, findAllPaths } from '../core/mazeSolver'
import { useAnimation } from './useAnimation'
import { ALGORITHM_TYPES } from '../utils/constants'

/**
 * 路径查找 Hook
 * 结合迷宫求解和动画控制，支持 DFS/BFS 算法选择
 */
export function usePathFinding() {
  const { maze, start, ends, algorithm } = useMazeStore()
  const [steps, setSteps] = useState([])
  const [visitedCells, setVisitedCells] = useState(new Set())
  const [currentPath, setCurrentPath] = useState([])
  const [solutionPath, setSolutionPath] = useState(null)
  const [allPathsResult, setAllPathsResult] = useState(null)

  const handleStepChange = useCallback((stepIndex) => {
    if (!steps || steps.length === 0 || stepIndex < 0) return

    const visited = new Set()
    const maxIndex = Math.min(stepIndex, steps.length - 1)

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
  }, [steps])

  const animation = useAnimation(steps, handleStepChange)

  // 开始求解（使用当前选择的算法）
  const startSolving = useCallback(() => {
    if (!maze || maze.length === 0) return

    const solveFn = algorithm === ALGORITHM_TYPES.BFS ? solveMazeBFS : solveMaze
    const result = solveFn(maze, start, ends[0])
    setSteps(result.steps)
    setVisitedCells(new Set())
    setCurrentPath([])
    setSolutionPath(null)
    setAllPathsResult(null)

    animation.reset()
    return result
  }, [maze, start, ends, algorithm, animation])

  // 求解到指定终点
  const solveToEnd = useCallback((endIndex) => {
    if (!maze || maze.length === 0) return
    const end = ends[endIndex]
    if (!end) return

    const solveFn = algorithm === ALGORITHM_TYPES.BFS ? solveMazeBFS : solveMaze
    const result = solveFn(maze, start, end)
    setSteps(result.steps)
    setVisitedCells(new Set())
    setCurrentPath([])
    setSolutionPath(null)
    setAllPathsResult(null)

    animation.reset()
    return result
  }, [maze, start, ends, algorithm, animation])

  // 查找所有路径
  const findAll = useCallback(() => {
    if (!maze || maze.length === 0) return

    const result = findAllPaths(maze, start, ends)
    setAllPathsResult(result)
    return result
  }, [maze, start, ends])

  return {
    ...animation,
    steps,
    visitedCells,
    currentPath,
    solutionPath,
    allPathsResult,
    algorithm,
    startSolving,
    solveToEnd,
    findAll,
  }
}
