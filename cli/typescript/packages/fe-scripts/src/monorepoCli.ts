import yargs from "yargs";
import { createPackage } from "./createPackage";
import { monorepoLint } from "./monorepoLint";

yargs
    .scriptName("monorepoCli")
    .usage("node $0 <cmd> [args]")
    .strict()
    .command(
        "lint [--fix]",
        "lint the monorepo",
        (yargs) =>
            yargs.option("fix", {
                default: false,
                type: "boolean",
            }),
        (argv) => {
            monorepoLint({ shouldFix: argv.fix });
        }
    )
    .command(
        "create-package <package-name>",
        "create a new package in the monorepo",
        (yargs) =>
            yargs.positional("package-name", {
                type: "string",
                demandOption: true,
            }),
        (argv) => {
            createPackage(argv["package-name"]);
        }
    )
    .help().argv;
