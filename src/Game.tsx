import * as React from "react";
import { BombShell } from "./BombShell";
import { reduceGameMap, initState, ActionType, Result } from "./reducer";

interface GameProps {
    cols: number;
    rows: number;
    nbMines: number;
}
export const Game:React.FC<GameProps> = (props: GameProps) => {
    const {rows, cols, nbMines} = props;
    const [state, dispatch] = React.useReducer(reduceGameMap, initState(rows, cols, nbMines));

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
    }
    const onRestartClick = () => {
        dispatch({
            type: 'restart'
        });
    }

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
                        onclick={onShellClick}></BombShell>)
        }
        game.push(<div key={iRow} className="row">{row}</div>);
    }
    let lib = 'En cours';
    switch (state.result) {
        case Result.Bombed:
            window.clearInterval(state.timer);
            lib = 'Perdu';
            break;
        case Result.Finished:
            window.clearInterval(state.timer);
            lib = 'Gagné';
            break;
    }
    return <>
        <div className="top-row">
            <div className="nb-mines">{state.nbFlags ? state.nbMines - state.nbFlags : state.nbMines}</div>
            <div className="result"><button onClick={onRestartClick}>{lib}</button></div>
            <div id="timer" className="timer"></div>
        </div>
        {game}
        </>;
};