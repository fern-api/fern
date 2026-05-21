import { CliError } from "@fern-api/task-context";
import type { Argv } from "yargs";

import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { exitCodeForError } from "../../errors/exitCode.js";
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
        const rendered = renderError(error);
        if (rendered != null) {
            process.stderr.write(`${rendered}\n`);
        }
        if (showHelp) {
            process.stderr.write("\n");
            y.showHelp("error");
        }
        // Yargs runs `.fail` synchronously and we are outside our async
        // `withContext` lifecycle, so we exit directly. Use the same
        // exit-code mapping as the main error boundary so shell scripts
        // can branch on USER_ERROR vs the rest.
        process.exit(exitCodeForError(error));
    };
}
