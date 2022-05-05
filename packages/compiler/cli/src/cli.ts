import yargs from "yargs/yargs";
import { compileWorkspaces } from "./compileWorkspaces";

yargs()
    .scriptName("fern-api")
    .strict()
    .command(
        "$0 [--workspace]",
        "Generate typesafe servers and clients",
        (yargs) =>
            yargs.option("--workspace", {
                array: true,
                type: "string",
                describe: "process this workspace",
                description:
                    "If omitted, every workspace specified in the project-level configuration (fern.config.json) will be processed.",
            }),
        (argv) => {
            compileWorkspaces(argv.Workspace ?? []);
        }
    )
    .demandCommand()
    .showHelpOnFail(true)
    .parse();
