import { throws } from "assert";

enum Operator {
  Plus,
  Minus,
  Mult,
  Div
}

// abstract class for the state hierarchy. 
interface ICalculatorState {  
  digit(digit: string) : void;
  decimalSeparator() : void;
  binaryOperator(calc: CalculatorModel, operator: Operator) : void;
  equals(calc: CalculatorModel) : void;
  clear(calc: CalculatorModel) : void;
  sqrt(calc: CalculatorModel) : void;
  display() : string
}

class EnteringFirstNumberState implements ICalculatorState {
  constructor(private buffer: string){ }
  digit(digit: string): void {
    this.buffer = (this.buffer === '0' && digit !== '0') ? digit : this.buffer + digit; 
  }
  decimalSeparator(): void {
    if (this.buffer.indexOf('.') === -1){ // ignore if the number already has a decimal separator
      this.buffer = this.buffer + '.';
    } 
  }
  binaryOperator(calc: CalculatorModel, operator: Operator): void {
    calc.changeState(new EnteringSecondNumberState(this.buffer === '' ? '0' : this.buffer, '', operator));
  }
  equals(): void { /* pressing equals after entering one number has no effect */ }
  clear(): void { this.buffer = '0'; }
  sqrt(calc: CalculatorModel): void {
    const firstNumber = parseFloat(this.buffer === '' ? '0' : this.buffer);
    calc.changeState(new EnteringFirstNumberState((Math.sqrt(firstNumber).toString())))
  }  display(){ return this.buffer !== '' ? this.buffer : '0'; }
}

class EnteringSecondNumberState implements ICalculatorState {
  constructor(private firstBuffer: string, private secondBuffer: string, 
              private firstOperator: Operator){ }
  digit(digit: string): void {
    this.secondBuffer = (this.secondBuffer === '0' && digit !== '0') ? digit : this.secondBuffer + digit; 
  }
  decimalSeparator(): void {
    if (this.secondBuffer.indexOf('.') === -1){ // ignore if the number already has a decimal separator
      this.secondBuffer = this.secondBuffer + '.';
    } 
  }
  binaryOperator(calc: CalculatorModel, operator: Operator): void {
    const firstNumber = parseFloat(this.firstBuffer === '' ? '0' : this.firstBuffer);
    const secondNumber = parseFloat(this.secondBuffer === '' ? '0' : this.secondBuffer);
    switch (operator){
      case Operator.Plus:   // in case of + or - after having entered two numbers, apply the first operator and stay in this state
      case Operator.Minus:  // (or go to ErrorState in case of division by zero)
        if (this.firstOperator === Operator.Plus){
          this.firstBuffer = (firstNumber + secondNumber).toString()
        } else if (this.firstOperator === Operator.Minus){
          this.firstBuffer = (firstNumber - secondNumber).toString()
        } else if (this.firstOperator === Operator.Mult){
          this.firstBuffer = (firstNumber * secondNumber).toString()
        } else if (secondNumber !== 0){ // (this.firstOperator === Operator.Div){
          this.firstBuffer = (firstNumber / secondNumber).toString()
        } else {
          calc.changeState(new ErrorState());
        }
        this.secondBuffer = '';
        this.firstOperator = operator;
        break;
    case Operator.Div: // if we press * or / after having entered two numbers
    case Operator.Mult:
      if (this.firstOperator === Operator.Mult){ // If the first operator was *, apply it
        this.firstBuffer = (firstNumber * secondNumber).toString();
        this.secondBuffer = '';
        this.firstOperator = operator;
      } else if (this.firstOperator === Operator.Div){ // If the first operator was /, apply it 
        if (secondNumber === 0){ // check for div by zero
          calc.changeState(new ErrorState());
        } else {
          this.firstBuffer = (firstNumber / secondNumber).toString();
          this.secondBuffer = '';
          this.firstOperator = operator;
        }
      } else { // If the first operator was + or -, transition to EnteringThirdNumberState
        calc.changeState(new EnteringThirdNumberState(this.firstBuffer, this.secondBuffer, '', this.firstOperator, operator));
      }
    }
  }
  equals(calc: CalculatorModel): void {
    const firstNumber = parseFloat(this.firstBuffer === '' ? '0' : this.firstBuffer);
    const secondNumber = parseFloat(this.secondBuffer === '' ? '0' : this.secondBuffer);
    if (this.firstOperator === Operator.Plus){
      calc.changeState(new EnteringFirstNumberState((firstNumber + secondNumber).toString()));
    } else if (this.firstOperator === Operator.Minus){
      calc.changeState(new EnteringFirstNumberState((firstNumber - secondNumber).toString()));
    } else if (this.firstOperator === Operator.Mult){
      calc.changeState(new EnteringFirstNumberState((firstNumber * secondNumber).toString()));
    } else if (secondNumber !== 0){  // this.firstOperator === Operator.Div
      calc.changeState(new EnteringFirstNumberState((firstNumber / secondNumber).toString()));
    } else {
      calc.changeState(new ErrorState());
    }
  }
  clear(calc: CalculatorModel): void {
    calc.changeState(new EnteringFirstNumberState('0'));
  }
  sqrt(calc: CalculatorModel): void {
    const firstNumber = parseFloat(this.firstBuffer === '' ? '0' : this.firstBuffer);
    calc.changeState(new EnteringFirstNumberState((Math.sqrt(firstNumber).toString())))
  }  
  display(){ 
    return (this.secondBuffer !== '') ? this.secondBuffer : this.firstBuffer; 
  }
}

// invariant: firstOperator is Plus or Minus and secondOperator is Div or Mul
class EnteringThirdNumberState implements ICalculatorState {
  constructor(private firstBuffer: string, private secondBuffer: string, private thirdBuffer: string, 
              private firstOperator: Operator, private secondOperator: Operator){  }
  digit(digit: string): void {
    this.thirdBuffer = (this.thirdBuffer === '0' && digit !== '0') ? digit : this.thirdBuffer + digit; 
  }
  decimalSeparator(): void { 
    if (this.thirdBuffer.indexOf('.') === -1){ // ignore if the number already has a decimal separator
      this.thirdBuffer = this.thirdBuffer + '.';
    }
  }
  binaryOperator(calc: CalculatorModel, operator: Operator): void { // evaluate the entire expression and transition to EnteringSecondNumberState 
                                             // (or ErrorState in case of division by zero)
    const firstNumber = parseFloat(this.firstBuffer === '' ? '0' : this.firstBuffer);
    const secondNumber = parseFloat(this.secondBuffer === '' ? '0' : this.secondBuffer);
    const thirdNumber = parseFloat(this.thirdBuffer === '' ? '0' : this.thirdBuffer);
    if (operator === Operator.Mult){
      const result = secondNumber*thirdNumber;
      this.secondBuffer = result.toString();
      this.thirdBuffer = '';
    } else if (this.secondOperator === Operator.Div){
      if (thirdNumber === 0){
        calc.changeState(new ErrorState());
      } else {
        const result = secondNumber/thirdNumber;
        this.secondBuffer = result.toString();
        this.thirdBuffer = '';
      } 
    } else if (operator === Operator.Plus || operator === Operator.Minus) {  
      if (this.secondOperator === Operator.Mult){
        let result = secondNumber*thirdNumber;
        if (this.firstOperator === Operator.Plus){
          result = firstNumber + result;
        } else { // (this.firstOperator === Operator.Minus)
          result = firstNumber - result;
        }
        calc.changeState(new EnteringSecondNumberState(result.toString(), '', operator));
      } else { // (this.secondOperator === Operator.Div)
        if (thirdNumber !== 0) {
          let result = secondNumber/thirdNumber;
          if (this.firstOperator === Operator.Plus){
            result = firstNumber + result;
          } else { // (this.firstOperator === Operator.Minus)
            result = firstNumber - result;
          }
          calc.changeState(new EnteringSecondNumberState(result.toString(), '', operator));
        } else {
          calc.changeState(new ErrorState());
        }
      } 
    }  
  }
  equals(calc: CalculatorModel): void { // evaluate the entire expression and transition to EnteringFirstNumberState
                                        // (or ErrorState in case of division by zero)
    const firstNumber = parseFloat(this.firstBuffer === '' ? '0' : this.firstBuffer);
    const secondNumber = parseFloat(this.secondBuffer === '' ? '0' : this.secondBuffer);
    const thirdNumber = parseFloat(this.thirdBuffer === '' ? '0' : this.thirdBuffer);
    let result;
    if (this.secondOperator === Operator.Mult){
      result = secondNumber*thirdNumber;
    } else { // (this.secondOperator === Operator.Div)
      if (thirdNumber === 0){
        calc.changeState(new ErrorState());
        return;
      } else {
        result = secondNumber/thirdNumber;
      }
    }
    if (this.firstOperator === Operator.Plus){
      calc.changeState(new EnteringFirstNumberState((firstNumber+result).toString()));
    } else { // (this.firstOperator === Operator.Minus)
      calc.changeState(new EnteringFirstNumberState((firstNumber-result).toString()));
    }
  }
  clear(calc: CalculatorModel): void {
    calc.changeState(new EnteringFirstNumberState('0'));
  }
  sqrt(calc: CalculatorModel): void {
    const firstNumber = parseFloat(this.firstBuffer === '' ? '0' : this.firstBuffer);
    calc.changeState(new EnteringFirstNumberState((Math.sqrt(firstNumber).toString())))
  }
  display(){ 
    return (this.thirdBuffer !== '') ? this.thirdBuffer : (this.secondBuffer !== '' ? this.secondBuffer :'0'); 
  }
}
// in the ErrorState, pressing "C" will reset the calculator to its original state; other keys have no effect
class ErrorState implements ICalculatorState {
  digit(digit: string): void { /* nothing */ }
  decimalSeparator(): void { /* nothing */ }
  binaryOperator(calc: CalculatorModel, operator: Operator): void { /* nothing */ }
  equals(): void { /* nothing */ }
  clear(calc: CalculatorModel): void { calc.changeState(new EnteringFirstNumberState('0')); }
  sqrt(calc: CalculatorModel): void { /* nothing */ }
  display(){ return 'ERR'; }
}  

export class CalculatorModel {
  private state: ICalculatorState
  constructor(){ this.state = new EnteringFirstNumberState(''); }
  
  changeState(state: ICalculatorState){ this.state = state; }
  
  // numeric buttons 
  public pressZero() : void { this.state.digit('0'); }
  public pressOne() : void { this.state.digit('1'); }
  public pressTwo() : void { this.state.digit('2'); }
  public pressThree() : void { this.state.digit('3'); }
  public pressFour() : void { this.state.digit('4'); }
  public pressFive() : void { this.state.digit('5'); }
  public pressSix() : void { this.state.digit('6'); }
  public pressSeven() : void { this.state.digit('7'); }
  public pressEight() : void { this.state.digit('8'); }
  public pressNine() : void { this.state.digit('9'); }

  // ".", "=", and "C" buttons
  public pressDot() : void { this.state.decimalSeparator(); }
  public pressEquals() : void { this.state.equals(this); }  
  public pressClear() : void { this.state.clear(this); } 
   
  // operator buttons
  public pressPlus() : void { this.state.binaryOperator(this, Operator.Plus); }
  public pressMinus() : void { this.state.binaryOperator(this, Operator.Minus); }
  public pressMult() : void { this.state.binaryOperator(this, Operator.Mult); }
  public pressDiv() : void { this.state.binaryOperator(this, Operator.Div); }
  

  public pressSqrt() : void { this.state.sqrt(this) }

  // returns the contents of the calculator's display
  public display() : string { return this.state.display(); }
}