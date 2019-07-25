import * as React from "react";

interface BombShellProps {
    x: number;
    y: number;
    etat: number;
    onclick: (row: number, col: number, type: number) => void;
}

const cancelEvt = (evt: React.MouseEvent<HTMLDivElement>) => {
    evt.preventDefault();
};

export const BombShell:React.FC<BombShellProps> = (props: BombShellProps) => {
    const {etat, x, y, onclick} = props;
    let timer = -1;
    const [state] = React.useState({longPress: false});
    const shellClick = (evt: React.MouseEvent<HTMLDivElement>) => {
        evt.preventDefault();
        if (!state.longPress) {
            endClick(evt.button);
        }
    };
    const shellTouch = (evt: React.TouchEvent) => {
        evt.preventDefault();
        if (!state.longPress) {
            endClick();
        }
    };
    const initLongClick = (evt: React.MouseEvent<HTMLDivElement>) => {
        evt.preventDefault();
        initClick(evt.button);
    };
    const initTouch = (evt: React.TouchEvent) => {
        initClick();
    }
    const initClick = (button: number = 0) => {
        state.longPress = false;
        window.clearTimeout(timer);
        if (button == 0) {
            timer = window.setTimeout(()=>endClick(2, true), 1000);
        }
    }
    const endClick = (button: number = 0, auto = false) => {
        state.longPress = auto;
        window.clearTimeout(timer);
        onclick(x, y, button);
    };
    const classes = ['shell'];
    if (typeof etat !== 'undefined') {
        classes.push('shell-' + etat);
    }
    return <div className={classes.join(' ')} 
        onMouseDown={initLongClick} 
        onMouseUp={shellClick} 
        onTouchStart={initTouch} 
        onTouchEnd={shellTouch} 
        onContextMenu={cancelEvt}>&nbsp;</div>;
};