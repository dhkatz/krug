import * as ast from "../ast";

/**
 * typedef struct Foo {
    int a;
    int b;

    int (*Foo__add)(void* this);
} Foo;

 Foo Foo__init(int x, int y) {
    Foo foo = { .a = x, .b = y };

    return foo;
}

 Foo Foo__add(Foo* left, Foo* right) {
    Foo foo = { .a = left->a + right->a, .b = left->b + right->b };

    return foo;
}
 */

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

  ReturnStatement(node: ast.ReturnStatement) {
    return `return ${this.generate(node.expression)};`;
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

  Declaration(node: ast.Declaration) {
    const { identifier, initializer, type } = node;

    return `${this.generate(type)} ${this.generate(
      identifier
    )} = ${this.generate(initializer)}`;
  }

  FunctionDeclaration(node: ast.FunctionDeclaration) {
    const { identifier, body, args, type } = node;

    return `${this.generate(type)} ${this.generate(
      identifier
    )}(${args.map((a) => this.generate(a)).join(",")}) ${
      body instanceof ast.Block
        ? this.generate(body)
        : `{ return ${this.generate(body)} }`
    }`;
  }

  Logical(node: ast.Logical) {
    return `${this.generate(node.left)} ${node.operator} ${this.generate(
      node.right
    )}`;
  }

  Equality(node: ast.Equality) {
    return `${this.generate(node.left)} ${node.operator} ${this.generate(
      node.right
    )}`;
  }

  Additive(node: ast.Additive) {
    return `${this.generate(node.left)} ${node.operator} ${this.generate(
      node.right
    )}`;
  }

  Argument(node: ast.Argument) {
    return `${this.generate(node.expression)}`;
  }

  Parameter(node: ast.Parameter) {
    const { type, identifier } = node;

    return `${this.generate(type)} ${this.generate(identifier)}`;
  }

  Qualifier(node: ast.Qualifier) {
    return node.name;
  }

  Identifier(node: ast.Identifier) {
    return node.name;
  }

  Type(node: ast.Type) {
    return node.name;
  }

  NumberLiteral(node: ast.NumberLiteral) {
    return node.value;
  }
}

export default function generate(program: ast.Program): string {
  return new Generator().generate(program);
}
