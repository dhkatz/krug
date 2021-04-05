/* eslint-disable @typescript-eslint/no-unused-vars */
import ohm from "ohm-js";
import {
  Argument,
  Assignment,
  Block,
  Call,
  Declaration,
  ElseBranch,
  Function,
  Identifier,
  IfBranch,
  Program,
  Type,
} from "./ast";

const KRUG_GRAMMAR = ohm.grammar(String.raw`Krug {
    Program         = Statement+
    Statement       = Assignment
                    | Declaration
                    | Function
                    | Block
                    | Expression
                    | Branch
    Assignment      = Declaration "=" Expression
                    | id "=" Expression
    Declaration     = (let | const) id ":" type
    Function        = func id "(" ListOf<Argument, ","> ")" ":" type FunctionBody
    FunctionBody    = Block
                    | "=" Expression -- exp
    Argument        = id ":" type
    Block           = "{" Statement* "}"
    Expression      = Operation

    // Precedence: Low -> High
    Operation       = Logical
    Logical         = Logical ("&&" | "||") Relational -- binary
                    | Relational
    Relational      = Relational ("<=" | "==" | "!=" | ">=" | "<" | ">") Additive -- binary
                    | Additive
    Additive        = Additive ("+" | "-") Multiplicative -- binary
                    | Multiplicative
    Multiplicative  = Multiplicative ("*" | "/") Unary -- binary
                    | Unary
    Unary           = ("+" | "-") Term -- prefix
                    | Term
    Term            = literal
                    | Call
                    | Var
                    | "(" Expression ")" -- paren

    Var             = Var "." id -- property
                    | id -- id
    Call            = Var "(" ListOf<Expression, ","> ")"

    // Branching
    Branch          = IfBranch ElseIfBranch* ElseBranch?
    IfBranch        = if "(" Expression ")" Block
    ElseIfBranch    = else IfBranch
    ElseBranch      = else Block

    func            = "func" ~alnum
    const           = "const" ~alnum
    let             = "let" ~alnum
    return          = "return" ~alnum
    if              = "if" ~alnum
    elif            = "elif" ~alnum
    else            = "else" ~alnum
    literal         = boolean | number
    boolean         = ("true" | "false") ~alnum
    keyword         = let | const | func | return | if | elif | else | boolean
    type            = ~keyword letter alnum*
    id              = ~keyword letter alnum*
    number          = digit* "." digit+ -- float
                    | digit+
}`);

const KRUG_SEMANTICS = KRUG_GRAMMAR.createSemantics()
  .addOperation("ast", {
    // Syntactical
    Program: (body) => new Program(body.ast()),
    Assignment: (id, _, exp) => new Assignment(id.ast(), exp.ast()),
    Declaration: (qualifier, id, _, type) =>
      new Declaration(qualifier.sourceString, id.ast(), type.ast()),
    Block: (_lb, statements, _rb) => new Block(statements.ast()),
    Argument: (id, _col, type) => new Argument(id.ast(), type.ast()),
    Function: (_func, id, _lp, args, _rp, _col, type, block) =>
      new Function(id.ast(), args.asIteration().ast(), type.ast(), block.ast()),
    FunctionBody_exp: (_eq, exp) => new Block([exp.ast()]),
    Branch: (ifBranch, elseIfBranch, elseBranch) => {
      const ifStmt = ifBranch.ast() as IfBranch;

      const elseIfStmts = elseIfBranch.asIteration();

      let tail = ifStmt;
      if (elseIfStmts.length > 0) {
        const head = elseIfStmts.shift() as ElseBranch;
        tail = head;

        while (elseIfStmts.length > 0) {
          tail.elseBranch = elseIfStmts.shift();
          if (tail.elseBranch) {
            tail = tail.elseBranch as ElseBranch;
          }
        }

        ifStmt.elseBranch = head;
      }

      if (elseBranch.child(0)) {
        tail.elseBranch = elseBranch.child(0).ast();
      }

      return ifStmt;
    },
    IfBranch: (_if, _lp, exp, _rp, block) =>
      new IfBranch(block.ast(), null, exp.ast()),
    ElseBranch: (_else, block) => new ElseBranch(block.ast(), null, null),
    Call: (exp, _open, args, _close) => {
      console.log(args.asIteration().ast());
      return new Call(exp.ast(), args.asIteration());
    },
    // Lexical
    id: (letter, label) =>
      new Identifier(letter.sourceString + label.sourceString),
    type: (letter, label) => new Type(letter.sourceString + label.sourceString),
    number: (digits) => Number(digits.sourceString),
    boolean: (val) => Boolean(val.sourceString === "true"),
  })
  .extendOperation("asIteration", {
    ElseIfBranch: (_else, ifBranch) => {
      const ifStmt = ifBranch.ast() as IfBranch;
      return new ElseBranch(ifStmt, ifStmt.elseBranch, ifStmt.expression);
    },
  });

export default function parse(source: string): Program {
  const match = KRUG_GRAMMAR.match(source);

  if (!match.succeeded()) {
    throw new Error(match.message);
  }

  return KRUG_SEMANTICS(match).ast();
}
