import { promises as fs } from "fs";
import { Command } from "commander";
import compile, { OutputType } from "./compiler";
import { Node } from "./ast";
import util from "util";

const program = new Command();

program
  .version("0.1.0")
  .description("The Krug programming language compiler.")
  .arguments("<source>")
  .action(async (source) => {
    try {
      const buffer = await fs.readFile(source);
      console.log(compile(buffer.toString(), OutputType.C));
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })
  .parseAsync();

function description(node: Node) {
  const tags = new Map<Node, number>();

  function tag(n: Node) {
    if (tags.has(n) || typeof n !== "object" || !n) return;
    tags.set(n, tags.size + 1);
    for (const child of Object.values(n)) {
      Array.isArray(child) ? child.forEach((c) => tag(c)) : tag(child);
    }
  }

  function* lines(): Generator<string> {
    function view(e: Node): string {
      if (tags.has(e)) return `#${tags.get(e)}`;
      if (Array.isArray(e)) return `[${e.map(view)}]`;
      return util.inspect(e);
    }

    for (const [node, id] of [...tags.entries()].sort((a, b) => a[1] - b[1])) {
      // eslint-disable-next-line prefer-const
      let [type, props] = [node.constructor.name, ""];
      Object.entries(node).forEach(([k, v]) => (props += ` ${k}=${view(v)}`));
      yield `${String(id).padStart(4, " ")} | ${type}${props}`;
    }
  }

  tag(node);
  return [...lines()].join("\n");
}
