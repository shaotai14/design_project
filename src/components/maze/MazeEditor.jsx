import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Save, Trash2, RotateCcw, Download, Upload, Pen, CircleDot, Flag } from 'lucide-react'
import MazeGrid from './MazeGrid'
import Button from '../common/Button'
import { createEmptyMaze, deepClone2D } from '../../utils/helpers'
import { CELL_TYPES, MAZE_CONFIG } from '../../utils/constants'
import useMazeStore from '../../store/mazeStore'

export default function MazeEditor({ onSave, onCancel, className = '' }) {
  const { maze, start, end, rows, cols, setCell, toggleWall, clearMaze } = useMazeStore()
  const [editMode, setEditMode] = useState('wall') // 'wall' | 'start' | 'end'
  const isDrawingRef = useRef(false)
  const drawValueRef = useRef(CELL_TYPES.WALL) // 拖拽时绘制的值

  // 点击处理（仅在鼠标抬起且没有拖拽时触发）
  const handleCellClick = useCallback((row, col) => {
    // 拖拽结束后的 click 事件不处理
    if (isDrawingRef.current) return

    if (editMode === 'start') {
      const newMaze = deepClone2D(maze)
      if (start) newMaze[start.row][start.col] = CELL_TYPES.PATH
      newMaze[row][col] = CELL_TYPES.PATH
      useMazeStore.setState({ maze: newMaze, start: { row, col } })
    } else if (editMode === 'end') {
      const newMaze = deepClone2D(maze)
      if (end) newMaze[end.row][end.col] = CELL_TYPES.PATH
      newMaze[row][col] = CELL_TYPES.PATH
      useMazeStore.setState({ maze: newMaze, end: { row, col } })
    }
  }, [editMode, maze, start, end])

  const handleCellMouseDown = useCallback((row, col) => {
    if (editMode === 'wall') {
      isDrawingRef.current = true
      // 记录要绘制的值：如果当前是墙则画通路，如果当前是通路则画墙
      const currentValue = maze[row][col]
      drawValueRef.current = currentValue === CELL_TYPES.WALL ? CELL_TYPES.PATH : CELL_TYPES.WALL
      setCell(row, col, drawValueRef.current)
    } else if (editMode === 'start') {
      const newMaze = deepClone2D(maze)
      if (start) newMaze[start.row][start.col] = CELL_TYPES.PATH
      newMaze[row][col] = CELL_TYPES.PATH
      useMazeStore.setState({ maze: newMaze, start: { row, col } })
    } else if (editMode === 'end') {
      const newMaze = deepClone2D(maze)
      if (end) newMaze[end.row][end.col] = CELL_TYPES.PATH
      newMaze[row][col] = CELL_TYPES.PATH
      useMazeStore.setState({ maze: newMaze, end: { row, col } })
    }
  }, [editMode, maze, start, end, setCell])

  const handleCellMouseEnter = useCallback((row, col) => {
    if (isDrawingRef.current && editMode === 'wall') {
      setCell(row, col, drawValueRef.current)
    }
  }, [editMode, setCell])

  const handleCellMouseUp = useCallback(() => {
    isDrawingRef.current = false
  }, [])

  const handleExport = useCallback(() => {
    const data = { maze, start, end, rows, cols }
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
        {editMode === 'wall' && '点击切换墙壁/通路，拖拽连续绘制'}
        {editMode === 'start' && '点击设置起点位置'}
        {editMode === 'end' && '点击设置终点位置'}
      </div>

      {/* 迷宫网格 */}
      <div
        onMouseLeave={handleCellMouseUp}
        onMouseUp={handleCellMouseUp}
        className="inline-block select-none"
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
