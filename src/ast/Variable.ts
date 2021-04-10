import { Identifier, Type } from "../ast";
import { Expression } from "./index";

export class Qualifier {
  public constructor(public label: string) {
  }
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
      console.log(identifier)
      this.identifier = identifier.identifier;
      this.qualifier = identifier.qualifier;
      this.type = identifier.type;
    }
  }
}
