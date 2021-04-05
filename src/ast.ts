export class Program {
  public constructor(public statements: Statement[]) {}
}

export type Statement = Assignment | Declaration | Branch;

export class Identifier {
  public constructor(public name: string) {}
}

export class Type {
  public constructor(public name: string) {}
}

export class Argument {
  public constructor(public identifier: Identifier, public type: Type) {}
}

export class Declaration {
  public constructor(
    public qualifier: string,
    public identifier: Identifier,
    public type: Type
  ) {}
}

export class Assignment {
  public qualifier?: string;
  public identifier: Identifier;
  public type?: Type;

  public constructor(declaration: Declaration, initializer: Expression);
  public constructor(identifier: Identifier, initializer: Expression);
  public constructor(
    identifier: Identifier | Declaration,
    public initializer: Expression
  ) {
    if (identifier instanceof Identifier) {
      this.identifier = identifier;
    } else {
      this.identifier = identifier.identifier;
      this.qualifier = identifier.qualifier;
      this.type = identifier.type;
    }
  }
}

export class Function {
  public constructor(
    public identifier: Identifier,
    public args: Argument[],
    public type: Type,
    public body: Block
  ) {}
}

export class Block {
  public constructor(public statements: Statement[]) {}
}

export type Expression = BinaryExpression | UnaryExpression | Call;

export class BinaryExpression {
  public constructor(
    public left: Expression,
    public operator: string,
    public right: Expression
  ) {}
}

export class Disjunction extends BinaryExpression {}
export class Conjunction extends BinaryExpression {}
export class Equality extends BinaryExpression {}
export class Comparison extends BinaryExpression {}
export class Additive extends BinaryExpression {}
export class Multiplicative extends BinaryExpression {}

export class UnaryExpression {
  public constructor(public operator: string, public operand: Expression) {}
}

export class Call {
  public constructor(
    public expression: Expression,
    public args: Expression[]
  ) {}
}

export type Branch = IfBranch | ElseBranch;

export class IfBranch extends Block {
  public constructor(
    body: Block,
    public elseBranch: ElseBranch | Block | null,
    public expression: typeof elseBranch extends ElseBranch ? Expression : null
  ) {
    super(body.statements);
  }
}

export class ElseBranch extends IfBranch {
  public constructor(
    body: Block,
    elseBranch: ElseBranch | Block | null,
    expression: typeof ElseBranch extends ElseBranch ? Expression : null
  ) {
    super(body, elseBranch, expression);
  }
}
