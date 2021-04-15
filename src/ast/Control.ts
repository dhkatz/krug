import { Statement } from "./Statement";
import { Expression } from "./Expression";

export class Block extends Statement {
  public constructor(public statements: Statement[]) {
    super();
  }
}

export class IfExpression extends Expression {
  public constructor(
    public expression: Expression,
    public statement: Statement,
    public elseExpression?: Expression
  ) {
    super();
  }
}
