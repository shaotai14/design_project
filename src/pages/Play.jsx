import { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Footprints, Clock, RotateCcw, Shuffle } from 'lucide-react'
import MazeGrid from '../components/maze/MazeGrid'
import Button from '../components/common/Button'
import useMazeStore from '../store/mazeStore'
import { GAME_STATUS, DIRECTIONS } from '../utils/constants'

export default function Play() {
  const {
    maze, start, end, playerPosition, steps, gameStatus,
    initMaze, generateNewMaze, movePlayer, startGame, resetGame,
  } = useMazeStore()

  // 初始化迷宫
  useEffect(() => {
    if (maze.length === 0) {
      initMaze(11, 11)
    }
  }, [])

  // 键盘控制
  const handleKeyDown = useCallback((e) => {
    if (gameStatus !== GAME_STATUS.PLAYING && gameStatus !== GAME_STATUS.IDLE) return

    // 如果是 IDLE 状态，自动开始游戏
    if (gameStatus === GAME_STATUS.IDLE) {
      startGame()
    }

    const keyMap = {
      ArrowUp: DIRECTIONS[3],    // 北
      ArrowDown: DIRECTIONS[1],  // 南
      ArrowLeft: DIRECTIONS[2],  // 西
      ArrowRight: DIRECTIONS[0], // 东
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

        {/* 游戏状态栏 */}
        <div className="flex flex-wrap items-center justify-center gap-6">
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
        </div>

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
          <Button variant="secondary" icon={Shuffle} onClick={generateNewMaze}>
            新迷宫
          </Button>
        </div>

        {/* 迷宫 */}
        <div className="flex justify-center">
          <MazeGrid
            maze={maze}
            start={start}
            end={end}
            playerPosition={playerPosition}
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
              你用了 <strong>{steps}</strong> 步走出了迷宫！
            </p>
            <Button
              variant="primary"
              className="mt-4"
              icon={Shuffle}
              onClick={() => {
                generateNewMaze()
              }}
            >
              再来一局
            </Button>
          </motion.div>
        )}

        {/* 操作说明 */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>⌨️ 键盘: 方向键 或 WASD 控制移动</p>
          <p>📱 手机: 点击下方方向按钮控制移动</p>
        </div>
      </motion.div>
    </div>
  )
}
