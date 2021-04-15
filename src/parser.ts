/* eslint-disable @typescript-eslint/no-unused-vars */
import ohm from "ohm-js";
import * as ast from "./ast";
const KRUG_GRAMMAR = ohm.grammar(String.raw`Krug {
    Program                     = Statement*

    Statement                   = 
                                | Block
                                | Declaration
                                | ExpressionStatement
                                | ReturnStatement
                                | FunctionDeclaration
                                | ClassDeclaration

    Block                       = "{" Statement* "}"
    
    ExpressionStatement         = ~("{" | "func" | "class") Expression
    ReturnStatement             = "return" Expression?
    
    Declaration                 = qualifier Identifier ":" type Initializer?
    FunctionDeclaration         = "func" Identifier Parameters ":" type (Block | Initializer)
    OperatorDeclaration         = "func" Operator Parameters (Block | Initializer)
    ClassDeclaration            = "class" Identifier "{" (Declaration | FunctionDeclaration | OperatorDeclaration)* "}"

    IfExpression                = "if" "(" Expression ")" Statement ("else" Statement)?
    FunctionExpression          = "func" Identifier? Arguments ":" type (Block | Initializer)

    Expression                  = AssignmentExpression

    AssignmentExpression        = ReferenceExpression ("+=" | "-=" | "*=" | "/=") AssignmentExpression -- op_equals
                                | ReferenceExpression "=" AssignmentExpression -- bind
                                | LogicalExpression

    LogicalExpression           = LogicalExpression ("||" | "&&") EqualityExpression -- binary
                                | EqualityExpression

    EqualityExpression          = EqualityExpression ("==" | "!=") RelationalExpression -- binary
                                | RelationalExpression

    RelationalExpression        = RelationalExpression (">=" | "<=" | ">" | "<") AdditiveExpression -- binary
                                | AdditiveExpression

    AdditiveExpression          = AdditiveExpression ("+" | "-") MultiplicativeExpression -- binary
                                | MultiplicativeExpression

    MultiplicativeExpression    = MultiplicativeExpression ("*" | "/" | "%") UnaryExpression -- binary
                                | UnaryExpression

    UnaryExpression             = ("-" | "!") UnaryExpression -- unary
                                | ReferenceExpression
                                
    ReferenceExpression         = CallExpression
                                | AccessExpression

    CallExpression              = // CallExpression "." Identifier -- property
                                | CallExpression Arguments -- call
                                | AccessExpression Arguments -- access

    AccessExpression            = // AccessExpression "." Identifier -- property
                                | BasicExpression

    BasicExpression             = Literal
                                | Identifier
                                | FunctionExpression
                                | IfExpression
                                | "(" Expression ")" -- paren

    Identifier      = ~keyword letter alnum*
    Argument        = AssignmentExpression
    Arguments       = "(" ")" -- empty
                    | "(" ListOf<Argument, ","> ")" -- list
    Parameter       = Identifier ":" type
    Parameters      = "(" ")" -- empty
                    | "(" ListOf<Parameter, ","> ")" -- list
    Initializer     = "=" AssignmentExpression
    qualifier       = ("let" | "const") ~alnum
    Operator        = ("+" | "-" | "*" | "/")
    Literal         = boolean
                    | number

    keyword         = "let" | "const" | "func" | boolean | "if" | "else" | "return"
    type            = ~keyword letter alnum*

    boolean         = ("true" | "false") ~alnum
    number          = digit+ ("." digit+)?
}`);

const opt = (node: ohm.Node) =>
  node.numChildren ? node.child(0).ast() : undefined;

const KRUG_SEMANTICS = KRUG_GRAMMAR.createSemantics().addOperation("ast", {
  // Syntactical
  Program: (body) => new ast.Program(body.ast()),
  Block: (_open, statements, _close) => new ast.Block(statements.ast()),

  ReturnStatement: (_return, exp) => new ast.ReturnStatement(opt(exp)),

  Declaration: (qualifier, identifier, _col, type, initializer) =>
    new ast.Declaration(
      qualifier.ast(),
      identifier.ast(),
      type.ast(),
      opt(initializer)
    ),
  FunctionDeclaration: (_func, id, args, _col, type, exp) =>
    new ast.FunctionDeclaration(id.ast(), args.ast(), type.ast(), exp.ast()),
  OperatorDeclaration: (_func, op, args, exp) =>
    new ast.OperatorDeclaration(op.sourceString, args.ast(), exp.ast()),
  ClassDeclaration: (_class, id, _left, declarations, _right) =>
    new ast.ClassDeclaration(id.ast(), declarations.ast()),

  IfExpression: (_if, _open, expression, _close, statement, _else, elseStmt) =>
    new ast.IfExpression(expression.ast(), statement.ast(), opt(elseStmt)),

  AssignmentExpression_bind: (ref, op, exp) =>
    new ast.Assignment(ref.ast(), op.sourceString, exp.ast()),
  LogicalExpression_binary: (left, op, right) =>
    new ast.Logical(left.ast(), op.sourceString, right.ast()),
  EqualityExpression_binary: (left, op, right) =>
    new ast.Equality(left.ast(), op.sourceString, right.ast()),
  RelationalExpression_binary: (left, op, right) =>
    new ast.Relational(left.ast(), op.sourceString, right.ast()),
  AdditiveExpression_binary: (left, op, right) =>
    new ast.Additive(left.ast(), op.sourceString, right.ast()),
  MultiplicativeExpression_binary: (left, op, right) =>
    new ast.Multiplicative(left.ast(), op.sourceString, right.ast()),
  UnaryExpression_unary: (op, operand) =>
    new ast.UnaryExpression(op.sourceString, operand.ast()),
  CallExpression_access: (exp, args) =>
    new ast.CallExpression(exp.ast(), args.ast()),

  Identifier: (letter, label) =>
    new ast.Identifier(letter.sourceString + label.sourceString),
  Initializer: (_eq, expression) => expression.ast(),

  Argument: (exp) => new ast.Argument(exp.ast()),
  Arguments_empty: (_open, _close) => [],
  Arguments_list: (_open, args, _close) => args.asIteration().ast(),

  Parameter: (id, _col, type) => new ast.Parameter(id.ast(), type.ast()),
  Parameters_empty: (_open, _close) => [],
  Parameters_list: (_open, args, _close) => args.asIteration().ast(),

  type: (letter, label) =>
    new ast.Type(letter.sourceString + label.sourceString),
  number: (integer, _decimal, fractional) =>
    new ast.NumberLiteral(
      fractional.numChildren
        ? `${integer.sourceString}${fractional.sourceString}`
        : integer.sourceString
    ),
  boolean: (val) => new ast.BooleanLiteral(val.sourceString),
  qualifier: (label) => new ast.Qualifier(label.sourceString),
});

export default function parse(source: string): ast.Program {
  const match = KRUG_GRAMMAR.match(source);

  if (!match.succeeded()) {
    throw new Error(match.message);
  }

  return KRUG_SEMANTICS(match).ast();
}
