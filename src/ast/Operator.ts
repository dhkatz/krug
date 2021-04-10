import { Expression } from "./index";

export type Operator = BinaryOperator | UnaryOperator | CallOperator;

// Binary

export class BinaryOperator {
  public constructor(
    public left: Expression,
    public operator: string,
    public right: Expression
  ) {}
}

export class Disjunction extends BinaryOperator {}
export class Conjunction extends BinaryOperator {}
export class Equality extends BinaryOperator {}
export class Comparison extends BinaryOperator {}
export class Additive extends BinaryOperator {}
export class Multiplicative extends BinaryOperator {}

// Unary

export class UnaryOperator {
  public constructor(public operator: string, public operand: Expression) {}
}

// Call

export class CallOperator {
  public constructor(
    public expression: Expression,
    public args: Expression[]
  ) {}
}
