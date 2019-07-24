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
    const shellClick = (evt:React.MouseEvent<HTMLDivElement>) => {
        evt.preventDefault();
        onclick(x, y, evt.button);
    };
    return <div className={'shell shell-' + etat} onMouseUp={shellClick} onContextMenu={cancelEvt}>&nbsp;</div>;
};