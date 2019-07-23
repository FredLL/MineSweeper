import * as React from "react";
import { BombShell } from "./BombShell";
import { reducer, initMines } from "./reducer";
import { width, height } from "./config";

export const Game:React.FC<{}> = () => {
    const [state, dispatch] = React.useReducer(reducer, {gameMap: []});
    const onShellClick = (row: number, col: number, type: number) => {
        initMines();
        dispatch({
            type: 'click',
            col: col,
            row: row,
            which: type
        });
    }
    
    const game: JSX.Element[] = [];
    for (let iRow = 0; iRow < height; iRow++) {
        const row:JSX.Element[] = [];
        for (let iCol = 0; iCol < width; iCol++) {
            row.push(<BombShell key={iRow+'-'+iCol} x={iRow} y={iCol} etat={state.gameMap[iRow*width + iCol]} onclick={onShellClick}></BombShell>)
        }
        game.push(<div key={iRow} className="row">{row}</div>);
    }
    
    return <>{game}</>;
};