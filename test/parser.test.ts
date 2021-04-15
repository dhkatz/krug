import parse from "../src/parser";
import * as ast from "../src/ast";
import {
  expectAdd,
  expectBool,
  expectMul,
  expectNumber,
  expectOperator,
  expectUnary,
} from "./expect";

const stmt = <T extends ast.Node>(source: string, i = 0) =>
  parse(source).statements[i] as T;

describe("parser", () => {
  describe("Program", () => {
    it("should parse an empty file", function () {
      expect(parse("")).toBeInstanceOf(ast.Program);
    });
  });

  describe("NumberLiteral", () => {
    it("should parse an integer literal", () => {
      const literal = stmt<ast.NumberLiteral>("42");
      expect(literal).toBeInstanceOf(ast.NumberLiteral);
      expect(literal.value).toBe(42);
      expect(literal.isInteger).toBeTruthy();
    });

    it("should parse a floating point literal", () => {
      const literal = stmt<ast.NumberLiteral>("3.14");
      expect(literal).toBeInstanceOf(ast.NumberLiteral);
      expect(literal.value).toBe(3.14);
      expect(literal.isInteger).toBeFalsy();
    });

    it("should fail to parse dangling decimal", () => {
      expect(() => parse("3.")).toThrow();
      expect(() => parse(".1")).toThrow();
    });
  });

  describe("BooleanLiteral", () => {
    it("should parse 'true' boolean", () => {
      const literal = stmt<ast.BooleanLiteral>("true");
      expect(literal).toBeInstanceOf(ast.BooleanLiteral);
      expect(literal.value).toBeTruthy();
    });

    it("should parse 'false' boolean", () => {
      const literal = stmt<ast.BooleanLiteral>("false");
      expect(literal).toBeInstanceOf(ast.BooleanLiteral);
      expect(literal.value).toBeFalsy();
    });
  });

  describe("Block", () => {
    it("should parse an empty block", () => {
      const block = stmt<ast.Block>("{}");
      expect(block).toBeInstanceOf(ast.Block);
      expect(block.statements.length).toBe(0);
    });

    it("should parse nested blocks", () => {
      const block = stmt<ast.Block>("{ { } }");
      expect(block).toBeInstanceOf(ast.Block);
      expect(block.statements.length).toBe(1);
      expect(block.statements[0]).toBeInstanceOf(ast.Block);
    });
  });

  describe("UnaryExpression", () => {
    it("should parse the ! (negation) operator", () => {
      const unary = stmt<ast.UnaryExpression>("!true");
      expectUnary(unary);
      expectOperator(unary, "!");
      expectBool(unary.operand);
    });

    it("should parse the - (negative) operator", () => {
      const unary = stmt<ast.UnaryExpression>("-2");
      expectUnary(unary);
      expectOperator(unary, "-");
      expectNumber(unary.operand);
    });

    it("should parse nested unary operators", () => {
      const unary = stmt<ast.UnaryExpression>("--2");
      expectUnary(unary);
      expectOperator(unary, "-");
      expectUnary(unary.operand);
      expectOperator(unary.operand as ast.UnaryExpression, "-");
    });
  });

  describe("MultiplicativeExpression", () => {
    it("should parse simple multiplication", () => {
      const mul = stmt<ast.Multiplicative>("1 * 1");
      expectMul(mul);
      expectOperator(mul, "*");
      expectNumber(mul.left);
      expectNumber(mul.right);
    });
  });

  describe("AdditiveExpression", () => {
    it("should parse simple addition", () => {
      const add = stmt<ast.Additive>("1 + 1");
      expectAdd(add);
      expectOperator(add, "+");
      expectNumber(add.left);
      expectNumber(add.right);
    });

    it("should parse simple subtraction", () => {
      const sub = stmt<ast.Additive>("1 - 1");
      expectAdd(sub);
      expectOperator(sub, "-");
      expectNumber(sub.left);
      expectNumber(sub.right);
    });

    it("should parse nested additive", () => {
      const add = stmt<ast.Additive>("1 + 1 - 1");
      expectAdd(add);
      expectOperator(add, "-");
      expectAdd(add.left as ast.Additive);
      expectNumber(add.right);
    });
  });
});
