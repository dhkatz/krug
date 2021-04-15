import parse from "./parser";
import { Program } from "./ast";
import analyze from "./analyzer";
import generate from "./generator/js";
import generate_c from "./generator/c";
import optimize from "./optimizer";

export enum OutputType {
  AST = "ast",
  ANALYZE = "analyze",
  JS = "js",
  C = "c",
}

type OutputReturnType = {
  [OutputType.AST]: Program;
  [OutputType.ANALYZE]: Program;
  [OutputType.JS]: string;
  [OutputType.C]: string;
};

export default function compile<K extends OutputType>(
  source: string,
  outputType: K
): OutputReturnType[K] {
  const action = {
    [OutputType.AST]: () => parse(source),
    [OutputType.ANALYZE]: () => analyze(parse(source)),
    [OutputType.JS]: () => generate(optimize(analyze(parse(source)))),
    [OutputType.C]: () => generate_c(optimize(analyze(parse(source)))),
  };

  return action[outputType]() as OutputReturnType[K];
}
