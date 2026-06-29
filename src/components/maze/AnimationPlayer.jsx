import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, SkipForward, SkipBack, ChevronRight } from 'lucide-react'

export default function AnimationPlayer({
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  onPlay,
  onPause,
  onReset,
  onStepForward,
  onStepBackward,
  onSpeedChange,
  stepDescription,
  className = '',
}) {
  const progressBarRef = useRef(null)

  const progress = totalSteps > 0 ? (currentStep / (totalSteps - 1)) * 100 : 0

  const speedOptions = [
    { label: '0.5x', value: 800 },
    { label: '1x', value: 400 },
    { label: '2x', value: 200 },
    { label: '4x', value: 100 },
  ]

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      {/* 进度条 */}
      <div className="mb-4">
        <div
          ref={progressBarRef}
          className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden cursor-pointer"
          onClick={(e) => {
            const rect = progressBarRef.current.getBoundingClientRect()
            const percent = (e.clientX - rect.left) / rect.width
            const targetStep = Math.floor(percent * (totalSteps - 1))
            // 跳转到指定步骤
          }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span>步骤 {currentStep + 1}</span>
          <span>共 {totalSteps} 步</span>
        </div>
      </div>

      {/* 步骤描述 */}
      {stepDescription && (
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-600 dark:text-gray-300"
        >
          <ChevronRight className="w-4 h-4 inline mr-1 text-primary-500" />
          {stepDescription}
        </motion.div>
      )}

      {/* 控制按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            disabled={currentStep === 0}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="重置"
          >
            <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={onStepBackward}
            disabled={currentStep === 0}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="后退"
          >
            <SkipBack className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isPlaying ? onPause : onPlay}
            disabled={currentStep >= totalSteps - 1}
            className="p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </motion.button>
          <button
            onClick={onStepForward}
            disabled={currentStep >= totalSteps - 1}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="前进"
          >
            <SkipForward className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* 速度选择 */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
          {speedOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSpeedChange(option.value)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                speed === option.value
                  ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 font-medium shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
