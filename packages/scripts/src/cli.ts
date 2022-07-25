import { writeFernJsonSchema } from "@fern-api/yaml-schema";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { checkRootPackage } from "./checkRootPackage";

void yargs(hideBin(process.argv))
    .scriptName("scripts")
    .strict()
    .command(
        "write-json-schema",
        "Write the Fern API JSON schema to the root of the repo",
        () => {
            /* no-op */
        },
        async () => {
            const __dirname = dirname(fileURLToPath(import.meta.url));
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
