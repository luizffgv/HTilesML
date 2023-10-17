export default class Cube extends HTMLElement {
  static #template = `
    <div id="front" part="front" class="face"></div>
    <div id="left" part="left" class="face"></div>
    <div id="back" part="back" class="face"></div>
    <div id="right" part="right" class="face"></div>
    <div id="top" part="top" class="face"></div>
    <div id="bottom" part="bottom" class="face"></div>
  `;

  static #styles;
  static {
    this.#styles = new CSSStyleSheet();
    this.#styles.replaceSync(`
      :host {
        position: absolute;
        transform-style: preserve-3d;
      }

      .face {
        position: absolute;
      }
    `);
  }

  /** @type {ShadowRoot} */
  #shadowRoot;

  /** @type {{width: number, height: number, depth: number}} */
  #size = { width: 1, height: 1, depth: 1 };

  get width() {
    return this.#size.width;
  }

  set width(width) {
    this.#size.width = width;
    this.#updateDimensions();
  }

  get height() {
    return this.#size.height;
  }

  set height(height) {
    this.#size.height = height;
    this.#updateDimensions();
  }

  get depth() {
    return this.#size.depth;
  }

  set depth(depth) {
    this.#size.depth = depth;
    this.#updateDimensions();
  }

  get #front() {
    return /** @type {HTMLElement} */ (
      this.#shadowRoot.getElementById("front")
    );
  }

  get #left() {
    return /** @type {HTMLElement} */ (this.#shadowRoot.getElementById("left"));
  }

  get #back() {
    return /** @type {HTMLElement} */ (this.#shadowRoot.getElementById("back"));
  }

  get #right() {
    return /** @type {HTMLElement} */ (
      this.#shadowRoot.getElementById("right")
    );
  }

  get #top() {
    return /** @type {HTMLElement} */ (this.#shadowRoot.getElementById("top"));
  }

  get #bottom() {
    return /** @type {HTMLElement} */ (
      this.#shadowRoot.getElementById("bottom")
    );
  }

  constructor() {
    super();

    this.#shadowRoot = this.attachShadow({ mode: "closed" });
    this.#shadowRoot.adoptedStyleSheets.push(Cube.#styles);
    this.#shadowRoot.innerHTML = Cube.#template;

    this.#updateDimensions();
  }

  #updateDimensions() {
    const { width, height, depth } = this.#size;

    const [widthStr, heightStr, depthStr] =
      /** @type {[string, string, string]} */ (
        [width, height, depth].map((size) => `${size}px`)
      );

    const frontStyle = this.#front.style;
    const leftStyle = this.#left.style;
    const backStyle = this.#back.style;
    const rightStyle = this.#right.style;
    const topStyle = this.#top.style;
    const bottomStyle = this.#bottom.style;

    frontStyle.width = widthStr;
    frontStyle.height = heightStr;
    frontStyle.transform = `translate(-50%, -50%) translateZ(${depth / 2}px)`;

    leftStyle.width = depthStr;
    leftStyle.height = heightStr;
    leftStyle.transform = `translate(-50%, -50%) rotateY(-90deg) translateZ(${
      width / 2
    }px)`;

    backStyle.width = widthStr;
    backStyle.height = heightStr;
    backStyle.transform = `translate(-50%, -50%) rotateY(180deg) translateZ(${
      depth / 2
    }px)`;

    rightStyle.width = depthStr;
    rightStyle.height = heightStr;
    rightStyle.transform = `translate(-50%, -50%) rotateY(90deg) translateZ(${
      width / 2
    }px)`;

    topStyle.width = widthStr;
    topStyle.height = depthStr;
    topStyle.transform = `translate(-50%, -50%) rotateX(90deg) translateZ(${
      height / 2
    }px)`;

    bottomStyle.width = widthStr;
    bottomStyle.height = depthStr;
    bottomStyle.transform = `translate(-50%, -50%) rotateX(-90deg) translateZ(${
      height / 2
    }px)`;
  }
}

customElements.define("game-cube", Cube);
