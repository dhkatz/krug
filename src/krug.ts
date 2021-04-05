import { Command } from "commander";
import compile from "./compiler";

const program = new Command();

program
  .version("0.1.0")
  .description("The Krug programming language compiler.")
  .arguments("<source>")
  .action((source) => {
    console.log("Compiling source...");
    console.log(compile(source));
  })
  .parse();
