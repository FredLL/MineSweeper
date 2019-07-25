export interface ActionType {
  type: 'click'|'restart'
}

interface ShellClickAction extends ActionType {
  col: number,
  row: number,
  which: number
}

interface RestartClickAction extends ActionType {
}

export interface StateType {
    gameMap: number[],
    mineMap: number[],
    cols: number,
    rows: number,
    nbMines: number,
    result: boolean,
    revealed: number
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
    nbMines: nbMines,
    result: false,
    revealed: 0
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

export const reduceGameMap = (state: StateType, action: ActionType):StateType => {
  if (action.type == 'click') {
    const clickAction = action as ShellClickAction;
    const p = clickAction.row * state.cols + clickAction.col;
    const currentVal = state.gameMap[p];
    const newState = (Object as any).assign({}, state);
    if (typeof currentVal === 'undefined') {
      if (clickAction.which == 0) {
        if (newState.mineMap.length == 0) {
          newState.mineMap = initMines(newState.rows, newState.cols, newState.nbMines, p);
        }
        if (updateGameMap(newState.gameMap, newState.mineMap, newState.rows, newState.cols, clickAction.row, clickAction.col)) {
          newState.result = true;
        }
      } else if (clickAction.which == 2) {
        newState.gameMap[p] = 10;
      }
    } else if (currentVal == 10 && clickAction.which == 2) {
      newState.gameMap[p] = undefined;
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
    }
    return newState;
  } else if (action.type == 'restart') {
    return initState(state.rows, state.cols, state.nbMines);
  }
  return state;
}