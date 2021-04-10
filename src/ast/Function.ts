import { Block, Identifier, Type } from "./index";

export class Argument {
  public constructor(public identifier: Identifier, public type: Type) {}
}

export class Function {
  public constructor(
    public identifier: Identifier,
    public args: Argument[],
    public type: Type,
    public body: Block
  ) {}
}
