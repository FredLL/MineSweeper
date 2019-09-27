import * as React from "react";
import { BombShell } from "./BombShell";
import { reduceGameMap, initState, ActionType, Result } from "./reducer";
import { Counter, CounterAction } from "./Counter";

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
    const [state, dispatch] = React.useReducer(reduceGameMap, initState(rows, cols, nbMines, false, nonTurnedShellShowDelay));
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

    let lib = 'play';
    let counterAction: CounterAction = undefined;
    switch (state.result) {
        case Result.Bombed:
            lib = 'loose';
            counterAction = CounterAction.Stop;
            break;
        case Result.Finished:
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
                        width={side}
                        height={side}
                        etat={state.gameMap[iRow*cols + iCol]} 
                        gameState={lib}
                        longClickDelay={longClickDelay}
                        onclick={onShellClick}></BombShell>)
        }
        game.push(<div key={iRow} className="row">{row}</div>);
    }
    return <>
        <div className="top-row">
            <Counter id="mine-counter" value={state.nbFlags ? state.nbMines - state.nbFlags : state.nbMines} nbDigits={2} extendsWithValue={true} />
            <div className="result"><button className={'action action-' + lib} onClick={onRestartClick}>&nbsp;</button></div>
            <Counter id="sec-counter" nbDigits={3} extendsWithValue={true} action={counterAction} />
        </div>
        {game}
        </>;
};