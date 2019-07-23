import * as React from "react";

interface BombShellProps {
    x: number;
    y: number;
    etat: number;
    onclick: (row: number, col: number, type: number) => void;
}

const cancelEvt = (evt:React.MouseEvent<HTMLDivElement>) => {
    evt.preventDefault();
}

export const BombShell:React.SFC<BombShellProps> = (props: BombShellProps) => {
    const {etat, x, y, onclick} = props;
    const style:React.CSSProperties = {};
    if (etat >= 0 && etat < 10) {
        style.borderStyle = 'inset';
        if (etat > 0 && etat < 9) {
            style.backgroundImage = 'url(static/Minesweeper_' + etat + '.svg)';
        } else if (etat == 9) {
            style.backgroundImage = 'url(static/Minesweeper_mine.png)';
        }
    } else if (etat == 10) {
        style.backgroundImage = 'url(static/Minesweeper_flag.svg)';
    }

    const shellClick = (evt:React.MouseEvent<HTMLDivElement>) => {
        evt.preventDefault();
        onclick(x, y, evt.button);
    };
    return <div className="shell" style={style} onMouseUp={shellClick} onContextMenu={cancelEvt}>&nbsp;</div>;
};