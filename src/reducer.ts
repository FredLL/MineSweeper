export interface ActionType {
  type: 'click'|'restart'
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
    nbFlags?: number
}

export enum Result {
  Bombed,
  Finished,
  WiP,
  Restart
}

const baseDelta = [-1, 0, 1];

const initMines = (rows: number, cols: number, nbMines: number, except: number) => {
  const mineMap: number[] = [];
  let iMines = 0;
  while (iMines < nbMines) {
    const newMine = Math.round(Math.random() * (rows * cols - 1));
    if (newMine != except && !mineMap[newMine]) {
      mineMap[newMine] = 1;
      iMines++;
    }
  }
  return mineMap;
};

export const initState = (rows: number, cols: number, nbMines: number, restart?: boolean):StateType => {
  return {
    gameMap: [],
    mineMap: [],
    rows: rows,
    cols: cols,
    nbMines: nbMines,
    result: restart? Result.Restart: undefined
  };
}

const calculateAround = (row:number, col:number, mineMap: number[], rows: number, cols: number):number => {
  let calculatedVal = 0;
  const execCalculateAround = (rows: number, cols: number, newRow: number, newCol: number) => {
    calculatedVal += mineMap[cols * newRow + newCol]?1:0;
    return false;
  };
  executeAround(row, col, rows, cols, execCalculateAround);
  return calculatedVal;
};

const executeAround = (row: number, col: number, rows: number, cols: number, exec: (rows: number, cols: number, newRow: number, newCol: number)=>boolean):boolean => {
  let res = false;
  try {
    baseDelta.forEach(deltaCol => {
      baseDelta.forEach(deltaRow => {
        if (deltaCol != 0 || deltaRow != 0) {
          const newRow = row + deltaRow;
          const newCol = col + deltaCol;
          if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
            if (exec(rows, cols, newRow, newCol)) {
              res = true;
            }
          }
        }
      });
    });
  } catch (e) {
    console.error(e.message);
  }
  return res;
};

const updateGameMap = (gameMap: number[], mineMap: number[], rows: number, cols: number, row: number, col: number, done: number[] = []): boolean => {
  const p = row*cols+col;
  if (done.indexOf(p) > -1) {
    return false;
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
    const shellsToUpdate:Array<{row: number,col: number}> = [];
    const execOnGameMap = (rows: number, cols: number, newRow: number, newCol: number) => {
      if (typeof gameMap[newRow*cols + newCol] == 'undefined') {
        shellsToUpdate.push({row: newRow, col: newCol});
      }
      return false;
    };
    executeAround(row, col, rows, cols, execOnGameMap);
    let res = false;
    while (shellsToUpdate.length) {
      const newPos = shellsToUpdate.pop();
      const newP = newPos.row*cols+newPos.col;
      if (done.indexOf(newP) == -1) {
        done.push(newP);
        const res = calculateAround(newPos.row, newPos.col, mineMap, rows, cols);
        gameMap[newP] = res;
        if (res == 0) {
          executeAround(newPos.row, newPos.col, rows, cols, execOnGameMap);
        }
      }
    }
    return res;
  }
  return false;
};

const checkLastClick = (state: StateType) => {
  if (state.result != Result.Bombed) {
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
          newState.result = Result.WiP;
        }
        if (updateGameMap(newState.gameMap, newState.mineMap, state.rows, state.cols, clickAction.row, clickAction.col)) {
          // click on mine
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
        return false;
      };
      executeAround(clickAction.row, clickAction.col, state.rows, state.cols, execCalculateVal);
      if (currentVal == calculatedVal) {
        const execUpdateGameMap = (rows: number, cols: number, newRow: number, newCol: number) => {
          if (typeof newState.gameMap[newRow * cols + newCol] == 'undefined') {
            return updateGameMap(newState.gameMap, state.mineMap, rows, cols, newRow, newCol);
          }
        };
        if (executeAround(clickAction.row, clickAction.col, state.rows, state.cols, execUpdateGameMap)) {
          // click on mine
          newState.result = Result.Bombed;
        }
      }
      // is this the last click ?
      checkLastClick(newState);
    }
    return newState;
  } else if (action.type == 'restart') {
    return initState(state.rows, state.cols, state.nbMines, true);
  }
  return state;
}