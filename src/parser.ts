/* eslint-disable @typescript-eslint/no-unused-vars */
import ohm, { ActionDict, Node } from "ohm-js";
import {
  Argument,
  Assignment,
  Block,
  CallOperator,
  Declaration,
  ElseBranch,
  Function,
  Identifier,
  IfBranch,
  Program, Qualifier,
  Type
} from "./ast";
const KRUG_GRAMMAR = ohm.grammar(String.raw`Krug {
    Program         = Statement*
                    
    Assignment      = Declaration "=" Expression -- decl
                    | id "=" Expression -- exp
    Declaration     = qualifier id ":" type -- declaration
    Function        = func id "(" ListOf<Argument, ","> ")" ":" type FunctionBody -- func
    FunctionBody    = Block
                    | "=" Expression -- exp
    Argument        = id ":" type -- arg
    Block           = "{" Statement* "}" -- block
    
    Expression      = Logical
                    |

    Logical         = Logical ("&&" | "||") Relational -- binary
                    | Relational
                    
    Relational      = Relational ("<=" | ">=" | "<" | ">") Equality -- binary
                    | EqualityExpression
                    
    EqualityExpression          = EqualityExpression ("==" | "!=") AdditiveExpression
                                | AdditiveExpression
                    
    AdditiveExpression          = AdditiveExpression ("+" | "-") MultiplicativeExpression -- binary
                                | MultiplicativeExpression
                    
    MultiplicativeExpression    = Multiplicative ("*" | "/") Unary -- binary
                                | Unary
                    
    UnaryExpression             = ("+" | "-" | "!") UnaryExpression -- prefix
                                | Term

    Var             = Var "." id -- property
                    | id -- id
    Call            = Var "(" ListOf<Expression, ","> ")" 

    IfStatement     = if "(" Expression ")" Statement else Statement
                    | if "(" Expression ")" Statement

    qualifier       = ("const" | "let") ~alnum
    func            = "func" ~alnum
    return          = "return" ~alnum
    if              = "if" ~alnum
    elif            = "elif" ~alnum
    else            = "else" ~alnum
    
    keyword         = qualifier | func | return | if | elif | else | boolean
    
    type            = ~keyword letter alnum*
    id              = ~keyword letter alnum*
    
    literal         = boolean | number
    boolean         = ("true" | "false") ~alnum
    number          = digit* "." digit+ -- float
                    | digit+
}`);

const AST_ACTIONS: ActionDict = {
  // Syntactical
  Program: (body) => new Program(body.ast()),
  Assignment: build(Assignment),
  Declaration: build(Declaration),
  Block: build(Block),
  Argument: build(Argument),
  Function: build(Function),
  FunctionBody_exp: (_eq, exp) => new Block([exp.ast()]),
  Branch: (node) => {
    // const ifStmt = ifBranch.ast() as IfBranch;
    //
    // const elseIfStmts = elseIfBranch.asIteration();
    //
    // let tail = ifStmt;
    // if (elseIfStmts.length > 0) {
    //   const head = elseIfStmts.shift() as ElseBranch;
    //   tail = head;
    //
    //   while (elseIfStmts.length > 0) {
    //     tail.elseBranch = elseIfStmts.shift();
    //     if (tail.elseBranch) {
    //       tail = tail.elseBranch as ElseBranch;
    //     }
    //   }
    //
    //   ifStmt.elseBranch = head;
    // }
    //
    // if (elseBranch.child(0)) {
    //   tail.elseBranch = elseBranch.child(0).ast();
    // }
    //
    // return ifStmt;

    console.log(node.children)
  },
  IfBranch: build(IfBranch),
  // ElseBranch: build(ElseBranch),
  Call: (exp, _open, args, _close) => {
    console.log(args.asIteration().ast());
    return new CallOperator(exp.ast(), args.asIteration());
  },
  // Lexical
  id: (letter, label) =>
    new Identifier(letter.sourceString + label.sourceString),
  type: (letter, label) => new Type(letter.sourceString + label.sourceString),
  number: (digits) => Number(digits.sourceString),
  boolean: (val) => Boolean(val.sourceString === "true"),
  qualifier: (label) => new Qualifier(label.sourceString)
}

const isTerminal = (node: Node) => !AST_ACTIONS[node.ctorName] &&
  node.isTerminal() ||
  node.numChildren === 1 && node.child(0).isTerminal() && !AST_ACTIONS[node.child(0).ctorName]

function build<T extends { new (...args: any[]): InstanceType<T> }>(Class: T) {
  return (args: Node): InstanceType<T> => {
    console.log(Class.name.toUpperCase())
    for (const child of args.children) {
      console.log(child.ctorName, isTerminal(child));
      if (child.ctorName === 'qualifier') console.log(child)
    }
    return new Class(...args.children.filter((arg) => !isTerminal(arg)).map(arg => arg.ast()));
  }
}

const KRUG_SEMANTICS = KRUG_GRAMMAR.createSemantics()
  .addOperation("ast", AST_ACTIONS)
  // .extendOperation("asIteration", {
  //   ElseIfBranch: (_else, ifBranch) => {
  //     const ifStmt = ifBranch.ast() as IfBranch;
  //     return new ElseBranch(ifStmt, ifStmt.elseBranch,);
  //   },
  // });

export default function parse(source: string): Program {
  const match = KRUG_GRAMMAR.match(source);

  if (!match.succeeded()) {
    throw new Error(match.message);
  }

  return KRUG_SEMANTICS(match).ast();
}
