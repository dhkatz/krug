import { Block, Identifier, Type } from "../ast";
import { Expression } from "./Expression";
import { Statement } from "./Statement";
import { Node } from "./Node";

export class Qualifier extends Node {
  public constructor(public name: string) {
    super();
  }
}

export class Declaration extends Statement {
  public constructor(
    public qualifier: Qualifier,
    public identifier: Identifier,
    public type: Type,
    public initializer?: Expression
  ) {
    super();
  }
}

export class Parameter {
  public constructor(public identifier: Identifier, public type: Type) {}
}

export class FunctionDeclaration {
  public constructor(
    public identifier: Identifier,
    public args: Parameter[],
    public type: Type,
    public body: Block | Expression
  ) {}
}

export class OperatorDeclaration extends Statement {
  public constructor(
    public operator: string,
    public args: Parameter[],
    public body: Block | Expression
  ) {
    super();
  }
}

export class ClassDeclaration extends Statement {
  public constructor(
    public identifier: Identifier,
    public declarations: (Declaration | FunctionDeclaration)[]
  ) {
    super();
  }
}
