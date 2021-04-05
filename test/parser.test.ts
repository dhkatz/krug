import parse from "../src/parser";

it("should not parse an empty file", function () {
  expect(parse("")).toBeFalsy();
});

it("should parse a number", function () {
  expect(parse("42")).toBeTruthy();
});
