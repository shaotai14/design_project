import { motion } from 'framer-motion'
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Zap,
  Shuffle,
  Map,
  Eye,
} from 'lucide-react'
import Button from '../common/Button'
import Tooltip from '../common/Tooltip'
import { ANIMATION_SPEEDS } from '../../utils/constants'

export function AnimationControls({
  isPlaying,
  isFirstStep,
  isLastStep,
  speed,
  currentStep,
  totalSteps,
  onPlay,
  onPause,
  onReset,
  onStepForward,
  onStepBackward,
  onSpeedChange,
  onGenerate,
  onSolve,
  className = '',
}) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* 生成和求解按钮 */}
      <div className="flex items-center gap-2">
        <Tooltip content="生成新迷宫">
          <Button variant="secondary" size="sm" icon={Shuffle} onClick={onGenerate}>
            生成
          </Button>
        </Tooltip>
        <Tooltip content="开始求解">
          <Button variant="primary" size="sm" icon={Zap} onClick={onSolve}>
            求解
          </Button>
        </Tooltip>
      </div>

      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

      {/* 播放控制 */}
      <div className="flex items-center gap-1">
        <Tooltip content="重置">
          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={onReset}
            disabled={currentStep === 0}
          />
        </Tooltip>
        <Tooltip content="后退一步">
          <Button
            variant="ghost"
            size="sm"
            icon={SkipBack}
            onClick={onStepBackward}
            disabled={isFirstStep}
          />
        </Tooltip>
        <Tooltip content={isPlaying ? '暂停' : '播放'}>
          <Button
            variant="primary"
            size="sm"
            icon={isPlaying ? Pause : Play}
            onClick={isPlaying ? onPause : onPlay}
            disabled={isLastStep}
          />
        </Tooltip>
        <Tooltip content="前进一步">
          <Button
            variant="ghost"
            size="sm"
            icon={SkipForward}
            onClick={onStepForward}
            disabled={isLastStep}
          />
        </Tooltip>
      </div>

      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

      {/* 速度控制 */}
      <div className="flex items-center gap-1">
        {Object.entries(ANIMATION_SPEEDS).map(([key, config]) => (
          <Tooltip key={key} content={`速度 ${config.label}`}>
            <button
              onClick={() => onSpeedChange(config.value)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                speed === config.value
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {config.label}
            </button>
          </Tooltip>
        ))}
      </div>

      {/* 步骤指示器 */}
      {totalSteps > 0 && (
        <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          步骤: {currentStep + 1} / {totalSteps}
        </div>
      )}
    </div>
  )
}

export function MazeSizeControl({ rows, cols, onSizeChange, className = '' }) {
  const presets = [
    { label: '小 (9×9)', rows: 9, cols: 9 },
    { label: '中 (15×15)', rows: 15, cols: 15 },
    { label: '大 (21×21)', rows: 21, cols: 21 },
    { label: '超大 (31×31)', rows: 31, cols: 31 },
  ]

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        迷宫尺寸
      </div>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onSizeChange(preset.rows, preset.cols)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              rows === preset.rows && cols === preset.cols
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function EditModeControls({ editMode, onEditModeChange, className = '' }) {
  const modes = [
    { id: 'wall', label: '墙壁', icon: Map },
    { id: 'start', label: '起点', icon: Play },
    { id: 'end', label: '终点', icon: Eye },
  ]

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        编辑模式
      </div>
      <div className="flex gap-2">
        {modes.map((mode) => {
          const Icon = mode.icon
          return (
            <button
              key={mode.id}
              onClick={() => onEditModeChange(mode.id)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                editMode === mode.id
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {mode.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
