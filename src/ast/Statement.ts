import { Node } from "./Node";
import { Expression } from "./Expression";

export class Statement extends Node {}

export class ReturnStatement extends Statement {
  public constructor(public expression: Expression) {
    super();
  }
}
