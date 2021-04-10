export abstract class Literal<T> {
  public value!: T
  protected constructor(public raw: string) {}
}

export class NumberLiteral extends Literal<number> {
  public constructor(raw: string) {
    super(raw)
    this.value = Number(raw)
  }
}

export class BooleanLiteral extends Literal<boolean> {
  public constructor(raw: string) {
    super(raw);

    this.value = raw === "true";
  }
}
