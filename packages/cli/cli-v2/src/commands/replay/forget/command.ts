import { extractErrorMessage } from "@fern-api/core-utils";
import { replayForget } from "@fern-api/generator-cli";
import { CliError } from "@fern-api/task-context";

import { resolve as resolvePath } from "path";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { command } from "../../_internal/command.js";

export declare namespace ForgetCommand {
    export interface Args extends GlobalArgs {
        args?: string[];
        "dry-run": boolean;
        yes: boolean;
        all: boolean;
    }
}

export class ForgetCommand {
    public async handle(context: Context, args: ForgetCommand.Args): Promise<void> {
        const outputDir = resolvePath(process.cwd(), ".");
        const positionalArgs = args.args ?? [];
        const dryRun = args["dry-run"];

        try {
            // --all mode
            if (args.all) {
                const result = replayForget({ outputDir, options: { all: true, dryRun } });

                if (!result.initialized) {
                    context.stderr.info("Replay is not initialized. Nothing to forget.");
                    return;
                }

                if (result.removed.length === 0) {
                    context.stderr.info("No patches to remove.");
                    return;
                }

                if (dryRun) {
                    context.stderr.info(`Would remove ${result.removed.length} patch(es):`);
                } else {
                    context.stderr.info(`Removed ${result.removed.length} patch(es):`);
                }
                for (const patch of result.removed) {
                    context.stderr.info(`  ${patch.id}: ${patch.message}`);
                }
                for (const warning of result.warnings) {
                    context.stderr.warn(warning);
                }
                return;
            }

            // Patch ID mode: all args start with "patch-"
            if (positionalArgs.length > 0 && positionalArgs.every((a) => a.startsWith("patch-"))) {
                const result = replayForget({ outputDir, options: { patchIds: positionalArgs, dryRun } });

                if (!result.initialized) {
                    context.stderr.info("Replay is not initialized. Nothing to forget.");
                    return;
                }

                if (result.removed.length > 0) {
                    const verb = dryRun ? "Would remove" : "Removed";
                    for (const patch of result.removed) {
                        context.stderr.info(`${verb}: ${patch.id} — ${patch.message}`);
                    }
                }
                for (const id of result.alreadyForgotten) {
                    context.stderr.info(`Already forgotten: ${id}`);
                }
                for (const warning of result.warnings) {
                    context.stderr.warn(warning);
                }
                return;
            }

            // Search/pattern mode or no-args mode
            if (positionalArgs.length > 1) {
                throw new CliError({
                    message: `Ambiguous arguments: expected patch IDs (e.g. patch-abc123) or a single search pattern, got: ${positionalArgs.join(", ")}`,
                    code: CliError.Code.ConfigError
                });
            }
            const pattern = positionalArgs.length === 1 ? positionalArgs[0] : undefined;
            const result = replayForget({ outputDir, options: { pattern } });

            if (!result.initialized) {
                context.stderr.info("Replay is not initialized. Nothing to forget.");
                return;
            }

            const matched = result.matched ?? [];
            if (matched.length === 0) {
                if (pattern) {
                    context.stderr.info(`No patches matching "${pattern}".`);
                } else {
                    context.stderr.info("No patches tracked.");
                }
                return;
            }

            // Show matched patches
            context.stderr.info(`${matched.length} patch(es) matched:`);
            for (const patch of matched) {
                const stat = `+${patch.diffstat.additions}/-${patch.diffstat.deletions}`;
                context.stderr.info(`  ${patch.id}: ${patch.message} (${stat})`);
            }

            if (dryRun) {
                context.stderr.info("\nDry run — no patches removed.");
                return;
            }

            if (!args.yes) {
                if (!context.isTTY) {
                    throw new CliError({
                        message: "Confirmation required. Use --yes to skip confirmation in non-interactive mode.",
                        code: CliError.Code.ConfigError
                    });
                }

                const readline = await import("readline");
                const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
                const answer = await new Promise<string>((resolvePrompt) => {
                    rl.question(`\nRemove ${matched.length} patch(es)? [y/N] `, resolvePrompt);
                });
                rl.close();

                if (answer.toLowerCase() !== "y") {
                    context.stderr.info("Cancelled.");
                    return;
                }
            }

            // Actually remove the matched patches
            const patchIds = matched.map((p) => p.id);
            const removeResult = replayForget({ outputDir, options: { patchIds, dryRun: false } });

            context.stderr.info(
                `Removed ${removeResult.removed.length} patch(es). ${removeResult.remaining} remaining.`
            );
            for (const warning of removeResult.warnings) {
                context.stderr.warn(warning);
            }
        } catch (error) {
            if (error instanceof CliError) {
                throw error;
            }
            throw new CliError({
                message: `Failed to forget patches: ${extractErrorMessage(error)}`,
                code: CliError.Code.InternalError
            });
        }
    }
}

export function addForgetCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new ForgetCommand();
    command(
        cli,
        "forget [args..]",
        "Remove tracked patches from Replay",
        (context, args) => cmd.handle(context, args as ForgetCommand.Args),
        (yargs) =>
            yargs
                .positional("args", {
                    type: "string",
                    array: true,
                    description: "Patch IDs (e.g. patch-abc12345) or a search pattern"
                })
                .option("dry-run", {
                    type: "boolean",
                    default: false,
                    description: "Show what would be removed without actually removing"
                })
                .option("yes", {
                    type: "boolean",
                    alias: "y",
                    default: false,
                    description: "Skip confirmation prompts"
                })
                .option("all", {
                    type: "boolean",
                    default: false,
                    description: "Remove all tracked patches"
                })
    );
}
