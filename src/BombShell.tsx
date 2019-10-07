import * as React from "react";

interface BombShellProps {
    x: number;
    y: number;
    width: string;
    height: string;
    etat: number;
    gameState: string;
    longClickDelay: number;
    onclick: (row: number, col: number, type: number) => void;
}

const cancelEvt = (evt: React.MouseEvent<HTMLDivElement>) => {
    evt.preventDefault();
};

export const BombShell:React.FC<BombShellProps> = (props) => {
    const {etat, gameState, x, y, width, height, longClickDelay, onclick} = props;
    // manage click/touch
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
    };
    const cancelLongClick = () => {
        window.clearTimeout(timer);
    };
    const initClick = (button: number = 0) => {
        state.longPress = false;
        window.clearTimeout(timer);
        if (button == 0) {
            timer = window.setTimeout(()=>endClick(2, true), longClickDelay);
        }
    };
    const endClick = (button: number = 0, auto = false) => {
        state.longPress = auto;
        window.clearTimeout(timer);
        onclick(x, y, button);
    };
    // 
    const classes = ['shell', 'shell-' + gameState];
    if (typeof etat !== 'undefined') {
        classes.push('shell-' + etat, 'shell-id');
    }
    return <div className={classes.join(' ')} 
        style={{width: width, height: height}}
        onMouseDown={initLongClick} 
        onMouseUp={shellClick} 
        onMouseLeave={cancelLongClick}
        onTouchStart={initTouch} 
        onTouchEnd={shellTouch} 
        onDoubleClick={shellClick}
        onContextMenu={cancelEvt}>&nbsp;</div>;
};