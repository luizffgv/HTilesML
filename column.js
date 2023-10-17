import Cube from "./cube.js";

export default class Column extends HTMLElement {
  static #template = `
    <div id="notes-container"></div>
    <game-cube id="cube"></game-cube>
    <div id="target"></div>
  `;

  static #styles;
  static {
    this.#styles = new CSSStyleSheet();
    this.#styles.replaceSync(`
      :host {
        transform-style: preserve-3d;
        transform-origin: top;
      }

      #notes-container {
        position: absolute;
        display: flex;
        justify-content: center;
        width: 100%;
        transform-style: preserve-3d;
        transform: translateZ(1px);
      }

      #cube {
        &::part(left), &::part(back), &::part(right), &::part(top),
        &::part(bottom) {
          background-color: #bbb;
        }

        &::part(front) {
          background-color: white;
        }
      }

      #target {
        position: absolute;
        bottom: 0;
        width: 100%;
        background-color: #0001;
      }
    `);
  }

  /** @type {ShadowRoot} */
  #shadowRoot;

  /** @type {Animation} */
  #animation;

  get #cube() {
    return /** @type {Cube} */ (this.#shadowRoot.getElementById("cube"));
  }

  get #target() {
    return /** @type {HTMLElement} */ (
      this.#shadowRoot.getElementById("target")
    );
  }

  /** Element containing the notes. */
  get notesContainer() {
    return /** @type {HTMLElement} */ (
      this.#shadowRoot.getElementById("notes-container")
    );
  }

  /**
   * Sets the dimensions for the column.
   *
   * @param {{noteSize: number, height: number, depth: number}} dimensions
   */
  set dimensions(dimensions) {
    const { noteSize, height, depth } = dimensions;

    this.notesContainer.style.height = `${height}px`;

    this.style.width = `${noteSize}px`;

    this.#cube.height = height;
    this.#cube.width = noteSize;
    this.#cube.depth = depth;
    this.#cube.style.transform = `translateX(${noteSize / 2}px) translateY(${
      height / 2
    }px) translateZ(-${depth / 2}px)`;

    this.#target.style.height = `${noteSize}px`;
  }

  constructor() {
    super();

    this.#shadowRoot = this.attachShadow({ mode: "closed" });
    this.#shadowRoot.adoptedStyleSheets.push(Column.#styles);
    this.#shadowRoot.innerHTML = Column.#template;

    this.#animation = new Animation(
      new KeyframeEffect(
        this,
        [
          {
            rotate: "x -2.5deg",
          },
          {
            rotate: "none",
          },
        ],
        { duration: 150 }
      )
    );
  }

  playPressAnimation() {
    this.#animation.cancel();
    this.#animation.play();
  }
}

customElements.define("game-column", Column);
