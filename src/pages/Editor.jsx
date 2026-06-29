import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Download, Upload } from 'lucide-react'
import MazeEditor from '../components/maze/MazeEditor'
import { MazeSizeControl } from '../components/maze/MazeControls'
import Button from '../components/common/Button'
import useMazeStore from '../store/mazeStore'

export default function Editor() {
  const { maze, rows, cols, initMaze, setSize } = useMazeStore()

  // 初始化迷宫
  useEffect(() => {
    if (maze.length === 0) {
      initMaze(11, 11)
    }
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            迷宫编辑器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            自定义绘制迷宫，设置起点和终点
          </p>
        </div>

        {/* 尺寸控制 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <MazeSizeControl
            rows={rows}
            cols={cols}
            onSizeChange={(r, c) => {
              setSize(r, c)
              initMaze(r, c)
            }}
          />
        </div>

        {/* 编辑器 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <MazeEditor />
        </div>

        {/* 提示信息 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
            💡 使用提示
          </h3>
          <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
            <li>• 选择"绘制墙壁"模式，点击或拖拽来切换墙壁和通路</li>
            <li>• 选择"设置起点"模式，点击设置起点位置</li>
            <li>• 选择"管理终点"模式，点击添加终点，点击已有终点可移除</li>
            <li>• 支持设置多个终点，闯关模式需到达所有终点才算通关</li>
            <li>• 使用"导出"功能保存迷宫为 JSON 文件</li>
            <li>• 使用"导入"功能加载之前保存的迷宫</li>
            <li>• 编辑完成后可前往"算法演示"查看求解过程</li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}
