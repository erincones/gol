/* Global functions */

/**
 * `document.getElementById` helper function.
 *
 * @type {document[`getElementById`]}
 */
const find = document.getElementById.bind(document);

/**
 * `document.createElement` helper function.
 *
 * @type {document[`createElement`]}
 */
const create = document.createElement.bind(document);

/**
 * Get the integer value of the given input element.
 *
 * @param {HTMLInputElement} el Input element.
 * @return {number|null} Input value as number if is a valid integer, either null.
 */
function intVal(el) {
  const num = Number(el.value);
  return Number.isInteger(num) ? num : null;
};

/**
 * Check if the given cell is alive.
 *
 * @param {HTMLDivElement} cell Game cell
 * @returns {boolean} True if the cell is alive
 */
function isAlive(cell) {
  return cell.classList.contains(`alive`);
}

/**
 * Get the valid left and right cells index of cell at the given index.
 *
 * @param {number} index Cell index.
 * @param {number} cols Number of columns.
 * @param {boolean} [wrap=true] Wrap option.
 * @returns {number[]} Left and right cells index.
 */
function lookSides(index, cols, wrap = true) {
  const col = index % cols;
  const max = cols - 1;
  const sides = [];

  if (col) {
    sides.push(index - 1);
    if (col !== max) sides.push(index + 1);
    else if (wrap)   sides.push(index - max);
  }
  else {
    if (wrap) sides.push(index + max);
    sides.push(index + 1);
  }

  return sides;
}


/* Main function */

window.addEventListener(`load`, () => {
  /* Elements */

  // Properties

  const wrapElem = find(`wrap`);
  const rowsElem = find(`rows`);
  const colsElem = find(`cols`);
  const freqElem = find(`freq`);

  // Controls

  const clear = find(`clear`);
  const random = find(`random`);
  const playPause = find(`play-stop`);
  const next = find(`next`);

  // Information

  const gensElem = find(`gens`);
  const cellsElem = find(`cells`);
  const aliveElem = find(`alive`);
  const deadElem = find(`dead`);

  // Style

  const cellSizeElem = find(`cell-size`);
  const borderWidthElem = find(`border-width`);
  const borderColorElem = find(`border-color`);
  const aliveColorElem = find(`alive-color`);
  const deadColorElem = find(`dead-color`);
  const swapColorsElem = find(`swap-colors`);

  // Other elements
  
  const style = find(`style`);
  const board = find(`board`);
  const year = find(`year`);
  const coords = find(`coords`);

  /* Variables */

  // Game properties

  /** @type {HTMLDivElement[]} */
  let game = [];
  let gameID = 0;
  let wrap = true;
  let rows = 25;
  let cols = 25;
  let freq = 10;

  // Information

  let gens = 0;
  let cells = rows * cols;
  let alive = 0;
  let dead = cells;

  // Style

  let cellSize = 10;
  let borderWidth = 1;
  let borderColor = `#707070`;
  let aliveColor = `#000000`;
  let deadColor = `#ffffff`;


  /* Functions */

  /**
   * Update the information.
   */
  function updateInfo() {
    gensElem.value = gens;
    cellsElem.value = cells;
    aliveElem.value = alive;
    deadElem.value = dead;
  }

  /**
   * Update the styles.
   */
  function updateStyle() {
    board.style.borderColor = borderColor;
    board.style.borderWidth = `0 0 ${borderWidth}px ${borderWidth}px`;
    board.style.width = `${cellSize * cols}px`;

    style.textContent = `#board div {
  background-color: ${deadColor};
  border-color: ${borderColor};
  border-width: ${borderWidth}px ${borderWidth}px 0 0;
  width: ${cellSize}px;
  height: ${cellSize}px;
}

#board .alive {
  background-color: ${aliveColor};
}`;
  }

  /**
   * Make the cell alive.
   *
   * @param {MouseEvent} ev Mouse event.
   */
  function toggler(ev) {
    const cell = ev.target;
    let action;
    let ind;

    switch (ev.type) {
      case `mousedown`:
        switch (ev.button) {
          case 0: action = 1; break;
          case 2: action = -1;
        } break;
      case `mouseenter`:
        ind = [ ...cell.parentElement.children ].indexOf(cell);
        coords.textContent = `Row: ${Math.trunc(ind / cols) + 1} Col: ${ind % cols + 1}`;

        switch (ev.buttons & 3) {
          case 1: action = 1; break;
          case 2: action = -1
        }
    }

    switch (action) {
      case  1: if (!isAlive(cell)) { cell.className = `alive`; break; } else return;
      case -1: if (isAlive(cell))  { cell.className = ``;      break; } else return;
      default: return;
    }

    alive += action;
    dead -= action;

    aliveElem.value = alive;
    deadElem.value = dead;
  }

  /**
   * Creates a new game cell.
   *
   * @returns {HTMLDivElement} Cell.
   */
  function createCell() {
    const cell = create(`div`);
    cell.className = ``;
    cell.addEventListener(`mousedown`, toggler, false);
    cell.addEventListener(`mouseenter`, toggler, false);

    return cell;
  }

  /**
   * Update information.
   *
   * @param {number} newRows New number of rows.
   * @param {number} newCols New number of columns.
   */
  function resizeBoard(newRows, newCols) {
    pause();

    // Remove cells
    game.forEach(cell => { cell.remove(); });

    // Same columns
    if (newCols === cols) {
      // Add rows
      if (newRows > rows) {
        const incomming = (newRows - rows) * cols;
        for (let i = 0; i < incomming; ++i) game.push(createCell());
      }
      // Remove rows
      else {
        const outcomming = game.length - (newRows * cols);
        for (let i = 0; i < outcomming; ++i) game.pop();
      }
    }
    // Same rows
    else {
      const newGame = [];

      // Add columns
      if (newCols > cols) {
        const incoming = newCols - cols;
        game.forEach((cell, i) => {
          newGame.push(cell);
          if ((i + 1) % cols === 0) for (let j = 0; j < incoming; ++j) newGame.push(createCell());
        });
      }
      // Remove columns
      else game.forEach((cell, i) => { if (i % cols < newCols) newGame.push(cell); });

      game = newGame;
    }

    // Add cells and update game
    alive = 0;

    game.forEach(cell => {
      if (isAlive(cell)) ++alive;
      board.appendChild(cell);
    });

    rows = newRows;
    cols = newCols;
    cells = newRows * newCols;
    gens = 0;
    dead = cells - alive;

    updateInfo();
    updateStyle();
  }

  /**
   * Make a game step.
   */
  function step() {
    alive = 0;

    game.map((cell, i) => {
      let around = 0;

      // Sides
      lookSides(i, cols, wrap).forEach(ind => { if (isAlive(game[ind])) ++around; });

      // Top
      let index = i - cols;
      if (index < 0 && wrap) index += cells;
      if (index >= 0) {
        if (isAlive(game[index])) ++around;
        lookSides(index, cols, wrap).forEach(ind => { if (isAlive(game[ind])) ++around; });
      }
      
      // Bottom
      index = i + cols;
      if (index >= cells && wrap) index -= cells;
      if (index < cells) {
        if (isAlive(game[index])) ++around;
        lookSides(index, cols, wrap).forEach(ind => { if (isAlive(game[ind])) ++around; });
      }

      // Check next status
      if (around === 3 || (around === 2 && isAlive(cell))) {
        ++alive;
        return `alive`;
      }

      return ``;
    }).forEach((status, i) => { game[i].className = status; });

    dead = cells - alive;
    ++gens;

    updateInfo();
  }

  /**
   * Start game interval.
   */
  function play() {
    if (gameID !== 0) return;

    gameID = setInterval(step, 1000 / freq);
    
    playPause.textContent = `Pause`;
  }

  /**
   * Stop game interval.
   */
  function pause() {
    if (gameID === 0) return;

    clearInterval(gameID);
    gameID = 0;

    playPause.textContent = `Play`;
  }


  /* Event handlers */

  // Controls

  clear.addEventListener(`click`, () => {
    pause();

    game.forEach(cell => { cell.classList.remove(`alive`); });

    gens = 0;
    alive = 0;
    dead = cells;

    updateInfo();
  }, false);

  random.addEventListener(`click`, () => {
    pause();

    gens = 0;
    alive = Math.trunc(Math.random() * (cells / 2 - 1) + 1);
    dead = cells - alive;

    game.forEach(cell => { cell.classList.remove(`alive`); });

    let remaining = alive;
    while (remaining) {
      const index = Math.trunc(Math.random() * cells);
      const classes = game[index].classList;

      if (!classes.contains(`alive`)) {
        classes.add(`alive`);
        --remaining;
      }
    }

    updateInfo();
  }, false);

  playPause.addEventListener(`click`, () => { gameID ? pause() : play(); }, false);

  next.addEventListener(`click`, step);

  // Options

  wrapElem.addEventListener(`change`, () => {
    pause();

    wrap = wrapElem.checked;
    
    gens = 0;
    gensElem.value = gens;
  }, false);

  rowsElem.addEventListener(`change`, () => {
    const val = intVal(rowsElem);
    if (val !== null) {
      resizeBoard(val, cols);
    }
  }, false);

  colsElem.addEventListener(`change`, () => {
    const val = intVal(colsElem);
    if (val !== null) {
      resizeBoard(rows, val);
    }
  }, false);

  freqElem.addEventListener(`change`, () => {
    const val = intVal(freqElem);
    if (val !== null) {
      freq = val;
      pause();
      play();
    }
  }, false);

  // Style

  cellSizeElem.addEventListener(`change`, () => {
    const val = intVal(cellSizeElem);
    if (val !== null) {
      cellSize = val;
      updateStyle();
    }
  }, false);

  borderWidthElem.addEventListener(`change`, () => {
    const val = intVal(borderWidthElem);
    if (val !== null) {
      borderWidth = val;
      updateStyle();
    }
  }, false);
  
  borderColorElem.addEventListener(`change`, () => { borderColor = borderColorElem.value; updateStyle(); }, false);

  aliveColorElem.addEventListener(`change`, () => { aliveColor = aliveColorElem.value; updateStyle(); }, false);
  
  deadColorElem.addEventListener(`change`, () => { deadColor = deadColorElem.value; updateStyle(); }, false);

  swapColorsElem.addEventListener(`click`, () => {
    const temp = aliveColor;
    aliveColor = deadColor;
    deadColor = temp;

    aliveColorElem.value = aliveColor;
    deadColorElem.value = deadColor;

    updateStyle();
  });

  // Others

  board.addEventListener(`contextmenu`, ev => { ev.preventDefault(); }, false);

  board.addEventListener(`dragstart`, ev => { ev.preventDefault(); }, false);

  board.addEventListener(`mouseout`, () => { coords.innerText = `Row: - Col: -`; });

  window.addEventListener(`keydown`, ev => {
    switch (ev.target.tagName) {
      case `BUTTON`:
      case `INPUT`: return;
    }

    switch (ev.key.toUpperCase()) {
      case ` `:
      case `P`: playPause.click(); return;
      case `R`: random.click(); return;
      case `C`: clear.click(); return;
      case `N`: next.click();
    }
  });


  /* Initialization */

  // Set values

  wrapElem.checked = wrap;
  rowsElem.value = rows;
  colsElem.value = cols;
  freqElem.value = freq;

  cellSizeElem.value = cellSize;
  borderWidthElem.value = borderWidth;
  borderColorElem.value = borderColor;
  aliveColorElem.value = aliveColor;
  deadColorElem.value = deadColor;

  year.textContent = new Date().getFullYear();

  // Generate random game

  for (let i = 0; i < cells; ++i) {
    const cell = createCell();
    game.push(cell);
    board.appendChild(cell);
  }

  updateStyle();
  random.click();
}, false);
