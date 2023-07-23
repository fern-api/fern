import { cwd, resolve } from "@fern-api/fs-utils";
import { writeFernJsonSchema } from "@fern-api/json-schema";
import { noop } from "lodash-es";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { checkReleaseBlockers } from "./checkReleaseBlockers";
import { checkRootPackage } from "./checkRootPackage";

void yargs(hideBin(process.argv))
    .scriptName(process.env.CLI_NAME ?? "fern-scripts")
    .strict()
    .command(
        "write-json-schema <filepath>",
        "Write the Fern API JSON schema to the root of the repo",
        (yargs) =>
            yargs.positional("filepath", {
                type: "string",
                demandOption: true,
            }),
        async (argv) => {
            await writeFernJsonSchema(resolve(cwd(), argv.filepath));
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
    .command("check-cli-release-blockers", "Check that there are no release blockers for CLI", noop, async () => {
        await checkReleaseBlockers("cli-release-blockers.yml");
    })
    .command("check-docs-release-blockers", "Check that there are no release blockers for docs", noop, async () => {
        await checkReleaseBlockers("docs-release-blockers.yml");
    })
    .demandCommand()
    .showHelpOnFail(true)
    .parse();
