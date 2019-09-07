import * as React from "react";

export enum CounterAction {
    Start,
    Stop,
    Restart
}

interface CounterProps {
    id: string;
    value?: number;
    nbDigits?: number;
    digitWidth?: number|string;
    digitHeight?: number|string;
    extendsWithValue?: boolean;
    action?: CounterAction;
    interval?: number;
}

interface CounterState {
    action?: CounterAction;
    value?: number;
}
const counterTimers: Map<string, number> = new Map();

export const Counter:React.FC<CounterProps> = (props) => {
    let {id, value, nbDigits, digitHeight, digitWidth, extendsWithValue, action, interval} = props;
    const [counterState, setCounterState] = React.useState({} as CounterState);
    if (typeof value === 'undefined') {
        value = counterState.value;
    }
    if (typeof value === 'undefined') {
        value = 0;
    }
    if (!nbDigits || extendsWithValue) {
        if (!nbDigits) {
            nbDigits = 1;
        }
        while (value / Math.pow(10, nbDigits) > 1) {
            nbDigits++;
        }
    }
    if (typeof action !== 'undefined' && action != counterState.action) {
        switch (action) {
            case CounterAction.Start:
              {  
                if (!interval) {
                    interval = 1000;
                }
                const startTime = new Date().getTime();
                const counterTimer = counterTimers.get(id);
                if (counterTimer) {
                    window.clearInterval(counterTimer);
                }
                counterTimers.set(id, window.setInterval(() => setCounterState({action: action, value: Math.floor((new Date().getTime() - startTime) / interval)}), interval));
                setCounterState({
                    action: action,
                    value: 0
                });
                break;
              }  
            case CounterAction.Restart:
            case CounterAction.Stop:
              {
                const counterTimer = counterTimers.get(id);
                if (counterTimer) {
                  window.clearInterval(counterTimer);
                  counterTimers.delete(id);
                }    
                setCounterState({
                    action: action,
                    value: action == CounterAction.Stop? counterState.value: 0
                });
                break;
              }  
        }
    }
    const digitElts: React.ReactElement[] = [];
    for (let i = 1; i <= nbDigits; i++) {
        digitElts.push(<div key={'CounterDigit-' + i} className={'counter-digit counter-digit-' + (value % 10)}>&nbsp;</div>);
        value = Math.floor(value / 10);
    }

    return <div className="counter">{digitElts.reverse()}</div>;
}