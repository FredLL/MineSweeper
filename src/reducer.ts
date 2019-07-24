interface ActionType {
  type: 'click',
  col: number,
  row: number,
  which: number
}

export interface StateType {
    gameMap: number[],
    mineMap: number[],
    cols: number,
    rows: number,
    nbMines: number
}

const baseDelta = [-1, 0, 1];

export const initMines = (rows: number, cols: number, nbMines: number) => {
  const mineMap: number[] = [];
  let iMines = 0;
  while (iMines < nbMines) {
    const newMine = Math.round(Math.random() * rows * cols);
    if (!mineMap[newMine]) {
      mineMap[newMine] = 1;
      iMines++;
    }
  }
  return mineMap;
};

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

const updateGameMap = (gameMap: number[], mineMap: number[], rows: number, cols: number, row: number, col: number, done: number[] = []) => {
  const p = row*cols+col;
  if (done.indexOf(p) > -1) {
    return;
  }
  done.push(p);
  if (mineMap[p]) {
    // Mine
    gameMap[p] = 11;
    return;
  }
  const res = calculateAround(row, col, mineMap, rows, cols);
  gameMap[p] = res;
  if (res == 0) {
    const execOnGameMap = (rows: number, cols: number, newRow: number, newCol: number) => {
      updateGameMap(gameMap, mineMap, rows, cols, newRow, newCol, done);
    };
    executeAround(row, col, rows, cols, execOnGameMap);
  }
};

export const reduceGameMap = (state: StateType, action: ActionType):StateType => {
  if (action.type == 'click') {
    const currentVal = state.gameMap[action.row*state.cols + action.col];
    const newState = (Object as any).assign({}, state);
    if (!currentVal) {
      if (action.which == 0) {
        updateGameMap(newState.gameMap, newState.mineMap, newState.rows, newState.cols, action.row, action.col);
      } else if (action.which == 2) {
        newState.gameMap[action.row*newState.cols + action.col] = 10;
      }
    } else if (currentVal == 10 && action.which == 2) {
      newState.gameMap[action.row*newState.cols + action.col] = undefined;
    } else if (currentVal && action.which == 1) {
      let calculatedVal = 0;
      const execCalculateVal = (rows: number, cols: number, newRow: number, newCol: number) => {
        if (newState.gameMap[newRow * cols + newCol] == 10) {
          calculatedVal++;
        }
      };
      executeAround(action.row, action.col, state.rows, state.cols, execCalculateVal);
      if (currentVal == calculatedVal) {
        const execUpdateGameMap = (rows: number, cols: number, newRow: number, newCol: number) => {
          if (typeof newState.gameMap[newRow * cols + newCol] == 'undefined') {
            updateGameMap(newState.gameMap, state.mineMap, rows, cols, newRow, newCol);
          }
        };
        executeAround(action.row, action.col, state.rows, state.cols, execUpdateGameMap);
      }
    }
    return newState;
  }
  return state;
}