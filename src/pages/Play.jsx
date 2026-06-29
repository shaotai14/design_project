import { useEffect, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Footprints, RotateCcw, Shuffle, Target } from 'lucide-react'
import MazeGrid from '../components/maze/MazeGrid'
import Button from '../components/common/Button'
import useMazeStore from '../store/mazeStore'
import { GAME_STATUS, DIRECTIONS } from '../utils/constants'

export default function Play() {
  const {
    maze, start, ends, playerPosition, steps, gameStatus, reachedEnds, pathCells,
    generateValidPlayMaze, movePlayer, startGame, resetGame,
  } = useMazeStore()

  const [endCount, setEndCount] = useState(1)

  // 初始化迷宫（确保有解）
  useEffect(() => {
    if (maze.length === 0) {
      generateValidPlayMaze(endCount)
    }
  }, [])

  // 键盘控制
  const handleKeyDown = useCallback((e) => {
    if (gameStatus !== GAME_STATUS.PLAYING && gameStatus !== GAME_STATUS.IDLE) return

    if (gameStatus === GAME_STATUS.IDLE) {
      startGame()
    }

    const keyMap = {
      ArrowUp: DIRECTIONS[3],
      ArrowDown: DIRECTIONS[1],
      ArrowLeft: DIRECTIONS[2],
      ArrowRight: DIRECTIONS[0],
      w: DIRECTIONS[3],
      s: DIRECTIONS[1],
      a: DIRECTIONS[2],
      d: DIRECTIONS[0],
    }

    const direction = keyMap[e.key]
    if (direction) {
      e.preventDefault()
      movePlayer(direction)
    }
  }, [gameStatus, movePlayer, startGame])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const isWon = gameStatus === GAME_STATUS.WON
  const reachedCount = reachedEnds?.size ?? 0

  const handleNewMaze = () => {
    generateValidPlayMaze(endCount)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            闯关模式
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            使用方向键或 WASD 控制角色走出迷宫
          </p>
        </div>

        {/* 终点数量选择 */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">终点数量：</span>
          {[1, 2, 3].map(count => (
            <button
              key={count}
              onClick={() => {
                setEndCount(count)
                generateValidPlayMaze(count)
              }}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                endCount === count
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {count} 个终点
            </button>
          ))}
        </div>

        {/* 游戏状态栏 */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Footprints className="w-5 h-5 text-primary-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">步数:</span>
            <span className="font-bold text-gray-900 dark:text-white">{steps}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <span className="text-2xl">🧑</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">位置:</span>
            <span className="font-mono text-gray-900 dark:text-white">
              ({playerPosition.row}, {playerPosition.col})
            </span>
          </div>
          {ends.length > 1 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <Target className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">终点:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {reachedCount}/{ends.length}
              </span>
            </div>
          )}
        </div>

        {/* 已到达终点提示 */}
        {ends.length > 1 && reachedCount > 0 && !isWon && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {ends.map((end, index) => (
              <div
                key={index}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  reachedEnds?.has(index)
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}
              >
                E{index + 1} ({end.row},{end.col})
                {reachedEnds?.has(index) && ' ✓'}
              </div>
            ))}
          </div>
        )}

        {/* 控制按钮 */}
        <div className="flex items-center justify-center gap-3">
          {gameStatus === GAME_STATUS.IDLE && (
            <Button variant="primary" icon={Trophy} onClick={startGame}>
              开始挑战
            </Button>
          )}
          <Button variant="secondary" icon={RotateCcw} onClick={resetGame}>
            重置
          </Button>
          <Button variant="secondary" icon={Shuffle} onClick={handleNewMaze}>
            新迷宫
          </Button>
        </div>

        {/* 迷宫 */}
        <div className="flex justify-center">
          <MazeGrid
            maze={maze}
            start={start}
            ends={ends}
            playerPosition={playerPosition}
            reachedEnds={reachedEnds}
            pathCells={pathCells}
          />
        </div>

        {/* 移动端方向控制 */}
        <div className="sm:hidden flex justify-center">
          <div className="grid grid-cols-3 gap-2 w-40">
            <div />
            <button
              onClick={() => movePlayer(DIRECTIONS[3])}
              className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-700"
            >
              ↑
            </button>
            <div />
            <button
              onClick={() => movePlayer(DIRECTIONS[2])}
              className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-700"
            >
              ←
            </button>
            <button
              onClick={() => movePlayer(DIRECTIONS[1])}
              className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-700"
            >
              ↓
            </button>
            <button
              onClick={() => movePlayer(DIRECTIONS[0])}
              className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-700"
            >
              →
            </button>
          </div>
        </div>

        {/* 胜利提示 */}
        {isWon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800"
          >
            <Trophy className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
              🎉 恭喜通关！
            </h2>
            <p className="text-green-600 dark:text-green-400">
              你用了 <strong>{steps}</strong> 步到达了所有终点！
            </p>
            <Button
              variant="primary"
              className="mt-4"
              icon={Shuffle}
              onClick={handleNewMaze}
            >
              再来一局
            </Button>
          </motion.div>
        )}

        {/* 操作说明 */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>⌨️ 键盘: 方向键 或 WASD 控制移动</p>
          <p>📱 手机: 点击下方方向按钮控制移动</p>
          <p>🟨 黄色区域为你走过的路径，回退不计入步数</p>
          {ends.length > 1 && <p>🎯 目标: 到达所有终点即可通关</p>}
        </div>
      </motion.div>
    </div>
  )
}
