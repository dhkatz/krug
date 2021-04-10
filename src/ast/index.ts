import { Assignment, Declaration } from "./Variable";
import { Block, Branch } from "./Branch";
import { Operator } from "./Operator";
import { Function } from "./Function";

export * from "./Branch";
export * from "./Function";
export * from "./Operator";
export * from "./Variable";

export type Expression = Operator;

export class Program {
  public constructor(public statements: Statement[]) {}
}

export type Statement =
  | Assignment
  | Declaration
  | Function
  | Block
  | Expression
  | Branch;

export class Identifier {
  public constructor(public name: string) {}
}

export class Type {
  public constructor(public name: string) {}
}
