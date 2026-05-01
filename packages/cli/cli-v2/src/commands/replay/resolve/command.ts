import { extractErrorMessage } from "@fern-api/core-utils";
import { replayResolve } from "@fern-api/generator-cli";
import { CliError } from "@fern-api/task-context";

import { resolve as resolvePath } from "path";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { command } from "../../_internal/command.js";

export declare namespace ResolveCommand {
    export interface Args extends GlobalArgs {
        directory?: string;
        "no-check-markers": boolean;
    }
}

export class ResolveCommand {
    public async handle(context: Context, args: ResolveCommand.Args): Promise<void> {
        const outputDir = resolvePath(process.cwd(), args.directory ?? ".");

        try {
            const result = await replayResolve({
                outputDir,
                checkMarkers: !args["no-check-markers"]
            });

            switch (result.phase) {
                case "applied":
                    context.stderr.info(`Applied ${result.patchesApplied} unresolved patch(es) to your working tree.`);
                    if (result.unresolvedFiles && result.unresolvedFiles.length > 0) {
                        context.stderr.info("\nFiles with conflict markers:");
                        for (const file of result.unresolvedFiles) {
                            context.stderr.info(`  ${file}`);
                        }
                        context.stderr.info(
                            "\nResolve the conflicts in your editor, then run `fern replay resolve` again to finalize."
                        );
                    }
                    break;
                case "committed":
                    context.stderr.info(`Resolved ${result.patchesResolved} patch(es) and committed. Push when ready.`);
                    break;
                case "nothing-to-resolve":
                    context.stderr.info("No unresolved patches found.");
                    break;
                default:
                    if (!result.success) {
                        if (result.reason === "unresolved-conflicts" && result.unresolvedFiles) {
                            context.stderr.warn("Some files still have conflict markers:");
                            for (const file of result.unresolvedFiles) {
                                context.stderr.warn(`  ${file}`);
                            }
                            context.stderr.warn("Resolve them first, then run `fern replay resolve` again.");
                        } else {
                            throw new CliError({
                                message: `Resolve failed: ${result.reason ?? "unknown error"}`,
                                code: CliError.Code.InternalError
                            });
                        }
                    }
            }
        } catch (error) {
            if (error instanceof CliError) {
                throw error;
            }
            throw new CliError({
                message: `Failed to resolve: ${extractErrorMessage(error)}`,
                code: CliError.Code.InternalError
            });
        }
    }
}

export function addResolveCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new ResolveCommand();
    command(
        cli,
        "resolve [directory]",
        "Apply and resolve Replay patches",
        (context, args) => cmd.handle(context, args as ResolveCommand.Args),
        (yargs) =>
            yargs
                .positional("directory", {
                    type: "string",
                    default: ".",
                    description: "SDK directory containing .fern/replay.lock"
                })
                .option("no-check-markers", {
                    type: "boolean",
                    default: false,
                    description: "Skip checking for remaining conflict markers before committing"
                })
    );
}
