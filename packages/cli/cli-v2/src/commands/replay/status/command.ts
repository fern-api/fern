import { extractErrorMessage } from "@fern-api/core-utils";
import { replayStatus } from "@fern-api/generator-cli";
import { CliError } from "@fern-api/task-context";

import { resolve as resolvePath } from "path";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { command } from "../../_internal/command.js";

export declare namespace StatusCommand {
    export interface Args extends GlobalArgs {
        directory?: string;
        verbose: boolean;
    }
}

export class StatusCommand {
    public async handle(context: Context, args: StatusCommand.Args): Promise<void> {
        const outputDir = resolvePath(process.cwd(), args.directory ?? ".");

        try {
            const result = replayStatus({ outputDir });

            if (!result.initialized) {
                context.stderr.info("Replay is not initialized. Run `fern replay init` to get started.");
                return;
            }

            context.stderr.info(
                `Replay: ${result.patches.length} customization(s) tracked, ${result.generationCount} generation(s)`
            );

            if (result.lastGeneration) {
                context.stderr.info(
                    `Last generation: ${result.lastGeneration.sha} (${result.lastGeneration.timestamp})`
                );
            }

            if (result.patches.length === 0) {
                context.stderr.info("No customizations tracked.");
                return;
            }

            const patchesToShow = args.verbose ? result.patches : result.patches.slice(0, 10);
            for (const patch of patchesToShow) {
                const statusTag = patch.status ? ` [${patch.status}]` : "";
                if (args.verbose) {
                    context.stderr.info(
                        `\n  ${patch.id} (${patch.type})${statusTag}\n` +
                            `    ${patch.message}\n` +
                            `    Author: ${patch.author} (${patch.sha})\n` +
                            `    Files (${patch.fileCount}): ${patch.files.join(", ")}`
                    );
                } else {
                    context.stderr.info(`  ${patch.id}: ${patch.message} (${patch.fileCount} file(s))${statusTag}`);
                }
            }

            if (!args.verbose && result.patches.length > 10) {
                context.stderr.info(`  ... and ${result.patches.length - 10} more (use --verbose to see all)`);
            }

            if (result.unresolvedCount > 0) {
                context.stderr.warn(
                    `\n${result.unresolvedCount} patch(es) have unresolved conflicts. Run \`fern replay resolve\` to fix.`
                );
            }

            if (result.excludePatterns.length > 0) {
                context.stderr.info(`\nExclude patterns: ${result.excludePatterns.join(", ")}`);
            }
        } catch (error) {
            if (error instanceof CliError) {
                throw error;
            }
            throw new CliError({
                message: `Failed to get Replay status: ${extractErrorMessage(error)}`,
                code: CliError.Code.InternalError
            });
        }
    }
}

export function addStatusCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new StatusCommand();
    command(
        cli,
        "status [directory]",
        "Show Replay status and tracked customizations",
        (context, args) => cmd.handle(context, args as StatusCommand.Args),
        (yargs) =>
            yargs
                .positional("directory", {
                    type: "string",
                    default: ".",
                    description: "SDK directory containing .fern/replay.lock"
                })
                .option("verbose", {
                    type: "boolean",
                    alias: "v",
                    default: false,
                    description: "Show all patches with full details"
                })
    );
}
