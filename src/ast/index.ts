import { Statement } from "./Statement";
import { Node } from "./Node";

export * from "./Control";
export * from "./Operator";
export * from "./Declaration";
export * from "./Literal";
export * from "./Node";
export * from "./Statement";

export class Program extends Node {
  public constructor(public statements: Statement[]) {
    super();
  }
}

export class Identifier extends Node {
  public constructor(public name: string) {
    super();
  }
}

export class Type extends Node {
  public constructor(public name: string) {
    super();
  }
}
