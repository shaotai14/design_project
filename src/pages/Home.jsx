import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Play, Zap, PenTool, Info, ArrowRight, Waypoints, Sparkles, ChevronDown, GitBranch, Route, Target } from 'lucide-react'
import Card from '../components/common/Card'
import { ROUTES } from '../utils/constants'

// ====== 动态迷宫背景组件 ======
function MazeBackground() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const cellSize = 20

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = 500
    }
    resize()
    window.addEventListener('resize', resize)

    // 生成小型迷宫
    const cols = Math.floor(canvas.width / cellSize)
    const rows = Math.floor(canvas.height / cellSize)
    const grid = Array.from({ length: rows }, () => Array(cols).fill(1))

    // Prim 生成迷宫
    const inBounds = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols
    const startR = 1, startC = 1
    grid[startR][startC] = 0
    const walls = []
    const addWalls = (r, c) => {
      for (const [dr, dc] of [[-2,0],[2,0],[0,-2],[0,2]]) {
        const wr = r + dr/2, wc = c + dc/2
        const nr = r + dr, nc = c + dc
        if (inBounds(nr,nc) && grid[nr][nc] === 1 && !walls.some(w => w[0]===wr && w[1]===wc))
          walls.push([wr, wc])
      }
    }
    addWalls(startR, startC)
    while (walls.length > 0) {
      const idx = Math.floor(Math.random() * walls.length)
      const [wr, wc] = walls.splice(idx, 1)[0]
      let count = 0
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nr = wr+dr, nc = wc+dc
        if (inBounds(nr,nc) && grid[nr][nc] === 0) count++
      }
      if (count === 1) {
        grid[wr][wc] = 0
        addWalls(wr, wc)
      }
    }

    // DFS 路径动画
    const path = []
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false))
    const targetR = rows - 2, targetC = cols - 2
    let found = false

    const dfs = (r, c) => {
      if (found || !inBounds(r,c) || grid[r][c] === 1 || visited[r][c]) return
      visited[r][c] = true
      path.push([r, c])
      if (r === targetR && c === targetC) { found = true; return }
      for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) dfs(r+dr, c+dc)
      if (!found) path.pop()
    }
    dfs(startR, startC)

    // 探索动画（比路径更长）
    const explored = []
    const vis2 = Array.from({ length: rows }, () => Array(cols).fill(false))
    const dfsExplore = (r, c) => {
      if (!inBounds(r,c) || grid[r][c] === 1 || vis2[r][c]) return
      vis2[r][c] = true
      explored.push([r, c])
      for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) dfsExplore(r+dr, c+dc)
    }
    dfsExplore(startR, startC)

    let frame = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 绘制迷宫墙壁
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c] === 1) {
            ctx.fillStyle = 'rgba(148, 163, 184, 0.15)'
            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize)
          }
        }
      }

      // 绘制已探索区域
      const exploreCount = Math.min(Math.floor(frame / 2), explored.length)
      for (let i = 0; i < exploreCount; i++) {
        const [r, c] = explored[i]
        ctx.fillStyle = 'rgba(59, 130, 246, 0.08)'
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize)
      }

      // 绘制路径
      const pathCount = Math.min(Math.floor(frame / 4), path.length)
      for (let i = 0; i < pathCount; i++) {
        const [r, c] = path[i]
        const progress = i / path.length
        const alpha = 0.3 + progress * 0.5
        ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`
        ctx.beginPath()
        ctx.arc(c * cellSize + cellSize/2, r * cellSize + cellSize/2, cellSize/3, 0, Math.PI*2)
        ctx.fill()
      }

      // 路径连线
      if (pathCount > 1) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(path[0][1] * cellSize + cellSize/2, path[0][0] * cellSize + cellSize/2)
        for (let i = 1; i < pathCount; i++) {
          ctx.lineTo(path[i][1] * cellSize + cellSize/2, path[i][0] * cellSize + cellSize/2)
        }
        ctx.stroke()
      }

      // 当前探索点（光标）
      if (pathCount > 0 && pathCount < path.length) {
        const [r, c] = path[pathCount - 1]
        ctx.fillStyle = 'rgba(59, 130, 246, 0.8)'
        ctx.beginPath()
        ctx.arc(c * cellSize + cellSize/2, r * cellSize + cellSize/2, cellSize/2.5, 0, Math.PI*2)
        ctx.fill()
        // 光晕
        const glow = ctx.createRadialGradient(
          c * cellSize + cellSize/2, r * cellSize + cellSize/2, 0,
          c * cellSize + cellSize/2, r * cellSize + cellSize/2, cellSize
        )
        glow.addColorStop(0, 'rgba(59, 130, 246, 0.3)')
        glow.addColorStop(1, 'rgba(59, 130, 246, 0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(c * cellSize + cellSize/2, r * cellSize + cellSize/2, cellSize, 0, Math.PI*2)
        ctx.fill()
      }

      frame++
      if (frame < explored.length * 2 + 100) {
        animRef.current = requestAnimationFrame(draw)
      }
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-60 dark:opacity-40 pointer-events-none"
    />
  )
}

// ====== 浮动粒子组件 ======
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary-400/30 rounded-full"
          initial={{
            x: Math.random() * 1200,
            y: Math.random() * 500,
            scale: Math.random() * 1.5 + 0.5,
          }}
          animate={{
            y: [null, Math.random() * -200 - 100],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

// ====== 统计数字组件 ======
function CountUp({ target, suffix = '', duration = 2 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = Date.now()
          const animate = () => {
            const elapsed = (Date.now() - start) / 1000
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          animate()
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

// ====== 鼠标跟随光晕 ======
function MouseGlow() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const glowX = useSpring(mouseX, { stiffness: 100, damping: 20 })
  const glowY = useSpring(mouseY, { stiffness: 100, damping: 20 })

  const handleMouseMove = useCallback((e) => {
    mouseX.set(e.clientX)
    mouseY.set(e.clientY)
  }, [mouseX, mouseY])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  return (
    <motion.div
      className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-0 hidden lg:block"
      style={{
        x: useTransform(glowX, (v) => v - 250),
        y: useTransform(glowY, (v) => v - 250),
        background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
      }}
    />
  )
}

// ====== 主页 ======
const features = [
  {
    icon: Play,
    title: '闯关模式',
    description: '手动控制角色走出迷宫，支持多终点挑战，记录步数。',
    path: ROUTES.PLAY,
    gradient: 'from-blue-500 via-blue-600 to-cyan-500',
    shadow: 'shadow-blue-500/25',
  },
  {
    icon: Zap,
    title: '算法演示',
    description: 'DFS 与 BFS 双算法对比，可视化回溯与最短路径。',
    path: ROUTES.SOLVE,
    gradient: 'from-purple-500 via-purple-600 to-pink-500',
    shadow: 'shadow-purple-500/25',
  },
  {
    icon: PenTool,
    title: '迷宫编辑',
    description: '自由绘制迷宫墙壁，自定义起点与多个终点。',
    path: ROUTES.EDITOR,
    gradient: 'from-orange-500 via-orange-600 to-red-500',
    shadow: 'shadow-orange-500/25',
  },
  {
    icon: Route,
    title: '关于项目',
    description: '了解链表栈、深度优先搜索等核心算法原理。',
    path: ROUTES.ABOUT,
    gradient: 'from-emerald-500 via-emerald-600 to-teal-500',
    shadow: 'shadow-emerald-500/25',
  },
]

const stats = [
  { label: '求解算法', value: 2, suffix: '种' },
  { label: '支持终点', value: 3, suffix: '个' },
  { label: '迷宫尺寸', value: 31, suffix: '×31' },
  { label: '动画帧率', value: 60, suffix: 'fps' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 20 } },
}

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[calc(100vh-4rem)] overflow-hidden">
      <MouseGlow />

      {/* ====== Hero Section ====== */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* 背景层 */}
        <MazeBackground />
        <FloatingParticles />

        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/50 to-white dark:from-gray-900/80 dark:via-gray-900/50 dark:to-gray-900 pointer-events-none" />

        {/* 网格背景 */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="text-center">
            {/* Logo 动画 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, duration: 1 }}
              className="flex justify-center mb-10"
            >
              <div className="relative group">
                {/* 光环 */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 rounded-3xl blur-2xl"
                />
                {/* 图标容器 */}
                <div className="relative w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-500/40 group-hover:shadow-primary-500/60 transition-shadow duration-500">
                  <Waypoints className="w-12 h-12 text-white" />
                </div>
                {/* 旋转装饰 */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                  className="absolute -top-3 -right-3"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </motion.div>
                {/* 轨道点 */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-[-12px]"
                >
                  <div className="absolute top-0 left-1/2 w-2 h-2 bg-primary-400 rounded-full -translate-x-1/2" />
                </motion.div>
              </div>
            </motion.div>

            {/* 标题 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full border border-primary-200 dark:border-primary-800">
                🎓 数据结构与算法 · 课程设计
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="text-gray-900 dark:text-white">迷宫求解</span>
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-cyan-500 bg-clip-text text-transparent">
                算法可视化
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              基于<strong className="text-gray-700 dark:text-gray-200">链表栈</strong>的深度优先搜索，
              结合<strong className="text-gray-700 dark:text-gray-200">广度优先</strong>算法，
              <br className="hidden sm:block" />
              直观呈现迷宫求解的每一步探索与回溯。
            </motion.p>

            {/* CTA 按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to={ROUTES.SOLVE}
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-2xl shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 transition-all duration-300 hover:-translate-y-0.5"
              >
                <Zap className="w-5 h-5" />
                开始探索
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                {/* 按钮光效 */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -skew-x-12" />
              </Link>
              <Link
                to={ROUTES.PLAY}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-200 font-semibold rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                <Play className="w-5 h-5" />
                闯关模式
              </Link>
            </motion.div>

            {/* 滚动提示 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-16"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500"
              >
                <span className="text-xs">向下探索</span>
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====== 统计数据 ====== */}
      <section className="relative z-10 -mt-10">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-5 border border-gray-200/50 dark:border-gray-700/50 shadow-lg text-center"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== 功能特色 ====== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full mb-4">
            FEATURES
          </span>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            核心功能
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">
            从算法学习到实战闯关，全方位理解迷宫求解
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div key={feature.title} variants={itemVariants}>
                <div
                  onClick={() => navigate(feature.path)}
                  className={`group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 cursor-pointer hover:shadow-2xl ${feature.shadow} transition-all duration-500 hover:-translate-y-1 overflow-hidden`}
                >
                  {/* 背景渐变 */}
                  <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-bl-full transition-opacity duration-500`} />

                  <div className="relative flex items-start gap-5">
                    <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg ${feature.shadow} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="mt-4 flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-medium text-sm opacity-0 group-hover:opacity-100 translate-x-[-8px] group-hover:translate-x-0 transition-all duration-300">
                        立即体验
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* ====== 算法对比 ====== */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-3 py-1 text-xs font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full mb-4">
              ALGORITHMS
            </span>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              双算法对比
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">
              同一迷宫，不同策略，直观感受算法差异
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* DFS */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 overflow-hidden group hover:shadow-xl transition-shadow duration-300"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">DFS 深度优先</h3>
                  <span className="text-xs text-gray-400">Depth-First Search</span>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                  基于<span className="font-medium text-gray-900 dark:text-white">链表栈</span>实现
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                  沿一条路径<span className="font-medium text-gray-900 dark:text-white">深入探索</span>直到死胡同
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                  遇阻时<span className="font-medium text-gray-900 dark:text-white">回溯</span>到上一个分叉点
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                  找到的路径<span className="font-medium text-gray-900 dark:text-white">不一定最短</span>
                </li>
              </ul>
            </motion.div>

            {/* BFS */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 overflow-hidden group hover:shadow-xl transition-shadow duration-300"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">BFS 广度优先</h3>
                  <span className="text-xs text-gray-400">Breadth-First Search</span>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  基于<span className="font-medium text-gray-900 dark:text-white">队列</span>实现
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  <span className="font-medium text-gray-900 dark:text-white">逐层扩展</span>，先探索所有近邻
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  保证找到的路径是<span className="font-medium text-gray-900 dark:text-white">最短路径</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  适合求解<span className="font-medium text-gray-900 dark:text-white">无权图最短路径</span>问题
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====== 技术栈 ====== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full mb-4">
            TECH STACK
          </span>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            技术栈
          </h2>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {[
            { name: 'React 18', color: 'from-blue-400 to-blue-600' },
            { name: 'Vite 5', color: 'from-purple-400 to-purple-600' },
            { name: 'Tailwind CSS', color: 'from-cyan-400 to-cyan-600' },
            { name: 'Framer Motion', color: 'from-pink-400 to-pink-600' },
            { name: 'Zustand', color: 'from-orange-400 to-orange-600' },
            { name: 'React Router', color: 'from-red-400 to-red-600' },
          ].map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, type: 'spring' }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="group relative px-5 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-lg transition-shadow cursor-default"
            >
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${tech.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              <span className="relative font-medium text-gray-700 dark:text-gray-300 text-sm">
                {tech.name}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ====== 底部 CTA ====== */}
      <section className="relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-r from-primary-600 to-primary-500 rounded-3xl p-12 text-center overflow-hidden"
          >
            {/* 装饰 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                准备好探索迷宫了吗？
              </h2>
              <p className="text-primary-100 mb-8 text-lg max-w-lg mx-auto">
                从算法可视化到实战闯关，开启你的迷宫之旅
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={ROUTES.SOLVE}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
                >
                  <Zap className="w-5 h-5" />
                  算法演示
                </Link>
                <Link
                  to={ROUTES.PLAY}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-2xl border border-white/30 hover:bg-white/30 transition-all"
                >
                  <Play className="w-5 h-5" />
                  开始闯关
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
