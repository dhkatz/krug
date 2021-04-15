// Binary

import { Expression } from "./Expression";

export class BinaryExpression extends Expression {
  public constructor(
    public left: Expression,
    public operator: string,
    public right: Expression
  ) {
    super();
  }
}

export class Logical extends BinaryExpression {}
export class Equality extends BinaryExpression {}
export class Relational extends BinaryExpression {}
export class Additive extends BinaryExpression {}
export class Multiplicative extends BinaryExpression {}

export class Assignment extends Expression {
  public constructor(
    public ref: Expression,
    public operator: string,
    public exp: Expression
  ) {
    super();
  }
}

// Unary

export class UnaryExpression extends Expression {
  public constructor(public operator: string, public operand: Expression) {
    super();
  }
}

// Call

export class Argument extends Expression {
  public constructor(public expression: Expression) {
    super();
  }
}

export class CallExpression extends Expression {
  public constructor(public expression: Expression, public args: Argument[]) {
    super();
  }
}
