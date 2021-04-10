import { Expression, Statement } from "./index";

export class Block {
  public constructor(public statements: Statement[]) {}
}

export class Branch {
  public constructor() {
  }
}

export class IfBranch extends Block {
  public constructor(
    public condition: Expression,
    body: Block,
    public elseBranch: ElseBranch | Block | null = null,
  ) {
    super(body.statements);
  }
}

export class ElseBranch extends Block {
  public constructor(
    body: Block,
    public elseBranch: ElseBranch | Block | null = null,
  ) {
    super(body.statements);
  }
}
