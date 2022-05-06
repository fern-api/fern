import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { compileWorkspaces } from "./compileWorkspaces";
import { WorkspaceCliOption } from "./constants";

yargs(hideBin(process.argv))
    .scriptName("fern-api")
    .strict()
    .command(
        ["generate", "gen"],
        "Generate typesafe servers and clients",
        (yargs) =>
            yargs.option(WorkspaceCliOption.KEY, {
                alias: WorkspaceCliOption.ALIASES,
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
