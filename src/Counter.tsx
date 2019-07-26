import * as React from "react";

export enum CounterAction {
    Start,
    Stop
}

interface CounterProps {
    id?: string;
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
    currentValue?: number;
}

let counterTimer: number = undefined;

export const Counter:React.FC<CounterProps> = (props) => {
    let {value, nbDigits, digitHeight, digitWidth, extendsWithValue, action, interval} = props;
    const [state, setCounterState] = React.useState<CounterState>({});
    if (typeof value === 'undefined') {
        value = state.currentValue;
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
    if (typeof action !== 'undefined' && action != state.action) {
        switch (action) {
            case CounterAction.Start:
                if (!interval) {
                    interval = 1000;
                }
                const startTime = new Date().getTime();
                counterTimer = window.setInterval(() => setCounterState({action: action, currentValue: Math.floor((new Date().getTime() - startTime) / interval)}), interval);
                setCounterState({
                    action: CounterAction.Start,
                    currentValue: 0
                });
                break;
            case CounterAction.Stop:
                window.clearInterval(counterTimer);
                counterTimer = undefined;
                setCounterState({
                    action: CounterAction.Stop,
                    currentValue: state.currentValue
                });
                break;
        }
    }
    const digitElts: React.ReactElement[] = [];
    for (let i = 1; i <= nbDigits; i++) {
        digitElts.push(<div key={'CounterDigit-' + i} className={'counter-digit counter-digit-' + (value % Math.pow(10, i))}>&nbsp;</div>);
        value = Math.floor(value / 10);
    }

    return <div className="counter">{digitElts.reverse()}</div>;
}