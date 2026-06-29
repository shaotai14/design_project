import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Save, RotateCcw, Download, Upload, Pen, CircleDot, Flag, X } from 'lucide-react'
import MazeGrid from './MazeGrid'
import Button from '../common/Button'
import { deepClone2D } from '../../utils/helpers'
import { CELL_TYPES } from '../../utils/constants'
import useMazeStore from '../../store/mazeStore'

export default function MazeEditor({ onSave, onCancel, className = '' }) {
  const {
    maze, start, ends, rows, cols,
    setCell, clearMaze, addEnd, removeEnd, setStart,
  } = useMazeStore()
  const [editMode, setEditMode] = useState('wall') // 'wall' | 'start' | 'end'
  const isDrawingRef = useRef(false)
  const drawValueRef = useRef(CELL_TYPES.WALL)

  // 点击处理：仅处理 start 和 end 模式
  const handleCellClick = useCallback((row, col) => {
    // 拖拽中的 click 事件忽略
    if (isDrawingRef.current) return

    if (editMode === 'start') {
      setStart(row, col)
    } else if (editMode === 'end') {
      const existingIndex = ends.findIndex(e => e.row === row && e.col === col)
      if (existingIndex >= 0) {
        // 点击已有终点：如果是唯一终点则替换位置，否则移除
        if (ends.length <= 1) {
          // 唯一终点 → 不允许移除，只提示
          return
        }
        removeEnd(existingIndex)
      } else {
        // 点击空白：添加新终点
        addEnd(row, col)
      }
    }
  }, [editMode, ends, setStart, addEnd, removeEnd])

  // 按下处理：仅处理 wall 模式的拖拽开始
  const handleCellMouseDown = useCallback((row, col) => {
    if (editMode === 'wall') {
      isDrawingRef.current = true
      const currentValue = maze[row][col]
      drawValueRef.current = currentValue === CELL_TYPES.WALL ? CELL_TYPES.PATH : CELL_TYPES.WALL
      setCell(row, col, drawValueRef.current)
    }
    // start 和 end 模式不在 mouseDown 处理，由 click 处理
  }, [editMode, maze, setCell])

  // 拖拽进入：仅 wall 模式
  const handleCellMouseEnter = useCallback((row, col) => {
    if (isDrawingRef.current && editMode === 'wall') {
      setCell(row, col, drawValueRef.current)
    }
  }, [editMode, setCell])

  const handleCellMouseUp = useCallback(() => {
    isDrawingRef.current = false
  }, [])

  const handleExport = useCallback(() => {
    const data = { maze, start, ends, rows, cols }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'maze.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [maze, start, ends, rows, cols])

  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result)
          useMazeStore.setState({
            maze: data.maze,
            start: data.start,
            ends: data.ends || [data.end],
            rows: data.rows,
            cols: data.cols,
          })
        } catch (err) {
          console.error('导入失败:', err)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }, [])

  const editModes = [
    { id: 'wall', label: '绘制墙壁', icon: Pen },
    { id: 'start', label: '设置起点', icon: CircleDot },
    { id: 'end', label: '管理终点', icon: Flag },
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 编辑工具栏 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {editModes.map((mode) => {
            const Icon = mode.icon
            return (
              <button
                key={mode.id}
                onClick={() => setEditMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  editMode === mode.id
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm font-medium'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {mode.label}
              </button>
            )
          })}
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

        <Button variant="ghost" size="sm" icon={RotateCcw} onClick={clearMaze}>
          清空
        </Button>
        <Button variant="ghost" size="sm" icon={Download} onClick={handleExport}>
          导出
        </Button>
        <Button variant="ghost" size="sm" icon={Upload} onClick={handleImport}>
          导入
        </Button>

        {onSave && (
          <div className="ml-auto flex gap-2">
            {onCancel && (
              <Button variant="secondary" size="sm" onClick={onCancel}>
                取消
              </Button>
            )}
            <Button variant="primary" size="sm" icon={Save} onClick={() => onSave(maze)}>
              保存
            </Button>
          </div>
        )}
      </div>

      {/* 编辑提示 */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {editMode === 'wall' && '点击切换墙壁/通路，拖拽连续绘制'}
        {editMode === 'start' && '点击设置起点位置'}
        {editMode === 'end' && '点击空白添加终点，点击已有终点移除（至少保留1个）'}
      </div>

      {/* 终点列表 */}
      {editMode === 'end' && (
        <div className="flex flex-wrap gap-2">
          {ends.map((end, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
            >
              <span className="text-sm text-red-700 dark:text-red-300">
                E{index + 1}: ({end.row}, {end.col})
              </span>
              {ends.length > 1 && (
                <button
                  onClick={() => removeEnd(index)}
                  className="p-0.5 hover:bg-red-200 dark:hover:bg-red-800 rounded"
                >
                  <X className="w-3 h-3 text-red-500" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 迷宫网格 */}
      <div
        onMouseLeave={handleCellMouseUp}
        onMouseUp={handleCellMouseUp}
        className="inline-block select-none"
      >
        <MazeGrid
          maze={maze}
          start={start}
          ends={ends}
          onCellClick={handleCellClick}
          onCellMouseDown={handleCellMouseDown}
          onCellMouseEnter={handleCellMouseEnter}
          onCellMouseUp={handleCellMouseUp}
        />
      </div>
    </div>
  )
}
