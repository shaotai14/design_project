# 迷宫求解算法可视化网站

## 一、问题描述

以一个 `m×n` 的长方阵表示迷宫，`0` 和 `1` 分别表示迷宫中的通路和障碍。设计一个程序，对任意设定的迷宫，求出一条从入口到出口的通路，或得出没有通路的结论。

本项目将课程设计要求封装为可视化 Web 应用，部署在 Ubuntu 服务器上。

## 二、基本要求与实现

### 1. 链表栈

实现了以链表作存储结构的栈类型，编写了求解迷宫的非递归程序。

```javascript
// core/stack.js
class LinkedStack {
  push(item)    // 入栈
  pop()         // 出栈
  peek()        // 查看栈顶
  isEmpty()     // 判空
  getSize()     // 栈大小
  toArray()     // 转为数组（栈顶→栈底）
}
```

### 2. 非递归求解（DFS）

采用基于栈的深度优先搜索，从入口出发，顺着东→南→西→北四个方向探索：

- 若能走通，则将当前位置压入栈，继续前进
- 若四个方向都不可行，则从栈中弹出（回溯），换方向继续探索
- 直到到达出口，或栈为空（无通路）

#### 核心代码

```javascript
function solveMaze(maze, start, end) {
  const rows = maze.length
  const cols = maze[0].length
  const stack = new LinkedStack()                           // ① 创建链表栈
  const visited = Array.from({ length: rows }, () =>        // ② 二维数组记录访问状态
    Array(cols).fill(false)
  )
  const steps = []                                          // ③ 记录每一步（用于动画回放）

  visited[start.row][start.col] = true                      // ④ 标记起点已访问
  stack.push({ position: start, direction: 0 })             // ⑤ 起点压栈，direction=0 表示从东方向开始尝试
  steps.push({ type: 'visit', position: start })

  while (!stack.isEmpty()) {                                // ⑥ 栈不为空就继续探索
    const current = stack.peek()                            // ⑦ 查看栈顶（不弹出）
    const { row, col } = current.position

    if (row === end.row && col === end.col) {               // ⑧ 到达终点
      const path = stack.toArray().reverse()                // ⑨ 栈转数组并反转得到从起点到终点的路径
      steps.push({ type: 'found', path })
      return { path, steps }
    }

    let found = false
    for (let i = current.direction; i < 4; i++) {           // ⑩ 从上次探索到的方向继续尝试
      const { dr, dc } = DIRECTIONS[i]                      //    DIRECTIONS = [东(0,1), 南(1,0), 西(0,-1), 北(-1,0)]
      const newRow = row + dr
      const newCol = col + dc

      if (
        isInBounds(newRow, newCol, rows, cols) &&           // ⑪ 边界检查
        maze[newRow][newCol] === CELL_TYPES.PATH &&          // ⑫ 是通路（非墙壁）
        !visited[newRow][newCol]                             // ⑬ 未访问过
      ) {
        visited[newRow][newCol] = true                      // ⑭ 标记已访问
        current.direction = i + 1                           // ⑮ 记录下次从哪个方向继续（下次回溯到这里时跳过已试方向）
        stack.push({                                        // ⑯ 新位置压栈
          position: { row: newRow, col: newCol },
          direction: 0,                                     //    新位置从东方向重新开始
        })
        steps.push({ type: 'visit', position: { row: newRow, col: newCol } })
        found = true
        break                                               // ⑰ 找到一个方向就深入，跳出 for 循环
      }
    }

    if (!found) {                                           // ⑱ 四个方向都走不通
      stack.pop()                                           // ⑲ 弹出栈顶（回溯到上一个分叉点）
      steps.push({ type: 'backtrack', position: { row, col } })
    }
  }

  steps.push({ type: 'no-solution' })                       // ⑳ 栈空了，无解
  return { path: null, steps }
}
```

#### 逻辑详解

**数据结构设计：**

每个栈元素存储 `{ position, direction }` 两个字段：
- `position`：当前坐标 `{ row, col }`
- `direction`：下次从哪个方向继续尝试（0~3 对应东→南→西→北）

这个 `direction` 字段是关键——它实现了**方向记忆**。当从某个位置回溯回来时，不需要从头尝试四个方向，而是从上次中断的方向继续，避免重复探索。

**探索流程（以 3×3 小迷宫为例）：**

```
迷宫：         方向约定：
  0 1 2          北(-1,0)
0 S 0 0          ↑
1 1 0 1     西 ←   → 东(0,1)
2 0 0 E          ↓
                 南(1,0)
S=起点(0,0)  E=终点(2,2)
```

```
步骤1: 栈=[(0,0,dir=0)]，从(0,0)向东→(0,1)是通路，压栈
步骤2: 栈=[(0,0,dir=1), (0,1,dir=0)]，从(0,1)向东→(0,2)是通路，压栈
步骤3: 栈=[(0,0,dir=1), (0,1,dir=1), (0,2,dir=0)]，从(0,2)向东出界、向南→(1,2)是墙、向西→(0,1)已访问、向北出界
        → 四方向都不可行，回溯：弹出(0,2)
步骤4: 栈=[(0,0,dir=1), (0,1,dir=1)]，从(0,1)上次停在dir=1(南)，向南→(1,1)是通路，压栈
步骤5: 栈=[(0,0,dir=1), (0,1,dir=2), (1,1,dir=0)]，从(1,1)向东→(1,2)是墙、向南→(2,1)是通路，压栈
步骤6: 栈=[(0,0,dir=1), (0,1,dir=2), (1,1,dir=2), (2,1,dir=0)]，从(2,1)向东→(2,2)=终点，找到！
```

**回溯机制：**

`current.direction = i + 1` 这行代码是回溯的核心。假设在位置 A 尝试了方向 0（东）成功，将 A 的 direction 设为 1。当从东边的死胡同回溯到 A 时，for 循环从 `i = current.direction = 1` 开始，即从南方向继续，不会重复尝试已经走过的东方向。

**路径还原：**

`stack.toArray().reverse()` 将栈中元素从栈顶到栈底转为数组后反转，得到从起点到终点的正序路径。每个元素包含 position 和 direction，正好满足三元组 `(i, j, d)` 的输出要求。

### 3. 三元组输出

求得的通路以三元组 `(i, j, d)` 的形式输出：

- `(i, j)` 指示迷宫中的一个坐标
- `d` 表示走到下一坐标的方向：1=东、2=南、3=西、4=北

示例输出：

```
(1,1,东) → (1,2,南) → (3,2,西) → (3,1,南) → ...
```

### 4. 方阵输出迷宫及其通路

以方阵形式可视化迷宫，不同状态以不同颜色区分：

| 颜色 | 含义 |
|------|------|
| 深灰 | 墙壁（1） |
| 白色 | 通路（0） |
| 蓝色 | 已访问 |
| 绿色 | 求解路径 |
| 琥珀色 | 闯关走过的路径 |
| 红色 | 终点 |
| 绿色 | 起点 |

## 三、测试数据

迷宫测试数据（11×11），左上角 `(1,1)` 为入口，右下角 `(9,9)` 为出口：

```
1 1 1 1 1 1 1 1 1 1 1
1 0 0 0 1 0 0 0 0 0 1
1 0 1 0 1 0 1 1 1 0 1
1 0 1 0 0 0 0 0 1 0 1
1 0 1 1 1 1 1 0 1 0 1
1 0 0 0 0 0 1 0 0 0 1
1 1 1 1 1 0 1 1 1 0 1
1 0 0 0 0 0 0 0 1 0 1
1 0 1 1 1 1 1 0 1 0 1
1 0 0 0 0 0 0 0 0 0 1
1 1 1 1 1 1 1 1 1 1 1
```

## 四、选做内容

### （1）所有可能的通路

实现了 `findAllPaths` 函数，分别使用 DFS 和 BFS 两种算法求解，在算法演示页面可列出从起点到每个终点的所有通路并对比。

### （2）队列求解（BFS）

额外实现了基于队列的广度优先搜索算法（`solveMazeBFS`），可求得最短路径：

```javascript
// core/mazeSolver.js
function solveMazeBFS(maze, start, end) {
  // 基于队列的 BFS 实现
  // 保证返回最短路径
}
```

## 五、功能模块

| 模块 | 说明 |
|------|------|
| **算法演示** | 可视化 DFS / BFS 求解过程，支持逐步播放、速度调节、栈/队列状态展示，可列出所有通路 |
| **闯关模式** | 键盘/触屏控制角色走出迷宫，支持多终点（1~3个），回退不计步，走过的路径以琥珀色标记，自动验证迷宫有解 |
| **迷宫编辑** | 自由绘制墙壁、设置起点和多个终点，支持导入/导出 JSON |
| **迷宫生成** | 基于 Prim 算法自动生成迷宫，终点优先放置在边缘，闯关模式自动验证有解后出题 |
| **深色/浅色主题** | 支持主题切换，偏好保存至 localStorage |

## 六、技术栈

| 技术 | 用途 |
|------|------|
| React 18 | 前端框架 |
| Vite 5 | 构建工具 |
| Tailwind CSS | 样式框架 |
| Framer Motion | 动画效果 |
| Zustand | 状态管理 |
| React Router 6 | 路由管理 |
| Lucide React | 图标库 |
| Canvas API | 首页动态迷宫背景 |

## 七、项目结构

```
design_project/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── common/          # Button, Card, Modal, Tooltip
│   │   ├── maze/            # MazeGrid, MazeCell, MazeEditor, AnimationPlayer, PathDisplay
│   │   └── layout/          # Header, Footer, Sidebar
│   ├── core/
│   │   ├── stack.js         # 链表栈实现
│   │   ├── mazeSolver.js    # DFS / BFS 求解、全路径查找、迷宫验证
│   │   └── mazeGenerator.js # Prim 迷宫生成（支持多终点、边缘优先）
│   ├── hooks/
│   │   ├── useMaze.js
│   │   ├── useAnimation.js
│   │   ├── usePathFinding.js
│   │   └── useTheme.js
│   ├── pages/
│   │   ├── Home.jsx         # 首页（动态迷宫背景、粒子效果）
│   │   ├── Play.jsx         # 闯关模式
│   │   ├── Solve.jsx        # 算法演示
│   │   ├── Editor.jsx       # 迷宫编辑
│   │   └── About.jsx        # 关于
│   ├── store/
│   │   └── mazeStore.js     # Zustand 全局状态
│   ├── utils/
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 八、快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 九、部署

本项目部署在 Ubuntu 服务器上，使用 `npm run build` 构建生产版本后通过 Nginx 托管静态资源。

```bash
npm run build
# 将 dist/ 目录部署到 Nginx
```

## 十、运行截图

| 首页 | 算法演示 |
|------|----------|
| 动态迷宫背景 + 粒子效果 + 数字滚动 | DFS / BFS 双算法对比，逐步动画 + 栈/队列状态 |

| 闯关模式 | 迷宫编辑 |
|----------|----------|
| 键盘控制 + 多终点 + 路径染色 + 回退不计步 | 自由绘制 + 多终点管理 + 导入导出 |

## 许可证

MIT License

## 作者

安徽理工大学——纪敏宇
