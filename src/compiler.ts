import parse from "./parser";

export default function compile(source: string): boolean {
  return parse(source);
}
