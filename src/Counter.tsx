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
  extendsWithValue?: boolean;
  action?: CounterAction;
  interval?: number;
}

const counterTimers: Map<string, number> = new Map();

export const Counter:React.FC<CounterProps> = (props) => {
  const {id, extendsWithValue, action} = props;
  let {value, nbDigits, interval} = props;
  // states
  const [counterAction, setCounterAction] = React.useState(undefined as CounterAction);
  const [counterValue, setCounterValue] = React.useState(undefined as number);
  // default values
  if (typeof value === 'undefined') {
    value = counterValue;
    if (typeof value === 'undefined') {
      value = 0;
    }
  }
  if (!nbDigits || extendsWithValue) {
    if (!nbDigits) {
      nbDigits = 1;
    }
    while (value / Math.pow(10, nbDigits) > 1) {
      nbDigits++;
    }
  }
  if (typeof action !== 'undefined' && action != counterAction) {
    setCounterAction(action);
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
          counterTimers.set(id, window.setInterval(() => setCounterValue(Math.floor((new Date().getTime() - startTime) / interval)), interval));
          setCounterValue(0);
          break;
        }  
        case CounterAction.Restart:
          setCounterValue(0);
        case CounterAction.Stop:
        {
          const counterTimer = counterTimers.get(id);
          if (counterTimer) {
            window.clearInterval(counterTimer);
            counterTimers.delete(id);
          }
        }
        break;
      }
  }
  const digitElts: React.ReactNode[] = [];
  for (let i = 1; i <= nbDigits; i++) {
    digitElts.push(<div key={'CounterDigit-' + i} className={'counter-digit counter-digit-' + (value % 10)}>&nbsp;</div>);
    value = Math.floor(value / 10);
  }

  return <div className="counter">{digitElts.reverse()}</div>;
}