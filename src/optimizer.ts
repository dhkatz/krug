import * as ast from "./ast";
import { NumberLiteral } from "./ast";

class Optimizer {
  [key: string]: unknown;

  public optimize<T extends ast.Node | undefined>(
    node: T
  ): undefined extends T ? undefined : T {
    if (node === undefined) {
      return undefined as undefined extends T ? undefined : T;
    }

    const visitor = this[node.constructor.name];

    if (typeof visitor === "function") {
      return visitor.call(this, node) as undefined extends T ? undefined : T;
    } else {
      throw new Error(
        `Failed to find visitor for node '${node.constructor.name}'`
      );
    }
  }

  Program(node: ast.Program) {
    node.statements = node.statements.map((s) => this.optimize(s));

    return node;
  }

  Block(node: ast.Block) {
    node.statements = node.statements.map((s) => this.optimize(s));

    return node;
  }

  Declaration(node: ast.Declaration) {
    node.initializer = this.optimize(node.initializer);

    return node;
  }

  FunctionDeclaration(node: ast.FunctionDeclaration) {
    node.body = this.optimize(node.body);

    return node;
  }

  ClassDeclaration(node: ast.ClassDeclaration) {
    node.declarations = node.declarations.map((d) => this.optimize(d));

    return node;
  }

  Identifier(node: ast.Identifier) {
    return node;
  }

  Type(node: ast.Type) {
    return node;
  }

  Additive(node: ast.Additive) {
    if (
      node.left instanceof ast.NumberLiteral &&
      node.right instanceof ast.NumberLiteral
    ) {
      const value =
        node.operator === "+"
          ? node.left.value + node.right.value
          : node.left.value - node.right.value;
      return new ast.NumberLiteral(value);
    }

    return node;
  }

  IfExpression(node: ast.IfExpression) {
    if (node.statement instanceof ast.Block) {
      if (node.statement.statements.length === 0) {
        return this.optimize(node.elseExpression);
      }
    }

    node.expression = this.optimize(node.expression);
    node.statement = this.optimize(node.statement);
    node.elseExpression = this.optimize(node.elseExpression);

    return node;
  }

  CallExpression(node: ast.CallExpression) {
    node.expression = this.optimize(node.expression);
    node.args = node.args.map((a) => this.optimize(a));

    return node;
  }

  Argument(node: ast.Argument) {
    node.expression = this.optimize(node.expression);

    return node;
  }

  Parameter(node: ast.Parameter) {
    return node;
  }

  NumberLiteral(node: ast.NumberLiteral) {
    return node;
  }

  BooleanLiteral(node: ast.BooleanLiteral) {
    return node;
  }

  Logical(node: ast.Logical) {
    node.left = this.optimize(node.left);
    node.right = this.optimize(node.right);

    if (node.left instanceof ast.BooleanLiteral) {
      if (node.operator === "||" && node.left.value) {
        return new ast.BooleanLiteral(true);
      } else if (node.operator === "&&" && !node.left.value) {
        return new ast.BooleanLiteral(false);
      }
    }

    return node;
  }

  Equality(node: ast.Equality) {
    node.left = this.optimize(node.left);
    node.right = this.optimize(node.right);

    if (
      node.left instanceof ast.NumberLiteral &&
      node.right instanceof NumberLiteral
    ) {
      return new ast.BooleanLiteral(node.left.value === node.right.value);
    }

    return node;
  }

  ReturnStatement(node: ast.ReturnStatement) {
    node.expression = this.optimize(node.expression);

    return node;
  }
}

export default function optimize<T extends ast.Node>(node: T): T {
  return new Optimizer().optimize(node);
}
