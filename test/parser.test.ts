import parse from "../src/parser";
import { Program } from "../src/ast";

const stmt = (ast: Program, i = 0) => ast.statements[i];

it("should not parse an empty file", function () {
  expect(() => parse("")).toThrowError();
});

it("should parse an integer literal", function () {
  expect(stmt(parse("42"))).toEqual(42);
});

it("should parse a floating point literal", function () {
  expect(stmt(parse("1.0"))).toEqual(1);
});

it("should parse a boolean literal", function () {
  expect(stmt(parse("true"))).toStrictEqual(true);
  expect(stmt(parse("false"))).toStrictEqual(false);
});
