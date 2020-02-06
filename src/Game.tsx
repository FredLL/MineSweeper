import * as React from "react";
import { BombShell } from "./BombShell";
import { reduceGameMap, initState, ActionType, Result } from "./reducer";
import { Counter, CounterAction } from "./Counter";
import { BestButton } from "./BestButton";
import { saveResult } from "./LocalStorage";

interface GameProps {
  cols: number;
  rows: number;
  nbMines: number;
  longClickDelay?: number;
  nonTurnedShellShowDelay?: number;
}
export const Game:React.FC<GameProps> = (props) => {
  const {rows, cols, nbMines} = props;
  const nonTurnedShellShowDelay = props.nonTurnedShellShowDelay?props.nonTurnedShellShowDelay:10000;
  const longClickDelay = props.longClickDelay?props.longClickDelay:600;
  const [state, dispatch] = React.useReducer(reduceGameMap, initState(rows, cols, nbMines, false, nonTurnedShellShowDelay));
  const [result, setResult] = React.useState({time: 0, win: false});
  const modalRef = React.useRef<HTMLDivElement>(null);

  const onShellClick = (row: number, col: number, type: number) => {
    if (state.result == Result.Bombed) {
      return;
    }
    dispatch({
      type: 'click',
      col: col,
      row: row,
      which: type
    } as ActionType);
  };
  const onRestartClick = () => {
    dispatch({
      type: 'restart'
    });
  };
  const hideModal = () => {
    modalRef.current.style.display = 'none';
    saveResult(result.time, cols+'*'+rows+'/'+nbMines, 'Fred');
    setResult({win: false, time: 0});
  }
  let win = false;
  const getCounterValue = (action: CounterAction, value: number) => {
    if (win && action == CounterAction.Stop) {
      setResult({win: win, time: value});
    }
  }

  if (result.win) {
    modalRef.current.style.display = 'block';
  }

  const side = '' + (100/rows) + 'vmin - ' + (10/rows) + 'rem';
  const shellSide = getCalc(side);

  let lib = 'play';
  let counterAction: CounterAction = undefined;
  switch (state.result) {
    case Result.Bombed:
      lib = 'loose';
      counterAction = CounterAction.Stop;
      break;
    case Result.Finished:
      win = true;
      counterAction = CounterAction.Stop;
      lib = 'win';
      break;
    case Result.WiP:
      counterAction = CounterAction.Start;
      break;
    case Result.Restart:
      counterAction = CounterAction.Restart;
      break;
  }
  const game: React.ReactNode[] = [];
  for (let iRow = 0; iRow < rows; iRow++) {
    const row: React.ReactNode[] = [];
    for (let iCol = 0; iCol < cols; iCol++) {
      row.push(<BombShell key={iRow+'-'+iCol} 
                        x={iRow} 
                        y={iCol} 
                        width={shellSide}
                        height={shellSide}
                        etat={state.gameMap[iRow*cols + iCol]} 
                        gameState={lib}
                        longClickDelay={longClickDelay}
                        onclick={onShellClick}></BombShell>)
    }
    game.push(<div key={iRow} className="row">{row}</div>);
  }
  return <>
    <div className="top-row" style={{width: getCalc(cols+'*('+side+'+0.4rem)')}}>
      <Counter id="mine-counter" value={state.nbFlags ? state.nbMines - state.nbFlags : state.nbMines} nbDigits={2} extendsWithValue={true} />
      <div className="result"><button className={'action action-' + lib} onClick={onRestartClick}>&nbsp;</button></div>
      <Counter id="sec-counter" nbDigits={3} extendsWithValue={true} action={counterAction} callback={getCounterValue} />
      <BestButton mode={cols+'*'+rows+'/'+nbMines}/>
    </div>
    {game}
    <div ref={modalRef} className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <span className="close" onClick={hideModal}>&times;</span>
          <h2>Well done!</h2>
        </div>
        <div className="modal-body">
          <p>You won in {result.time} seconds on a {cols + '*' + rows + '/' + nbMines}</p>
        </div>
      </div>
    </div>
  </>;
};
const getCalc= (content: string) => 'calc('+content+')';