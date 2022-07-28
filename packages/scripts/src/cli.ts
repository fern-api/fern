import { writeFernJsonSchema } from "@fern-api/json-schema";
import path from "path";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { checkRootPackage } from "./checkRootPackage";

void yargs(hideBin(process.argv))
    .scriptName(process.env.CLI_NAME ?? "fern-scripts")
    .strict()
    .command(
        "write-json-schema",
        "Write the Fern API JSON schema to the root of the repo",
        () => {
            /* no-op */
        },
        async () => {
            await writeFernJsonSchema(path.join(__dirname, "../../../fern.schema.json"));
        }
    )
    .command(
        "check-root-package",
        "Check (or fix) the package.json of the root package",
        (argv) =>
            argv.option("fix", {
                boolean: true,
                default: false,
            }),
        async (argv) => {
            await checkRootPackage({
                shouldFix: argv.fix,
            });
        }
    )
    .demandCommand()
    .showHelpOnFail(true)
    .parse();
