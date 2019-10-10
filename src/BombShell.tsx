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
  // states
  const [longPress, setLongPress] = React.useState(false);
  const [timer, setTimer] = React.useState(-1);
  // manage click/touch
  const shellClick = (evt: React.MouseEvent<HTMLDivElement>) => {
    evt.preventDefault();
    if (!longPress) {
      endClick(evt.button);
    }
  };
  const shellTouch = (evt: React.TouchEvent) => {
    evt.preventDefault();
    if (!longPress) {
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
    setLongPress(false);
    cancelLongClick();
    if (button == 0) {
      setTimer(window.setTimeout(()=>endClick(2, true), longClickDelay));
    }
  };
  const endClick = (button: number = 0, auto = false) => {
    setLongPress(auto);
    cancelLongClick();
    onclick(x, y, button);
  };
  // style classes
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