import parse from "./parser";
import { Program } from "./ast";

export default function compile(source: string): Program {
  return parse(source);
}
