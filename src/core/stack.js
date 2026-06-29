/**
 * 链表栈实现
 * 用于迷宫求解算法中的路径记录和回溯
 */
export class LinkedStack {
  constructor() {
    this.top = null
    this.size = 0
  }

  /**
   * 入栈
   * @param {any} item 数据
   */
  push(item) {
    const node = { data: item, next: this.top }
    this.top = node
    this.size++
  }

  /**
   * 出栈
   * @returns {any|null} 栈顶数据
   */
  pop() {
    if (this.isEmpty()) return null
    const data = this.top.data
    this.top = this.top.next
    this.size--
    return data
  }

  /**
   * 查看栈顶元素
   * @returns {any|null}
   */
  peek() {
    return this.isEmpty() ? null : this.top.data
  }

  /**
   * 判断栈是否为空
   * @returns {boolean}
   */
  isEmpty() {
    return this.top === null
  }

  /**
   * 获取栈大小
   * @returns {number}
   */
  getSize() {
    return this.size
  }

  /**
   * 将栈转换为数组（从栈顶到栈底）
   * @returns {any[]}
   */
  toArray() {
    const result = []
    let current = this.top
    while (current) {
      result.push(current.data)
      current = current.next
    }
    return result
  }

  /**
   * 清空栈
   */
  clear() {
    this.top = null
    this.size = 0
  }
}
