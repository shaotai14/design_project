# 迷宫求解算法可视化网站

## 项目概述

基于栈的迷宫求解算法可视化网站，使用 React + Vite 构建，支持用户自定义迷宫、自动生成迷宫、手动闯关和算法演示。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | 前端框架 |
| Vite | 5.x | 构建工具 |
| JavaScript | ES2022+ | 编程语言 |
| Tailwind CSS | 3.x | 样式框架 |
| Framer Motion | 11.x | 动画效果 |
| Zustand | 4.x | 状态管理 |
| React Router | 6.x | 路由管理 |
| Lucide React | latest | 图标库 |
| shadcn/ui | latest | UI 组件库 |

## 项目结构

```
maze-solver/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/                    # 静态资源
│   ├── components/
│   │   ├── common/                # 通用组件
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Tooltip.jsx
│   │   ├── maze/                  # 迷宫相关组件
│   │   │   ├── MazeGrid.jsx       # 迷宫网格
│   │   │   ├── MazeCell.jsx       # 单元格
│   │   │   ├── MazeControls.jsx   # 控制面板
│   │   │   ├── MazeEditor.jsx     # 迷宫编辑器
│   │   │   ├── PathDisplay.jsx    # 路径展示
│   │   │   └── AnimationPlayer.jsx# 动画播放器
│   │   └── layout/                # 布局组件
│   │       ├── Header.jsx
│   │       ├── Footer.jsx
│   │       └── Sidebar.jsx
│   ├── core/                      # 核心算法
│   │   ├── stack.js               # 链表栈实现
│   │   ├── mazeSolver.js          # 迷宫求解算法
│   │   └── mazeGenerator.js       # 迷宫生成算法
│   ├── hooks/                     # 自定义 Hooks
│   │   ├── useMaze.js
│   │   ├── useAnimation.js
│   │   └── usePathFinding.js
│   ├── pages/                     # 页面组件
│   │   ├── Home.jsx               # 首页
│   │   ├── Play.jsx               # 闯关模式
│   │   ├── Solve.jsx              # 算法演示
│   │   ├── Editor.jsx             # 迷宫编辑
│   │   └── About.jsx              # 关于页面
│   ├── store/                     # 状态管理
│   │   └── mazeStore.js
│   ├── styles/                    # 样式文件
│   │   └── global.css
│   ├── utils/                     # 工具函数
│   │   ├── helpers.js
│   │   └── constants.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 核心算法设计

### 1. 链表栈实现

```javascript
// core/stack.js

class LinkedStack {
  constructor() {
    this.top = null;
    this.size = 0;
  }

  push(item) {
    const node = { data: item, next: this.top };
    this.top = node;
    this.size++;
  }

  pop() {
    if (this.isEmpty()) return null;
    const data = this.top.data;
    this.top = this.top.next;
    this.size--;
    return data;
  }

  peek() {
    return this.isEmpty() ? null : this.top.data;
  }

  isEmpty() {
    return this.top === null;
  }

  getSize() {
    return this.size;
  }

  toArray() {
    const result = [];
    let current = this.top;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }
}
```

### 2. 迷宫求解算法

```javascript
// core/mazeSolver.js

// 方向定义: 东(0,1) 南(1,0) 西(0,-1) 北(-1,0)
const DIRECTIONS = [
  { dr: 0, dc: 1, name: '东', code: 1 },
  { dr: 1, dc: 0, name: '南', code: 2 },
  { dr: 0, dc: -1, name: '西', code: 3 },
  { dr: -1, dc: 0, name: '北', code: 4 },
];

function solveMaze(maze, start, end) {
  const rows = maze.length;
  const cols = maze[0].length;
  const stack = new LinkedStack();
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));

  // 标记起点为已访问
  visited[start.row][start.col] = true;
  stack.push({ position: start, direction: 0 });

  while (!stack.isEmpty()) {
    const current = stack.peek();
    const { row, col } = current.position;

    // 到达终点
    if (row === end.row && col === end.col) {
      return stack.toArray().reverse();
    }

    // 尝试四个方向
    let found = false;
    for (let i = current.direction; i < 4; i++) {
      const { dr, dc } = DIRECTIONS[i];
      const newRow = row + dr;
      const newCol = col + dc;

      if (
        newRow >= 0 && newRow < rows &&
        newCol >= 0 && newCol < cols &&
        maze[newRow][newCol] === 0 &&
        !visited[newRow][newCol]
      ) {
        visited[newRow][newCol] = true;
        current.direction = i + 1; // 更新当前节点的探索方向
        stack.push({
          position: { row: newRow, col: newCol },
          direction: 0,
        });
        found = true;
        break;
      }
    }

    // 死胡同，回溯
    if (!found) {
      stack.pop();
    }
  }

  return null; // 无解
}
```

### 3. 迷宫生成算法（Prim 算法）

```javascript
// core/mazeGenerator.js

function generateMaze(rows, cols) {
  // 初始化迷宫，全部为墙
  const maze = Array.from({ length: rows }, () => Array(cols).fill(1));

  // 起点
  const start = { row: 1, col: 1 };
  maze[start.row][start.col] = 0;

  // 墙列表
  const walls = [];
  addWalls(walls, start, maze, rows, cols);

  while (walls.length > 0) {
    const randomIndex = Math.floor(Math.random() * walls.length);
    const wall = walls[randomIndex];
    walls.splice(randomIndex, 1);

    const { row, col } = wall;

    // 检查墙两侧的单元格
    const neighbors = getPassageNeighbors(wall, maze, rows, cols);

    if (neighbors.length === 1) {
      maze[row][col] = 0;
      addWalls(walls, wall, maze, rows, cols);
    }
  }

  // 设置入口和出口
  maze[1][1] = 0;
  maze[rows - 2][cols - 2] = 0;

  return maze;
}
```

## 功能模块

### 模块一：迷宫编辑器

**功能描述**：用户可以手动绘制迷宫

- 点击切换墙壁/通路
- 拖拽绘制连续墙壁
- 设置起点/终点
- 清空/重置迷宫
- 导入/导出迷宫数据

**组件设计**：

```javascript
const MazeEditor = ({ initialMaze, onSave, onCancel }) => {
  const [maze, setMaze] = useState(initialMaze || createEmptyMaze(11, 11));
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState('wall');

  // 处理单元格点击
  const handleCellClick = (row: number, col: number) => {
    const newMaze = [...maze];
    newMaze[row][col] = newMaze[row][col] === 0 ? 1 : 0;
    setMaze(newMaze);
  };

  // 处理拖拽绘制
  const handleCellDrag = (row: number, col: number) => {
    if (!isDrawing) return;
    const newMaze = [...maze];
    newMaze[row][col] = drawMode === 'wall' ? 1 : 0;
    setMaze(newMaze);
  };

  return (
    <div className="maze-editor">
      <MazeGrid maze={maze} onCellClick={handleCellClick} onCellDrag={handleCellDrag} />
      <div className="controls">
        <Button onClick={() => onSave(maze)}>保存</Button>
        <Button onClick={onCancel}>取消</Button>
      </div>
    </div>
  );
};
```

### 模块二：迷宫生成器

**功能描述**：一键生成随机迷宫

- 支持多种生成算法
- 可调节迷宫大小
- 动画展示生成过程
- 保证有解

**生成算法**：

| 算法 | 特点 | 复杂度 |
|------|------|--------|
| Prim | 随机性强，路径复杂 | O(n) |
| Recursive Backtrack | 路径长，死胡同多 | O(n) |
| Kruskal | 均匀分布 | O(n log n) |

### 模块三：闯关模式

**功能描述**：用户手动控制角色走出迷宫

- 键盘/鼠标控制方向
- 实时显示位置
- 记录步数和时间
- 碰墙提示
- 成功/失败动画

**状态管理**：

```javascript
const useGameStore = create((set) => ({
  playerPosition: { row: 1, col: 1 },
  maze: [],
  steps: 0,
  timeElapsed: 0,
  status: 'playing',
  moveHistory: [],

  move: (direction) => {
    // 移动逻辑
  },

  reset: () => {
    // 重置游戏
  },
}));
```

### 模块四：算法演示

**功能描述**：可视化展示栈求解迷宫的过程

- 逐步动画展示
- 显示栈的状态变化
- 高亮当前探索路径
- 回溯动画
- 速度控制

**动画控制**：

```javascript
const useAnimation = () => {
  const [state, setState] = useState({
    isPlaying: false,
    speed: 1, // 1x, 2x, 4x
    currentStep: 0,
    totalSteps: 0,
    explorationPath: [],
    finalPath: [],
  });

  const play = () => { /* 播放 */ };
  const pause = () => { /* 暂停 */ };
  const reset = () => { /* 重置 */ };
  const setSpeed = (speed) => { /* 设置速度 */ };
  const stepForward = () => { /* 前进一步 */ };
  const stepBackward = () => { /* 后退一步 */ };

  return { state, play, pause, reset, setSpeed, stepForward, stepBackward };
};
```

### 模块五：路径展示

**功能描述**：以三元组形式展示求解路径

```
路径输出格式：
(1,1,1) -> (1,2,2) -> (3,2,3) -> (3,1,2) -> ...

其中：
- (i,j) 表示坐标
- d 表示走向下一格的方向
  1: 东  2: 南  3: 西  4: 北
```

## UI/UX 设计

### 设计风格

- **主题**：简洁现代，深色/浅色双主题
- **配色**：主色调为蓝色系，辅以灰色和强调色
- **字体**：Inter（英文）+ 思源黑体（中文）
- **图标**：Lucide Icons

### 页面布局

```
┌─────────────────────────────────────────────────┐
│                    Header                        │
├─────────────────────────────────────────────────┤
│         │                                       │
│  Side   │           Main Content                │
│  Bar    │                                       │
│         │                                       │
│         │                                       │
│         │                                       │
├─────────────────────────────────────────────────┤
│                    Footer                        │
└─────────────────────────────────────────────────┘
```

### 迷宫网格样式

```css
.maze-grid {
  display: grid;
  gap: 2px;
  background-color: #e5e7eb;
  padding: 2px;
  border-radius: 8px;
}

.maze-cell {
  width: 40px;
  height: 40px;
  transition: all 0.2s ease;
}

.maze-cell.wall {
  background-color: #1f2937;
}

.maze-cell.path {
  background-color: #ffffff;
}

.maze-cell.visited {
  background-color: #dbeafe;
}

.maze-cell.current {
  background-color: #3b82f6;
  transform: scale(1.1);
}

.maze-cell.solution {
  background-color: #10b981;
}

.maze-cell.player {
  background-color: #f59e0b;
  animation: pulse 1s infinite;
}
```

### 动画效果

```typescript
// 使用 Framer Motion 实现

// 1. 迷宫生成动画
const generateAnimation = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3 }
};

// 2. 路径探索动画
const explorationAnimation = {
  initial: { backgroundColor: '#ffffff' },
  animate: { backgroundColor: '#dbeafe' },
  transition: { duration: 0.2 }
};

// 3. 玩家移动动画
const playerAnimation = {
  initial: { x: 0, y: 0 },
  animate: { x: targetX, y: targetY },
  transition: { type: 'spring', stiffness: 300, damping: 20 }
};

// 4. 回溯动画
const backtrackAnimation = {
  initial: { backgroundColor: '#dbeafe' },
  animate: { backgroundColor: '#fecaca' },
  transition: { duration: 0.3 }
};
```

## 响应式设计

### 断点设置

```javascript
const breakpoints = {
  sm: '640px',   // 手机
  md: '768px',   // 平板
  lg: '1024px',  // 笔记本
  xl: '1280px',  // 桌面
  '2xl': '1536px', // 大屏
};
```

### 自适应迷宫

- 小屏：单元格 20px，简化控制面板
- 中屏：单元格 30px，侧边栏折叠
- 大屏：单元格 40px，完整布局

## 性能优化

### 1. 虚拟列表

对于大型迷宫（>50x50），使用虚拟列表渲染：

```javascript
const VirtualizedMazeGrid = ({ maze, cellSize }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

  // 只渲染可见区域的单元格
  const visibleCells = maze.slice(visibleRange.start, visibleRange.end);

  return (
    <div onScroll={handleScroll}>
      {visibleCells.map(row => row.map(cell => (
        <MazeCell key={cell.id} cell={cell} />
      )))}
    </div>
  );
};
```

### 2. 动画优化

- 使用 `requestAnimationFrame` 替代 `setInterval`
- 使用 CSS transform 替代 top/left
- 批量更新 DOM

### 3. 状态优化

- 使用 `useMemo` 缓存计算结果
- 使用 `useCallback` 缓存函数引用
- 拆分 Zustand store 避免不必要的重渲染

## 开发计划

### 阶段一：基础搭建（2天）

- [x] 项目初始化
- [x] 配置 Tailwind CSS
- [x] 配置路由
- [x] 实现布局组件

### 阶段二：核心算法（2天）

- [x] 实现链表栈
- [x] 实现迷宫求解算法
- [x] 实现迷宫生成算法
- [x] 编写单元测试

### 阶段三：功能开发（3天）

- [x] 迷宫编辑器
- [x] 迷宫生成器
- [x] 闯关模式
- [x] 算法演示

### 阶段四：优化完善（1天）

- [x] 动画效果
- [x] 响应式适配
- [x] 性能优化
- [x] 文档编写

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0 或 pnpm >= 8.0.0

### 安装

```bash
# 克隆项目
git clone <repo-url>
cd maze-solver

# 安装依赖
npm install
# 或
pnpm install

# 启动开发服务器
npm run dev
# 或
pnpm dev
```

### 构建

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 测试数据

标准测试迷宫（11x11）：

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

入口：(1, 1)
出口：(9, 9)

## 参考资源

- [React 官方文档](https://react.dev)
- [Vite 官方文档](https://vitejs.dev)
- [Tailwind CSS 文档](https://tailwindcss.com)
- [Framer Motion 文档](https://www.framer.com/motion)
- [shadcn/ui 组件库](https://ui.shadcn.com)

## 许可证

MIT License

## 作者

课程设计项目
