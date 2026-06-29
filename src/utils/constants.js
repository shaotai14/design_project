// 方向定义: 东(0,1) 南(1,0) 西(0,-1) 北(-1,0)
export const DIRECTIONS = [
  { dr: 0, dc: 1, name: '东', code: 1, label: '→' },
  { dr: 1, dc: 0, name: '南', code: 2, label: '↓' },
  { dr: 0, dc: -1, name: '西', code: 3, label: '←' },
  { dr: -1, dc: 0, name: '北', code: 4, label: '↑' },
]

// 单元格类型
export const CELL_TYPES = {
  WALL: 1,
  PATH: 0,
}

// 迷宫默认配置
export const MAZE_CONFIG = {
  MIN_SIZE: 5,
  MAX_SIZE: 51,
  DEFAULT_ROWS: 11,
  DEFAULT_COLS: 11,
  DEFAULT_CELL_SIZE: 40,
}

// 动画速度配置
export const ANIMATION_SPEEDS = {
  SLOW: { label: '0.5x', value: 800 },
  NORMAL: { label: '1x', value: 400 },
  FAST: { label: '2x', value: 200 },
  FASTER: { label: '4x', value: 100 },
  FASTEST: { label: '8x', value: 50 },
}

// 游戏状态
export const GAME_STATUS = {
  IDLE: 'idle',
  PLAYING: 'playing',
  WON: 'won',
  LOST: 'lost',
}

// 路由路径
export const ROUTES = {
  HOME: '/',
  PLAY: '/play',
  SOLVE: '/solve',
  EDITOR: '/editor',
  ABOUT: '/about',
}
