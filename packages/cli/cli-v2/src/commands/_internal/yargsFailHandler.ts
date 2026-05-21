import { CliError } from "@fern-api/task-context";
import type { Argv } from "yargs";

import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { renderError } from "../../errors/renderError.js";

/**
 * Shared yargs `.fail` handler.
 *
 * Yargs invokes its `.fail` callback before our `withContext` boundary runs,
 * so we render here directly and exit. To keep the user-visible output
 * consistent across the CLI we go through {@link renderError} with a
 * synthesized {@link CliError} of code `USER_ERROR`.
 *
 * Pass `showHelp=true` for command groups so the user gets the available
 * subcommand list after the error.
 */
export function makeYargsFailHandler({
    showHelp
}: {
    showHelp: boolean;
}): (msg: string | null, err: Error | null, y: Argv<GlobalArgs>) => void {
    return (msg, err, y) => {
        const error = err ?? new CliError({ code: CliError.Code.UserError, message: msg ?? "Invalid usage." });
        const json = isJsonFlagInArgv();
        const rendered = renderError(error, { json });
        if (rendered != null) {
            process.stderr.write(`${rendered}\n`);
        }
        // In JSON mode we suppress the human help block so the envelope on
        // stderr is the only thing a caller has to parse.
        if (showHelp && !json) {
            process.stderr.write("\n");
            y.showHelp("error");
        }
        // Yargs runs `.fail` synchronously and we are outside our async
        // `withContext` lifecycle, so we exit directly. Stick with 1 today
        // to avoid behavior changes for downstream scripts; the exit-code
        // mapping ships separately.
        process.exit(1);
    };
}

/**
 * Inspects `process.argv` for a `--json` (or `--json=true`) flag. We can't
 * rely on yargs-parsed args here because `.fail` is called for usage errors
 * that happen during parsing.
 */
function isJsonFlagInArgv(): boolean {
    for (const arg of process.argv.slice(2)) {
        if (arg === "--json") {
            return true;
        }
        if (arg === "--no-json") {
            return false;
        }
        if (arg.startsWith("--json=")) {
            const value = arg.slice("--json=".length).toLowerCase();
            return value === "true" || value === "1" || value === "yes";
        }
    }
    return false;
}
