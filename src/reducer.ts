export interface ActionType {
  type: 'click'|'restart'|'timer'
}

interface ShellClickAction extends ActionType {
  col: number,
  row: number,
  which: number
}

export interface StateType {
    gameMap: number[],
    mineMap: number[],
    cols: number,
    rows: number,
    nbMines: number,
    result?: Result,
    timer?: number,
    startTime?: number,
    nbFlags?: number
}

export enum Result {
  Bombed,
  Finished,
  WiP
}

const baseDelta = [-1, 0, 1];

const initMines = (rows: number, cols: number, nbMines: number, except: number) => {
  const mineMap: number[] = [];
  let iMines = 0;
  while (iMines < nbMines) {
    const newMine = Math.round(Math.random() * rows * cols);
    if (newMine != except && !mineMap[newMine]) {
      mineMap[newMine] = 1;
      iMines++;
    }
  }
  return mineMap;
};

export const initState = (rows: number, cols: number, nbMines: number):StateType => {
  return {
    gameMap: [],
    mineMap: [],
    rows: rows,
    cols: cols,
    nbMines: nbMines
  };
}

const calculateAround = (row:number, col:number, mineMap: number[], rows: number, cols: number):number => {
  let calculatedVal = 0;
  const execCalculateAround = (rows: number, cols: number, newRow: number, newCol: number) => {
    calculatedVal += mineMap[cols * newRow + newCol]?1:0;
  };
  executeAround(row, col, rows, cols, execCalculateAround);
  return calculatedVal;
};

const executeAround = (row: number, col: number, rows: number, cols: number, exec: (rows: number, cols: number, newRow: number, newCol: number)=>void) => {
  baseDelta.forEach(deltaCol => {
    baseDelta.forEach(deltaRow => {
      if (deltaCol != 0 || deltaRow != 0) {
        const newRow = row + deltaRow;
        const newCol = col + deltaCol;
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
          exec(rows, cols, newRow, newCol);
        }
      }
    });
  });
};

const updateGameMap = (gameMap: number[], mineMap: number[], rows: number, cols: number, row: number, col: number, done: number[] = []): boolean => {
  const p = row*cols+col;
  if (done.indexOf(p) > -1) {
    return;
  }
  done.push(p);
  if (mineMap[p]) {
    // Mine
    gameMap[p] = 11;
    // show un-discovered mines
    mineMap.forEach((undefined, idx) => {
      if (idx != p && gameMap[idx] != 10) {
        gameMap[idx] = 9;
      }
    });
    gameMap.forEach((val, idx) => {
      if (val == 10 && typeof mineMap[idx] == 'undefined') {
        gameMap[idx] = 12;
      }
    });
    return true;
  }
  const res = calculateAround(row, col, mineMap, rows, cols);
  gameMap[p] = res;
  if (res == 0) {
    const execOnGameMap = (rows: number, cols: number, newRow: number, newCol: number) => {
      if (typeof gameMap[newRow*cols + newCol] == 'undefined') {
        updateGameMap(gameMap, mineMap, rows, cols, newRow, newCol, done);
      }
    };
    executeAround(row, col, rows, cols, execOnGameMap);
  }
  return false;
};

const checkLastClick = (state: StateType) => {
  state.result = Result.WiP;
  state.nbFlags = 0;
  state.gameMap.forEach(element => {
    if (element == 10) {
      state.nbFlags ++;
    }
  });
  if (state.nbFlags == state.nbMines) {
    state.result = Result.Finished;
    for (let i = 0; i < state.gameMap.length; i++) {
      if (typeof state.gameMap[i] === 'undefined') {
        state.result = Result.WiP;
        break;
      }
    }
  }
};

export const reduceGameMap = (state: StateType, action: ActionType):StateType => {
  if (action.type == 'click') {
    const clickAction = action as ShellClickAction;
    const p = clickAction.row * state.cols + clickAction.col;
    const currentVal = state.gameMap[p];
    const newState = (Object as any).assign({}, state) as StateType;
    if (typeof currentVal === 'undefined') {
      if (clickAction.which == 0) {
        if (newState.mineMap.length == 0) {
          // first click
          newState.mineMap = initMines(state.rows, state.cols, state.nbMines, p);
          const startTime = new Date().getTime();
          newState.timer = window.setInterval(() => {
            const timerElt = document.getElementById('timer');
            if (timerElt) {
                timerElt.innerHTML = '' + Math.floor((new Date().getTime() - startTime) / 1000);
            }
          }, 1000);
        }
        if (updateGameMap(newState.gameMap, newState.mineMap, state.rows, state.cols, clickAction.row, clickAction.col)) {
          // click on mine
          window.clearInterval(newState.timer);
          newState.result = Result.Bombed;
        } else {
          // is this the last click ?
          checkLastClick(newState);
        }
      } else if (clickAction.which == 2) {
        newState.gameMap[p] = 10;
        // is this the last click ?
        checkLastClick(newState);
      }
    } else if (currentVal == 10 && clickAction.which == 2) {
      newState.gameMap[p] = undefined;
      // is this the last click ?
      checkLastClick(newState);
    } else if (currentVal && clickAction.which == 1) {
      let calculatedVal = 0;
      const execCalculateVal = (rows: number, cols: number, newRow: number, newCol: number) => {
        if (newState.gameMap[newRow * cols + newCol] == 10) {
          calculatedVal++;
        }
      };
      executeAround(clickAction.row, clickAction.col, state.rows, state.cols, execCalculateVal);
      if (currentVal == calculatedVal) {
        const execUpdateGameMap = (rows: number, cols: number, newRow: number, newCol: number) => {
          if (typeof newState.gameMap[newRow * cols + newCol] == 'undefined') {
            updateGameMap(newState.gameMap, state.mineMap, rows, cols, newRow, newCol);
          }
        };
        executeAround(clickAction.row, clickAction.col, state.rows, state.cols, execUpdateGameMap);
      }
      // is this the last click ?
      checkLastClick(newState);
    }
    return newState;
  } else if (action.type == 'restart') {
    window.clearInterval(state.timer);
    const timerElt = document.getElementById('timer');
    if (timerElt) {
      timerElt.innerHTML = '0';
    }
    return initState(state.rows, state.cols, state.nbMines);
  }
  return state;
}