import { width, nbMines, height } from "./config";

interface ActionType {
  type: 'click',
  col: number,
  row: number,
  which: number
}

export interface StateType {
    gameMap: number[]
}

const MineMap:number[] = [];

export const initMines = () => {
    if (!MineMap.length) {
        console.info('calculating mines field');
        let iMines = 0;
        while (iMines < nbMines) {
            const newMine = Math.round(Math.random() * width * height);
            if (!MineMap[newMine]) {
                MineMap[newMine] = 1;
                iMines++;
            }
        }
    }
};

const calculateAround = (x:number, y:number):number => {
    const p = x*width+y;
    if (MineMap[p]) {
        // Mine
        return -1;
    }
    const baseCol:number[] = [];
    [-1, 0, 1].forEach(i => {
        if (i == 0 || Math.floor((p + i) / width) == Math.floor(p / width)) {
            baseCol.push(i);
        }
    });
    const baseRow:number[] = [];
    [-1, 0, 1].forEach(i => {
        if (i == 0) {
            baseRow.push(i);
        } else {
            const nextLine = p + i * width;
            if (nextLine >= 0 && nextLine < height * width) {
                baseRow.push(i);
            }
        }
    });
    let res = 0;
    baseRow.forEach(valx => {
        baseCol.forEach(valy => {
            if (Math.floor((p + valy) / height) == Math.floor(p / height)) {
                const np = p + (valx*width+valy);
                if (np >= 0 && np < width*height) {
                    res += MineMap[np]?1:0;
                }
            }
        });
    });
    return res;
}

const updateGameMap = (gameMap: number[], row: number, col: number, done: number[] = []) => {
  if (done.indexOf(row*width+col) > -1) {
    return;
  }
  done.push(row*width+col);
  const res = calculateAround(row, col);
  if (res >= 0) {
    gameMap[row*width + col] = res;
    if (res == 0) {
      const baseDelta = [-1, 0, 1];
      baseDelta.forEach(deltaCol => {
        baseDelta.forEach(deltaRow => {
          if (!(deltaCol == 0 && deltaRow == 0) && row + deltaRow >=0 && row + deltaRow < height && col + deltaCol >=0 && col + deltaCol < width) {
            updateGameMap(gameMap, row+deltaRow, col+deltaCol, done);
          }
        });
      });
    }
  } else {
    gameMap[row*width + col] = 9;
  }
};

export const reducer = (state: StateType, action: ActionType):StateType => {
  if (action.type == 'click') {
    const currentVal = state.gameMap[action.row*width + action.col];
    const newState = (Object as any).assign({}, state);
    if (!currentVal) {
      if (action.which == 0) {
        updateGameMap(newState.gameMap, action.row, action.col);
      } else if (action.which == 2) {
        newState.gameMap[action.row*width + action.col] = 10;
      }
    } else if (currentVal == 10 && action.which == 2) {
      newState.gameMap[action.row*width + action.col] = 0;
    }
    return newState;
  }
  return state;
}