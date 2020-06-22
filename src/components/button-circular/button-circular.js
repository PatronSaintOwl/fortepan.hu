import { trigger, isTouchDevice } from "../../utils"

class ButtonCircular extends HTMLElement {
  constructor() {
    super()

    if (this.dataset.trigger) {
      this.addEventListener(isTouchDevice() ? "touchstart" : "click", this.onClick.bind(this))
    }
  }

  onClick(e) {
    e.preventDefault()
    trigger(this.dataset.trigger, { currentTarget: e.currentTarget })
  }
}

window.customElements.define("button-circular", ButtonCircular)
