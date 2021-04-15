import * as ast from "../ast";

class Generator {
  [key: string]: unknown;

  public generate<T extends ast.Node | undefined>(node: T): string {
    if (node === undefined) {
      return "";
    }

    const visitor = this[node.constructor.name];

    if (typeof visitor === "function") {
      return visitor.call(this, node) as string;
    }

    throw new Error(
      `Failed to find visitor for node '${node.constructor.name}'`
    );
  }

  Program(node: ast.Program) {
    return node.statements.map((s) => this.generate(s)).join("\n");
  }

  Block(node: ast.Block) {
    return `{\n\t${node.statements.map((s) => this.generate(s)).join("\n")}\n}`;
  }

  Declaration(node: ast.Declaration) {
    const { qualifier, identifier, initializer } = node;

    return `${this.generate(qualifier)} ${this.generate(
      identifier
    )} = ${this.generate(initializer)}`;
  }

  FunctionDeclaration(node: ast.FunctionDeclaration) {
    const { identifier, body, args } = node;

    return `function ${this.generate(identifier)}(${args
      .map((a) => this.generate(a))
      .join(",")}) ${
      body instanceof ast.Block
        ? this.generate(body)
        : `{ return ${this.generate(body)} }`
    }`;
  }

  ReturnStatement(node: ast.ReturnStatement) {
    return `return ${this.generate(node.expression)}`;
  }

  Qualifier(node: ast.Qualifier) {
    return node.name;
  }

  Identifier(node: ast.Identifier) {
    return node.name;
  }

  NumberLiteral(node: ast.NumberLiteral) {
    return node.value;
  }

  Parameter(node: ast.Parameter) {
    return this.generate(node.identifier);
  }

  IfExpression(node: ast.IfExpression) {
    const { expression, statement, elseExpression } = node;

    return `if (${this.generate(expression)}) ${this.generate(statement)} ${
      elseExpression ? `else ${this.generate(elseExpression)}` : ""
    }`;
  }

  CallExpression(node: ast.CallExpression) {
    return `${this.generate(node.expression)}(${node.args
      .map((a) => this.generate(a))
      .join(",")})`;
  }

  Argument(node: ast.Argument) {
    return `${this.generate(node.expression)}`;
  }

  Logical(node: ast.Logical) {
    return `${this.generate(node.left)} ${node.operator} ${this.generate(
      node.right
    )}`;
  }

  Equality(node: ast.Logical) {
    const op = node.operator === "==" ? "===" : "!==";
    return `${this.generate(node.left)} ${op} ${this.generate(node.right)}`;
  }

  Additive(node: ast.Logical) {
    return `${this.generate(node.left)} ${node.operator} ${this.generate(
      node.right
    )}`;
  }
}

export default function generate(program: ast.Program): string {
  return new Generator().generate(program);
}
