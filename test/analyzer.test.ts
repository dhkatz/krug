import analyze from "../src/analyzer";
import * as ast from "../src/ast";
import { expectBlock, expectNumber } from "./expect";

describe("analyzer", () => {
  describe("Program", () => {
    it("should analyze an empty file", () => {
      const program = analyze(new ast.Program([]));
      expect(program).toBeInstanceOf(ast.Program);
      expect(program.statements).toHaveLength(0);
    });
  });

  describe("NumberLiteral", () => {
    it("should analyze an integer literal", () => {
      const literal = analyze(new ast.NumberLiteral("1"));
      expectNumber(literal);
    });

    it("should analyze a floating point literal", () => {
      const literal = analyze(new ast.NumberLiteral("3.14"));
      expectNumber(literal);
    });
  });

  describe("Block", () => {
    it("should analyze an empty block", () => {
      const block = analyze(new ast.Block([]));
      expectBlock(block);
      expect(block.statements).toHaveLength(0);
    });
  });
});
