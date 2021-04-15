import * as ast from "./ast";

const TYPES = new Set(["int", "double", "float", "uint"]);

type Identifiable = ast.Identifier | ast.Type | { identifier: ast.Identifier };

class Scope {
  public symbols: Map<string, ast.Node> = new Map();

  public constructor(
    public name: string,
    public level: number,
    public parent: Scope
  ) {}

  public lookup<T extends ast.Node>(
    node: Identifiable,
    recurse = true
  ): T | undefined {
    const name = "name" in node ? node.name : node.identifier.name;
    console.log(`Lookup: ${name}`);
    const symbol = this.symbols.get(name) as T;

    if (symbol) return symbol;

    if (!recurse || (recurse && !this.parent)) {
      return undefined;
    } else {
      return this.parent.lookup(node);
    }
  }

  public declare(node: ast.Identifier): void {
    const name = node.name;

    if (this.lookup(node, false)) {
      throw new Error(`Symbol '${name}' has been previously declared!`);
    }

    console.log(`Declare: ${name}`);

    this.symbols.set(name, node);
  }
}

class Analyzer {
  public scope: Scope;

  [key: string]: unknown;

  public constructor() {
    this.scope = new Scope("global", 1, undefined!);

    TYPES.forEach((t) => this.scope.declare(new ast.Type(t)));
  }

  public analyze<T extends ast.Node | undefined>(
    node: T
  ): undefined extends T ? undefined : T {
    if (node === undefined) {
      return undefined as undefined extends T ? undefined : T;
    }

    const visitor = this[node.constructor.name];

    if (typeof visitor === "function") {
      return visitor.call(this, node) as undefined extends T ? undefined : T;
    }

    throw new Error(
      `Failed to find visitor for node '${node.constructor.name}'`
    );
  }

  Program(node: ast.Program) {
    node.statements = node.statements.map((s) => this.analyze(s));

    return node;
  }

  Identifier(node: ast.Identifier) {
    return this.scope.lookup(node);
  }

  Declaration(node: ast.Declaration) {
    if (node.initializer) {
      node.initializer = this.analyze(node.initializer);
    }

    const type = this.scope.lookup<ast.Type>(node.type);

    if (!type) {
      throw new Error(
        `Attempted to declare variable '${node.identifier.name}' with undefined type '${node.type.name}'!`
      );
    }

    this.scope.declare(node.identifier);

    return node;
  }

  Assignment(node: ast.Assignment) {
    node.ref = this.analyze(node.ref);
    node.exp = this.analyze(node.exp);

    return node;
  }

  FunctionDeclaration(node: ast.FunctionDeclaration) {
    this.scope.declare(node.identifier);

    this.scope = new Scope(
      node.identifier.name,
      this.scope.level + 1,
      this.scope
    );

    node.args = node.args.map((param) => {
      this.scope.lookup(param.type);
      this.scope.declare(param.identifier);

      return param;
    });

    node.body = this.analyze(node.body);

    this.scope = this.scope.parent;

    return node;
  }

  OperatorDeclaration(node: ast.OperatorDeclaration) {
    console.log(node);

    return node;
  }

  ClassDeclaration(node: ast.ClassDeclaration) {
    this.scope.declare(node.identifier);

    this.scope = new Scope(
      node.identifier.name,
      this.scope.level + 1,
      this.scope
    );

    node.declarations = node.declarations.map((d) => this.analyze(d));

    this.scope = this.scope.parent;

    return node;
  }

  Block(node: ast.Block) {
    node.statements = node.statements.map((s) => this.analyze(s));

    return node;
  }

  CallExpression(node: ast.CallExpression) {
    // const func = this.scope.lookup(node.);

    return node;
  }

  Equality(node: ast.Equality) {
    node.left = this.analyze(node.left);
    node.right = this.analyze(node.right);

    return node;
  }

  Logical(node: ast.Logical) {
    node.left = this.analyze(node.left);
    node.right = this.analyze(node.right);

    return node;
  }

  Additive(node: ast.Additive) {
    node.left = this.analyze(node.left);
    node.right = this.analyze(node.right);

    return node;
  }

  Multiplicative(node: ast.Multiplicative) {
    node.left = this.analyze(node.left);
    node.right = this.analyze(node.right);

    return node;
  }

  NumberLiteral(node: ast.NumberLiteral) {
    return node;
  }

  BooleanLiteral(node: ast.BooleanLiteral) {
    return node;
  }

  IfExpression(node: ast.IfExpression) {
    node.expression = this.analyze(node.expression);

    this.scope = new Scope("if", this.scope.level + 1, this.scope);

    node.statement = this.analyze(node.statement);

    this.scope = this.scope.parent;

    node.elseExpression = this.analyze(node.elseExpression);

    return node;
  }

  ReturnStatement(node: ast.ReturnStatement) {
    node.expression = this.analyze(node.expression);

    return node;
  }
}

export default function analyze<T extends ast.Node>(node: T): T {
  return new Analyzer().analyze(node);
}
