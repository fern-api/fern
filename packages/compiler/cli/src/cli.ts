import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { compileWorkspaces } from "./compileWorkspaces";

yargs(hideBin(process.argv))
    .scriptName("fern")
    .strict()
    .command(
        ["generate", "gen"],
        "Generate typesafe servers and clients",
        (yargs) =>
            yargs.positional("workspace", {
                array: true,
                type: "string",
                description:
                    "If omitted, every workspace specified in the project-level configuration (fern.config.json) will be processed.",
            }),
        (argv) => {
            compileWorkspaces(argv.workspace ?? []);
        }
    )
    .demandCommand()
    .showHelpOnFail(true)
    .parse();
