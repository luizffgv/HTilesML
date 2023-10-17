import { throwIfNull } from "./conversions.js";
import Cube from "./cube.js";

export default class Note extends HTMLElement {
  static #template = `
    <div id="cube-container">
      <game-cube id="cube"></game-cube>
      <div id="shadow"></div>
    </div>
  `;

  static #styles;
  static {
    this.#styles = new CSSStyleSheet();
    this.#styles.replaceSync(`
      @keyframes spawn {
        from {
          transform: translateZ(32px);
        }
      }

      :host {
        transform-style: preserve-3d;
      }

      #cube-container {
        position: absolute;
        transform-style: preserve-3d;
      }

      #cube {
        animation: 150ms ease-out spawn;
        transform: translateZ(4px);

        &::part(front) {
          background-color: #444;
        }

        &::part(bottom), &::part(left), &::part(right), &::part(top),
        &::part(back) {
          background-color: #222;
        }
      }

      #shadow {
        background-color: #0004;
        transform: translateX(-50%) translateY(-50%);
        filter: blur(5px);
      }
    `);
  }

  /** @type {ShadowRoot} */
  #shadowRoot;

  get #cubeContainer() {
    return /** @type {HTMLElement} */ (
      this.#shadowRoot.getElementById("cube-container")
    );
  }

  get #cube() {
    return /** @type {Cube} */ (this.#shadowRoot.getElementById("cube"));
  }

  get #shadow() {
    return /** @type {HTMLElement} */ (
      this.#shadowRoot.getElementById("shadow")
    );
  }

  /** Y position of the note. */
  get y() {
    const offset = throwIfNull(
      this.#cubeContainer.style.translate.split(" ")
    )[1];

    if (offset == null) return 0;
    return Number.parseFloat(offset);
  }

  /**
   * Y position of the note.
   *
   * @param {number} value New Y position.
   */
  set y(value) {
    this.#cubeContainer.style.translate = `0 ${value}px`;
  }

  /**
   * Size of the note, applies to width and height.
   *
   * @param {number} size New size.
   */
  set size(size) {
    this.#cube.width = size;
    this.#cube.height = size;

    this.#shadow.style.width = `${size * 1.1}px`;
    this.#shadow.style.height = `${size * 1.1}px`;
  }

  constructor() {
    super();

    this.#shadowRoot = this.attachShadow({ mode: "closed" });
    this.#shadowRoot.adoptedStyleSheets.push(Note.#styles);
    this.#shadowRoot.innerHTML = Note.#template;

    this.#cube.depth = 8;
  }
}

customElements.define("game-note", Note);
