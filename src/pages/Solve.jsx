import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Layers, Code, Eye, GitBranch, ListTree } from 'lucide-react'
import MazeGrid from '../components/maze/MazeGrid'
import PathDisplay from '../components/maze/PathDisplay'
import { AnimationControls, MazeSizeControl } from '../components/maze/MazeControls'
import useMazeStore from '../store/mazeStore'
import { usePathFinding } from '../hooks/usePathFinding'
import { ALGORITHM_TYPES } from '../utils/constants'
import { formatSolutionPath } from '../core/mazeSolver'

export default function Solve() {
  const { maze, start, ends, rows, cols, algorithm, setAlgorithm, initMaze, generateNewMaze, setSize } = useMazeStore()
  const {
    isPlaying, currentStep, speed, totalSteps,
    play, pause, reset, stepForward, stepBackward, changeSpeed,
    steps, visitedCells, solutionPath, allPathsResult,
    startSolving, findAll,
  } = usePathFinding()

  const [showStack, setShowStack] = useState(false)
  const [showAllPaths, setShowAllPaths] = useState(false)

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

  // 当前队列/栈状态
  const getDataStructureState = useCallback(() => {
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

  const dataStructureState = getDataStructureState()
  const isBFS = algorithm === ALGORITHM_TYPES.BFS

  const handleFindAll = () => {
    findAll()
    setShowAllPaths(true)
  }

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
            可视化展示迷宫求解过程，支持 DFS 和 BFS 两种算法
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

            {/* 算法选择 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">算法：</span>
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                <button
                  onClick={() => setAlgorithm(ALGORITHM_TYPES.DFS)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                    !isBFS
                      ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 font-medium shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <ListTree className="w-4 h-4" />
                  DFS
                </button>
                <button
                  onClick={() => setAlgorithm(ALGORITHM_TYPES.BFS)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                    isBFS
                      ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 font-medium shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <GitBranch className="w-4 h-4" />
                  BFS
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowStack(!showStack)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showStack
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Layers className="w-4 h-4" />
              {isBFS ? '显示队列' : '显示栈'}
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
              ends={ends}
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
                {getStepDescription() || `点击"求解"开始${isBFS ? 'BFS' : 'DFS'}演示`}
              </p>
            </div>

            {/* 栈/队列状态 */}
            {showStack && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
              >
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  {isBFS ? '队列' : '栈'}状态 ({dataStructureState.length})
                </h3>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {dataStructureState.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">{isBFS ? '队列为空' : '栈为空'}</p>
                  ) : (
                    (isBFS ? dataStructureState : [...dataStructureState].reverse()).map((pos, index) => (
                      <div
                        key={index}
                        className={`px-2 py-1 rounded text-sm font-mono ${
                          (isBFS ? index === dataStructureState.length - 1 : index === 0)
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                            : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {(isBFS ? index === dataStructureState.length - 1 : index === 0) && '→ '}
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
              {isBFS ? 'BFS 最短路径' : 'DFS 路径'}
            </h3>
            <PathDisplay path={solutionPath} />
          </div>
        )}

        {/* 所有路径按钮 */}
        <div className="flex justify-center">
          <button
            onClick={handleFindAll}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
          >
            <ListTree className="w-5 h-5" />
            查找所有通关路径（DFS + BFS）
          </button>
        </div>

        {/* 所有路径结果 */}
        {showAllPaths && allPathsResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              所有通关路径
            </h3>
            <div className="space-y-6">
              {allPathsResult.results.map((result, idx) => (
                <div key={idx} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    终点 E{idx + 1}: ({result.end.row}, {result.end.col})
                    {result.hasSolution ? (
                      <span className="ml-2 text-emerald-600 dark:text-emerald-400">✓ 可达</span>
                    ) : (
                      <span className="ml-2 text-red-600 dark:text-red-400">✗ 不可达</span>
                    )}
                  </h4>
                  {result.paths.map((p, pIdx) => (
                    <div key={pIdx} className="ml-4 mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                          p.algorithm === 'DFS'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        }`}>
                          {p.algorithm}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {p.algorithm === 'BFS' ? '最短路径' : '深度优先路径'}
                          （{p.path.length} 步）
                        </span>
                      </div>
                      <div className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded p-2 overflow-x-auto">
                        {formatSolutionPath(p.path)}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
