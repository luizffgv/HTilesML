import Column from "./column.js";
import { throwIfNull } from "./conversions.js";
import Note from "./note.js";

const NOTE_SIZE = 32;

const COLUMN_HEIGHT = 640;
const COLUMN_WIDTH = NOTE_SIZE;
const COLUMN_DEPTH = COLUMN_WIDTH;
const COLUMN_COUNT = 5;

const PERSPECTIVE = 1280;

/** How much timing wiggle room you have when hitting a note. */
const TIMING_WINDOW_SECONDS = 0.15;

/** Perfect note position for a hit */
const PERFECT_Y = COLUMN_HEIGHT - NOTE_SIZE / 2;

const DIFFICULTY_INITIAL = 1;

let difficultyLevel = DIFFICULTY_INITIAL;

let bestDifficultyLevel = Number.parseFloat(
  localStorage.getItem("highscore") ?? String(DIFFICULTY_INITIAL)
);

/** @type {number | undefined} */
let lastStepTimestamp;

const elements = {
  columns: throwIfNull(document.getElementById("columns")),
  columnsContainer: throwIfNull(document.getElementById("columns-container")),
  miss: throwIfNull(document.getElementById("miss-overlay")),
  gameContainer: throwIfNull(document.getElementById("game-container")),
  startButton: throwIfNull(document.getElementById("start-button")),
  infoCard: throwIfNull(document.getElementById("info-card")),
  difficultyLevel: throwIfNull(document.getElementById("difficulty-level")),
  bestDifficultyLevel: throwIfNull(
    document.getElementById("best-difficulty-level")
  ),
};

elements.columnsContainer.style.perspective = `${PERSPECTIVE}px`;

elements.columns.style.height = `${COLUMN_HEIGHT}px`;
elements.columns.style.scale = String(innerHeight / COLUMN_HEIGHT);
addEventListener("resize", () => {
  elements.columns.style.scale = String(innerHeight / COLUMN_HEIGHT);
});

const missAnimation = new Animation(
  new KeyframeEffect(
    elements.miss,
    [{ background: "rgba(255, 0, 0, 0.165)" }, { background: "none" }],
    { duration: 150 }
  )
);

/** How long notes take to cross an entire column, in seconds. */
function getNoteTravelTime() {
  return 1 / difficultyLevel;
}

/**
 * Maps a value from a range to another.
 *
 * @param {number} fromStart Start of initial range.
 * @param {number} fromEnd End of initial range.
 * @param {number} toStart Start of target range.
 * @param {number} toEnd End of target range.
 * @param {number} value Value.
 */
function map(fromStart, fromEnd, toStart, toEnd, value) {
  const fromRangeSize = fromEnd - fromStart;
  const fromProgress = (value - fromStart) / fromRangeSize;
  const toRangeSize = toEnd - toStart;
  return toStart + fromProgress * toRangeSize;
}

/** Spawns a note or two notes at once. */
function spawnNotes() {
  function getRandomColumnIndex() {
    return Math.floor(Math.random() * COLUMN_COUNT) % COLUMN_COUNT;
  }

  function createNote() {
    const note = new Note();
    note.size = NOTE_SIZE;
    return note;
  }

  const columns = elements.columns.children;

  const columnIndex = getRandomColumnIndex();
  const column = /** @type {Column} */ (
    throwIfNull(columns[getRandomColumnIndex()])
  );

  // Spawn second note
  if (Math.random() < 0.2) {
    let secondColumnIndex = getRandomColumnIndex();
    if (secondColumnIndex == columnIndex)
      secondColumnIndex = (secondColumnIndex + 1) % COLUMN_COUNT;

    const secondColumn = /** @type {Column} */ (
      throwIfNull(columns[secondColumnIndex])
    );
    secondColumn.notesContainer.appendChild(createNote());
  }

  column.notesContainer.appendChild(createNote());
}

/** Advances note positions. */
function step() {
  if (lastStepTimestamp == null) lastStepTimestamp = performance.now();
  const currentTimestamp = performance.now();
  const timeDelta = currentTimestamp - lastStepTimestamp;
  lastStepTimestamp = currentTimestamp;

  const noteTravelTime = getNoteTravelTime();

  const noteRemovalYThreshold =
    PERFECT_Y + ((COLUMN_HEIGHT / noteTravelTime) * TIMING_WINDOW_SECONDS) / 2;

  for (const column of elements.columns.children)
    for (const element of /** @type {Column} */ (column).notesContainer
      .children) {
      const note = /** @type {Note} */ (element);

      if (note.y > noteRemovalYThreshold) {
        note.remove();
        miss();
      }

      note.y += (COLUMN_HEIGHT * (timeDelta / 1000)) / noteTravelTime;
    }
}

/** Updates all text information in the screen. */
function updateText() {
  elements.difficultyLevel.textContent = String(difficultyLevel.toFixed(2));

  elements.bestDifficultyLevel.textContent = String(
    bestDifficultyLevel.toFixed(2)
  );
}

/** Plays a miss effect and resets the difficulty level. */
function miss() {
  missAnimation.cancel();
  missAnimation.play();
  if (
    bestDifficultyLevel >
    Number.parseFloat(localStorage.getItem("highscore") ?? "0")
  )
    localStorage.setItem("highscore", String(difficultyLevel));
  difficultyLevel = DIFFICULTY_INITIAL;
  updateText();
}

/** Starts the game. */
function start() {
  elements.infoCard.classList.add("hidden");
  elements.gameContainer.classList.remove("hidden");

  setInterval(() => {
    if (!document.hidden && Math.random() < 0.5) spawnNotes();
  }, 200);

  const stepIfNotHidden = () => {
    requestAnimationFrame(stepIfNotHidden);
    if (!document.hidden) step();
  };
  requestAnimationFrame(stepIfNotHidden);

  setInterval(() => {
    if (document.hidden) return;
    difficultyLevel += map(1, 5, 0.1, 0, difficultyLevel);
    bestDifficultyLevel = Math.max(bestDifficultyLevel, difficultyLevel);
    updateText();
  }, 1000);

  updateText();
}

/**
 * Called when the user presses a column.
 *
 * @param {Column} column Target column
 */
function press(column) {
  column.playPressAnimation();

  const closestNote = /** @type {Note | null} */ (
    column.notesContainer.firstChild
  );
  if (closestNote == null) {
    miss();
    return;
  }

  const timingWindowPx =
    COLUMN_HEIGHT * (TIMING_WINDOW_SECONDS / getNoteTravelTime());
  const distance = Math.abs(PERFECT_Y - closestNote.y);
  if (distance > timingWindowPx / 2) {
    miss();
    return;
  }

  closestNote.remove();
}

// Spawn columns
for (let columnIndex = 0; columnIndex < COLUMN_COUNT; ++columnIndex) {
  const column = new Column();
  column.dimensions = {
    noteSize: NOTE_SIZE,
    height: COLUMN_HEIGHT,
    depth: COLUMN_DEPTH,
  };
  column.id = `column-${columnIndex}`;
  column.addEventListener(
    "touchstart",
    (event) => {
      event.preventDefault();
      press(column);
    },
    { passive: false }
  );
  elements.columns.appendChild(column);
}

addEventListener("keydown", (event) => {
  /** @type Record<string, number> */
  const keys = { d: 0, f: 1, " ": 2, j: 3, k: 4 };

  const pressedColumnIndex = keys[event.key];
  if (pressedColumnIndex == undefined) return;

  const column = /** @type {Column} */ (
    throwIfNull(elements.columns.children[pressedColumnIndex])
  );

  press(column);
});

const startOnClick = () => {
  start();
  elements.startButton.removeEventListener("click", startOnClick);
};
elements.startButton.addEventListener("click", startOnClick);
