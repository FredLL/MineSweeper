import * as React from "react";
import { BombShell } from "./BombShell";
import { reduceGameMap, initMines } from "./reducer";

interface GameProps {
    cols: number;
    rows: number;
    nbMines: number;
}
export const Game:React.FC<GameProps> = (props: GameProps) => {
    const {rows, cols, nbMines} = props;
    const [state, dispatch] = React.useReducer(reduceGameMap, {
        gameMap: [],
        mineMap: initMines(rows, cols, nbMines),
        rows: rows,
        cols: cols,
        nbMines: nbMines
    });
    const onShellClick = (row: number, col: number, type: number) => {
        dispatch({
            type: 'click',
            col: col,
            row: row,
            which: type
        });
    }
    
    const game: JSX.Element[] = [];
    for (let iRow = 0; iRow < rows; iRow++) {
        const row:JSX.Element[] = [];
        for (let iCol = 0; iCol < cols; iCol++) {
            row.push(<BombShell key={iRow+'-'+iCol} x={iRow} y={iCol} etat={state.gameMap[iRow*cols + iCol]} onclick={onShellClick}></BombShell>)
        }
        game.push(<div key={iRow} className="row">{row}</div>);
    }
    let nbFlags = 0;
    state.gameMap.forEach(element => {
        if (element == 10) {
            nbFlags ++;
        }
    });
    
    return <><div>{state.nbMines - nbFlags}</div>{game}</>;
};