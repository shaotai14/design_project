import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Layers, Code, Eye } from 'lucide-react'
import MazeGrid from '../components/maze/MazeGrid'
import PathDisplay from '../components/maze/PathDisplay'
import { AnimationControls, MazeSizeControl } from '../components/maze/MazeControls'
import { LinkedStack } from '../core/stack'
import useMazeStore from '../store/mazeStore'
import { usePathFinding } from '../hooks/usePathFinding'

export default function Solve() {
  const { maze, start, end, rows, cols, initMaze, generateNewMaze, setSize } = useMazeStore()
  const {
    isPlaying, currentStep, speed, totalSteps,
    play, pause, reset, stepForward, stepBackward, changeSpeed,
    steps, visitedCells, solutionPath, startSolving,
  } = usePathFinding()

  const [showStack, setShowStack] = useState(false)

  // 初始化迷宫
  useEffect(() => {
    if (maze.length === 0) {
      initMaze()
    }
  }, [])

  // 当前步骤描述
  const getStepDescription = useCallback(() => {
    if (!steps || currentStep < 0 || currentStep >= steps.length) return ''
    const step = steps[currentStep]
    switch (step.type) {
      case 'visit':
        return `访问单元格 (${step.position.row}, ${step.position.col})`
      case 'backtrack':
        return `回溯：从 (${step.position.row}, ${step.position.col}) 退回`
      case 'found':
        return '🎉 找到终点！路径已标记'
      case 'no-solution':
        return '❌ 迷宫无解'
      default:
        return ''
    }
  }, [steps, currentStep])

  // 当前栈状态（模拟）
  const getStackState = useCallback(() => {
    if (!steps || steps.length === 0 || currentStep < 0 || currentStep >= steps.length) return []
    const stack = []
    for (let i = 0; i <= currentStep; i++) {
      const step = steps[i]
      if (!step) continue
      if (step.type === 'visit') {
        stack.push(step.position)
      } else if (step.type === 'backtrack') {
        stack.pop()
      }
    }
    return stack
  }, [steps, currentStep])

  // 当前探索的单元格
  const getCurrentCell = useCallback(() => {
    if (!steps || currentStep < 0 || currentStep >= steps.length) return null
    const step = steps[currentStep]
    if (step.type === 'visit' || step.type === 'backtrack') {
      return step.position
    }
    return null
  }, [steps, currentStep])

  const stackState = getStackState()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            算法演示
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            可视化展示基于栈的深度优先搜索求解迷宫的过程
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <MazeSizeControl
              rows={rows}
              cols={cols}
              onSizeChange={(r, c) => {
                setSize(r, c)
                initMaze(r, c)
              }}
            />
            <button
              onClick={() => setShowStack(!showStack)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showStack
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Layers className="w-4 h-4" />
              显示栈
            </button>
          </div>
          <AnimationControls
            isPlaying={isPlaying}
            isFirstStep={currentStep <= 0}
            isLastStep={currentStep >= totalSteps - 1}
            speed={speed}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPlay={play}
            onPause={pause}
            onReset={reset}
            onStepForward={stepForward}
            onStepBackward={stepBackward}
            onSpeedChange={changeSpeed}
            onGenerate={generateNewMaze}
            onSolve={startSolving}
          />
        </div>

        {/* 主内容区 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 迷宫区域 */}
          <div className="lg:col-span-2 flex justify-center">
            <MazeGrid
              maze={maze}
              start={start}
              end={end}
              visitedCells={visitedCells}
              solutionPath={solutionPath}
              currentCell={getCurrentCell()}
            />
          </div>

          {/* 侧边信息 */}
          <div className="space-y-4">
            {/* 步骤描述 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                当前步骤
              </h3>
              <p className="text-gray-700 dark:text-gray-300 min-h-[3rem]">
                {getStepDescription() || '点击"求解"开始演示'}
              </p>
            </div>

            {/* 栈状态 */}
            {showStack && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
              >
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  栈状态 ({stackState.length})
                </h3>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {stackState.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">栈为空</p>
                  ) : (
                    [...stackState].reverse().map((pos, index) => (
                      <div
                        key={index}
                        className={`px-2 py-1 rounded text-sm font-mono ${
                          index === 0
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                            : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {index === 0 && '→ '}
                        ({pos.row}, {pos.col})
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* 图例 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                图例
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-maze-wall rounded" />
                  <span className="text-gray-600 dark:text-gray-400">墙壁</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border border-gray-300 rounded" />
                  <span className="text-gray-600 dark:text-gray-400">通路</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-maze-visited rounded" />
                  <span className="text-gray-600 dark:text-gray-400">已访问</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-maze-current rounded" />
                  <span className="text-gray-600 dark:text-gray-400">当前</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-maze-solution rounded" />
                  <span className="text-gray-600 dark:text-gray-400">路径</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-maze-backtrack rounded" />
                  <span className="text-gray-600 dark:text-gray-400">回溯</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 路径显示 */}
        {solutionPath && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              求解路径
            </h3>
            <PathDisplay path={solutionPath} />
          </div>
        )}
      </motion.div>
    </div>
  )
}
