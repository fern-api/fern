import yargs from "yargs";
import { compileCommand } from "./commands/compile";

yargs
    .strict()
    .command(
        "generate <input> <output>",
        "read birch API spec from provided directory and generate an intermediate representation",
        (yargs) =>
            yargs
                .positional("input", {
                    type: "string",
                    demandOption: true,
                    describe: "the directory containing Fern yaml files",
                })
                .positional("output", {
                    type: "string",
                    demandOption: true,
                    describe: "a file to dump the intermediate representation",
                }),
        (argv) => {
            compileCommand({
                inputDirectory: argv["input"],
                output: argv["output"],
            });
        }
    )
    .demandCommand()
    .showHelpOnFail(true)
    .parse();
