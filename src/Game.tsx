import * as React from "react";
import { BombShell } from "./BombShell";
import { reduceGameMap, initState, ActionType, Result } from "./reducer";
import { Counter, CounterAction } from "./Counter";

interface GameProps {
    cols: number;
    rows: number;
    nbMines: number;
    longClickDelay?: number;
}
export const Game:React.FC<GameProps> = (props) => {
    const {rows, cols, nbMines} = props;
    const [state, dispatch] = React.useReducer(reduceGameMap, initState(rows, cols, nbMines));
    const longClickDelay = props.longClickDelay?props.longClickDelay:600;
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

    const side = 'calc(' + (100/rows) + 'vmin - ' + (10/rows) + 'rem)';

    const game: JSX.Element[] = [];
    for (let iRow = 0; iRow < rows; iRow++) {
        const row:JSX.Element[] = [];
        for (let iCol = 0; iCol < cols; iCol++) {
            row.push(<BombShell key={iRow+'-'+iCol} 
                        x={iRow} 
                        y={iCol} 
                        width={side}
                        height={side}
                        etat={state.gameMap[iRow*cols + iCol]} 
                        longClickDelay={longClickDelay}
                        onclick={onShellClick}></BombShell>)
        }
        game.push(<div key={iRow} className="row">{row}</div>);
    }
    let lib = 'En cours';
    let counterAction: CounterAction = undefined;
    switch (state.result) {
        case Result.Bombed:
            lib = 'Perdu';
            counterAction = CounterAction.Stop;
            break;
        case Result.Finished:
            counterAction = CounterAction.Stop;
            lib = 'Gagné';
            break;
        case Result.WiP:
            counterAction = CounterAction.Start;
            break;
    }
    return <>
        <div className="top-row">
            <Counter value={state.nbFlags ? state.nbMines - state.nbFlags : state.nbMines} nbDigits={2} extendsWithValue={true} />
            <div className="result"><button onClick={onRestartClick}>{lib}</button></div>
            <Counter nbDigits={3} extendsWithValue={true} action={counterAction} />
        </div>
        {game}
        </>;
};