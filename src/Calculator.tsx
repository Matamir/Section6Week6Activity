import React from 'react';
import { CalculatorModel } from './CalculatorModel';
import { useState } from 'react';
import './Calculator.css';

const model = new CalculatorModel;

function CalculatorDisplay(props: {args:number}) {
  return <div className="calculator-display">{props.args}</div>;
}
function CalculatorKey(arg: any) {
  return <button className={`calculator-key ${arg.className}`}  onClick={arg.onPress}>{arg.label}</button>;         
}
export default function Calculator() {
  const [display,setDisplay] = useState(0); 
  return (
    <div className="calculator">
      <CalculatorDisplay args={display}/>
      <div className="calculator-keypad">
        <div className="input-keys">
          <div className="function-keys">
            <CalculatorKey className="key-clear" label="C" onPress={() => { model.pressClear(); setDisplay(parseInt(model.display()));}}>{'C'}</CalculatorKey>
            <CalculatorKey className="key-sign" label="±" onPress={() => { alert("key-sign pressed"); }}>±</CalculatorKey>
            <CalculatorKey className="key-percent" label="√" onPress={() => { model.pressSqrt(); setDisplay(parseInt(model.display()))}}>√</CalculatorKey>
          </div>
          <div className="digit-keys">
            <CalculatorKey className="key-0" label="0" onPress={() => { model.pressZero(); setDisplay(parseInt(model.display()));}}>0</CalculatorKey>
            <CalculatorKey className="key-dot" label="•" onPress={() => { model.pressDot(); setDisplay(parseInt(model.display()));}}>●</CalculatorKey>
            <CalculatorKey className="key-1" label="1" onPress={() => { model.pressOne(); setDisplay(parseInt(model.display())); }}>1</CalculatorKey>
            <CalculatorKey className="key-2" label="2" onPress={() => { model.pressTwo(); setDisplay(parseInt(model.display()));}}>2</CalculatorKey>
            <CalculatorKey className="key-3" label="3" onPress={() => { model.pressThree(); setDisplay(parseInt(model.display()));}}>3</CalculatorKey>
            <CalculatorKey className="key-4" label="4" onPress={() => { model.pressFour(); setDisplay(parseInt(model.display()));}}>4</CalculatorKey>
            <CalculatorKey className="key-5" label="5" onPress={() => { model.pressFive(); setDisplay(parseInt(model.display()));}}>5</CalculatorKey>
            <CalculatorKey className="key-6" label="6" onPress={() => { model.pressSix(); setDisplay(parseInt(model.display()));}}>6</CalculatorKey>
            <CalculatorKey className="key-7" label="7" onPress={() => { model.pressSeven(); setDisplay(parseInt(model.display()));}}>7</CalculatorKey>
            <CalculatorKey className="key-8" label="8" onPress={() => { model.pressEight(); setDisplay(parseInt(model.display()));}}>8</CalculatorKey>
            <CalculatorKey className="key-9" label="9" onPress={() => { model.pressNine(); setDisplay(parseInt(model.display()));}}>9</CalculatorKey>
          </div>
        </div>
        <div className="operator-keys">
          <CalculatorKey className="key-divide" label="/" onPress={() => { model.pressDiv(); }}>÷</CalculatorKey>
          <CalculatorKey className="key-multiply" label="×" onPress={() => { model.pressMult(); }}>*</CalculatorKey>
          <CalculatorKey className="key-subtract" label="-" onPress={() => { model.pressMinus(); }}>−</CalculatorKey>
          <CalculatorKey className="key-add" label="+" onPress={() => { model.pressPlus(); }}>+</CalculatorKey>
          <CalculatorKey className="key-equals" label="=" onPress={() => { model.pressEquals(); setDisplay(parseInt(model.display()));}}>=</CalculatorKey>
        </div>
      </div>
    </div>
  ) 
}