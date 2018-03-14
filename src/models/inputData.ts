import { observable, action, computed } from 'mobx'
import throttle from 'lodash.throttle'

export interface Point { x: number, y: number }
export interface Bounds { left: number, top: number, bottom: number, right: number }

export class InputData {
    @observable mousePosition: Point = { x: 0, y: 0 }
    @observable mouseDown = false

    @computed get mouseX() { return this.mousePosition.x }
    @computed get mouseY() { return this.mousePosition.y }

    constructor() {
      if (typeof window !== 'undefined') {
        window.addEventListener('mousemove', throttle(e => this.setMousePositionFromEvent(e), 100))
        window.addEventListener('mousedown', () => this.setMouseDown(true))
        window.addEventListener('mouseup', () => this.setMouseDown(false))
      }
    }

    isMouseWithinBounds(b: Bounds | null) {
      if (!b) {
        return false
      }

      const p = this.mousePosition
      return p.x >= b.left && p.x <= b.right && p.y >= b.top && p.y <= b.bottom
    }

    getMouseXPercent(b: Bounds | null) {
      if (!b) {
        return -1
      }

      const p = 1 - (b.right - this.mouseX) / (b.right - b.left)
      return p
    }

    getMouseXIndex(b: Bounds | null, length: number) {
      if (!this.isMouseWithinBounds(b)) {
       return -1
     }

      const xp = this.getMouseXPercent(b)
      const xIndex = Math.floor(xp * length)
      return xIndex
    }

    @action setMousePositionFromEvent(e: MouseEvent) {
      this.mousePosition = { x: e.clientX, y: e.clientY }
    }

    @action setMouseDown(down: boolean) {
      this.mouseDown = down
    }
}

const store = new InputData()
export default store
