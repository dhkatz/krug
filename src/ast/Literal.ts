import { Expression } from "./Expression";

export abstract class Literal<T> extends Expression {
  public value!: T;
  protected constructor(public token: string | T) {
    super();
  }
}

export class NumberLiteral extends Literal<number> {
  public isInteger: boolean;

  public constructor(token: string | number) {
    super(token);
    this.value = Number(token);
    this.isInteger =
      typeof token === "string"
        ? !token.includes(".")
        : Number.isInteger(token);
  }
}

export class BooleanLiteral extends Literal<boolean> {
  public constructor(token: string | boolean) {
    super(token);

    this.value = typeof token === "string" ? token === "true" : token;
  }
}
