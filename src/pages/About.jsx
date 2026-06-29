import { motion } from 'framer-motion'
import { Github, BookOpen, Code, Cpu, Layers, Zap } from 'lucide-react'

const sections = [
  {
    icon: BookOpen,
    title: '项目简介',
    content: '这是一个基于栈的迷宫求解算法可视化网站。通过直观的图形界面，用户可以理解深度优先搜索（DFS）算法如何利用栈数据结构来求解迷宫。项目支持自定义迷宫编辑、随机迷宫生成、手动闯关和算法动画演示等功能。',
  },
  {
    icon: Cpu,
    title: '算法原理',
    content: '本项目使用基于栈的深度优先搜索（DFS）算法求解迷宫。算法从起点开始，沿着一条路径尽可能深入，当遇到死胡同时，通过栈的弹出操作回溯到上一个分叉点，尝试其他方向。这种"试探-回溯"的策略正是栈数据结构的经典应用。',
  },
  {
    icon: Layers,
    title: '数据结构',
    content: '项目实现了一个链表栈（LinkedStack），每个节点包含数据和指向下一个节点的指针。相比数组栈，链表栈不需要预分配空间，可以动态增长，更适合不确定深度的迷宫探索场景。',
  },
  {
    icon: Code,
    title: '技术实现',
    content: '前端使用 React 18 构建用户界面，Vite 作为构建工具提供快速的开发体验。Tailwind CSS 实现响应式设计，Framer Motion 提供流畅的动画效果。Zustand 进行状态管理，React Router 处理页面路由。',
  },
  {
    icon: Zap,
    title: '迷宫生成',
    content: '迷宫生成采用 Prim 算法，从一个起点开始，逐步打通墙壁，确保生成的迷宫有且仅有一条路径连接任意两点。算法维护一个墙列表，随机选择墙壁进行打通，保证迷宫的随机性和复杂性。',
  },
]

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            关于项目
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            迷宫求解算法可视化 —— 数据结构与算法课程设计项目
          </p>
        </div>

        {/* 内容板块 */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {section.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* 算法流程图 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            算法流程
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">求解流程</h3>
              <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>将起点压入栈中</li>
                <li>查看栈顶元素（当前位置）</li>
                <li>如果当前位置是终点，算法结束</li>
                <li>尝试向东、南、西、北四个方向移动</li>
                <li>如果找到可通行的邻居，将其压入栈中</li>
                <li>如果所有方向都不可行，从栈中弹出（回溯）</li>
                <li>重复步骤 2-6 直到找到终点或栈为空</li>
              </ol>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">复杂度分析</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p><strong>时间复杂度：</strong>O(V)，其中 V 是迷宫中可通行单元格的数量。每个单元格最多被访问一次。</p>
                <p><strong>空间复杂度：</strong>O(V)，栈的最大深度等于迷宫中最长路径的长度。</p>
                <p><strong>特点：</strong>深度优先搜索会找到一条路径，但不一定是最短路径。找到的路径取决于探索方向的顺序。</p>
              </div>
            </div>
          </div>
        </div>

        {/* 技术栈 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            技术栈
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'React 18', desc: '用户界面框架' },
              { name: 'Vite 5', desc: '构建工具' },
              { name: 'Tailwind CSS', desc: '样式框架' },
              { name: 'Framer Motion', desc: '动画库' },
              { name: 'Zustand', desc: '状态管理' },
              { name: 'React Router', desc: '路由管理' },
            ].map((tech) => (
              <div key={tech.name} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white">{tech.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* GitHub 链接 */}
        <div className="text-center">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            <Github className="w-5 h-5" />
            查看源代码
          </a>
        </div>
      </motion.div>
    </div>
  )
}
