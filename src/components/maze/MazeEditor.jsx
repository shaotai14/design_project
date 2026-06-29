import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Save, Trash2, RotateCcw, Download, Upload, Pen, CircleDot, Flag } from 'lucide-react'
import MazeGrid from './MazeGrid'
import Button from '../common/Button'
import { createEmptyMaze, deepClone2D } from '../../utils/helpers'
import { CELL_TYPES, MAZE_CONFIG } from '../../utils/constants'
import useMazeStore from '../../store/mazeStore'

export default function MazeEditor({ onSave, onCancel, className = '' }) {
  const { maze, start, end, rows, cols, setCell, toggleWall, clearMaze } = useMazeStore()
  const [isDrawing, setIsDrawing] = useState(false)
  const [editMode, setEditMode] = useState('wall') // 'wall' | 'start' | 'end'

  const handleCellClick = useCallback((row, col) => {
    if (editMode === 'wall') {
      toggleWall(row, col)
    } else if (editMode === 'start') {
      // 设置起点
      const newMaze = deepClone2D(maze)
      // 清除旧起点
      if (start) newMaze[start.row][start.col] = CELL_TYPES.PATH
      // 设置新起点
      newMaze[row][col] = CELL_TYPES.PATH
      useMazeStore.setState({ maze: newMaze, start: { row, col } })
    } else if (editMode === 'end') {
      // 设置终点
      const newMaze = deepClone2D(maze)
      // 清除旧终点
      if (end) newMaze[end.row][end.col] = CELL_TYPES.PATH
      // 设置新终点
      newMaze[row][col] = CELL_TYPES.PATH
      useMazeStore.setState({ maze: newMaze, end: { row, col } })
    }
  }, [editMode, maze, start, end, toggleWall])

  const handleCellMouseDown = useCallback((row, col) => {
    setIsDrawing(true)
    if (editMode === 'wall') {
      toggleWall(row, col)
    }
  }, [editMode, toggleWall])

  const handleCellMouseEnter = useCallback((row, col) => {
    if (isDrawing && editMode === 'wall') {
      setCell(row, col, CELL_TYPES.WALL)
    }
  }, [isDrawing, editMode, setCell])

  const handleCellMouseUp = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const handleExport = useCallback(() => {
    const data = {
      maze,
      start,
      end,
      rows,
      cols,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'maze.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [maze, start, end, rows, cols])

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
            end: data.end,
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
    { id: 'end', label: '设置终点', icon: Flag },
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
        {editMode === 'wall' && '点击或拖拽切换墙壁/通路'}
        {editMode === 'start' && '点击设置起点位置'}
        {editMode === 'end' && '点击设置终点位置'}
      </div>

      {/* 迷宫网格 */}
      <div
        onMouseLeave={handleCellMouseUp}
        className="inline-block"
      >
        <MazeGrid
          maze={maze}
          start={start}
          end={end}
          onCellClick={handleCellClick}
          onCellMouseDown={handleCellMouseDown}
          onCellMouseEnter={handleCellMouseEnter}
          onCellMouseUp={handleCellMouseUp}
        />
      </div>
    </div>
  )
}
