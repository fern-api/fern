import yargs from "yargs/yargs";
import { clientCommand } from "./commands/clientCommand";
import { runCommand } from "./runCommand";

yargs()
    .strict()
    .command(
        "$0 <path-to-config>",
        "fern-typescript",
        (yargs) =>
            yargs.positional("path-to-config", {
                type: "string",
                demandOption: true,
                describe: "path to the JSON file containing the Fern plugin config",
            }),
        () => {
            runCommand({
                command: clientCommand,
                pathToIr: "/Users/zachkirsch/Dropbox/Mac/Documents/fern/packages/api/generated/ir.json",
                outputDir: "/Users/zachkirsch/Downloads",
            });
        }
    )
    .showHelpOnFail(true)
    .parse();
