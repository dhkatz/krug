import * as ast from "../src/ast";

export function expectBlock(node: ast.Node): void {
  expect(node).toBeInstanceOf(ast.Block);
}

export function expectUnary(node: ast.Node): void {
  expect(node).toBeInstanceOf(ast.UnaryExpression);
}

export function expectNumber(node: ast.Node): void {
  expect(node).toBeInstanceOf(ast.NumberLiteral);
}

export function expectBool(node: ast.Node): void {
  expect(node).toBeInstanceOf(ast.BooleanLiteral);
}

export function expectAdd(node: ast.BinaryExpression): void {
  expect(node).toBeInstanceOf(ast.Additive);
}

export function expectMul(node: ast.Node): void {
  expect(node).toBeInstanceOf(ast.Multiplicative);
}

export function expectOperator(
  node: ast.UnaryExpression | ast.BinaryExpression,
  operator: string
): void {
  expect(node).toHaveProperty("operator");
  expect(node.operator).toEqual(operator);
}
