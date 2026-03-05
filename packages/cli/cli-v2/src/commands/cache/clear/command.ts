import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { formatBytes } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";

export declare namespace ClearCommand {
    export interface Args extends GlobalArgs {
        all?: boolean;
        ir?: boolean;
        logs?: boolean;
        "dry-run"?: boolean;
    }
}

export class ClearCommand {
    public async handle(context: Context, args: ClearCommand.Args): Promise<void> {
        const { cache } = context;

        const dryRun = args["dry-run"] ?? false;

        // If --all is specified or neither --ir nor --logs is specified, clear everything.
        const clearAll = args.all || (!args.ir && !args.logs);
        const clearOptions = {
            ir: clearAll || args.ir,
            logs: clearAll || args.logs,
            dryRun
        };

        const result = await cache.clear(clearOptions);

        if (dryRun) {
            if (result.deletedCount === 0) {
                context.stdout.info("Cache is already empty, nothing to clear.");
                return;
            }
            context.stdout.info(`Would delete ${result.deletedCount} entries (${formatBytes(result.freedSize)})`);
            context.stdout.info("Run without --dry-run to actually delete these entries.");
            return;
        }

        if (result.deletedCount === 0) {
            context.stdout.info("Cache is already empty, nothing to clear.");
            return;
        }

        context.stdout.info(`Cleared ${result.deletedCount} entries (${formatBytes(result.freedSize)} freed)`);
    }
}

export function addClearCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new ClearCommand();
    command(
        cli,
        "clear",
        "Clear cache entries",
        (context, args) => cmd.handle(context, args as ClearCommand.Args),
        (yargs) =>
            yargs
                .option("all", {
                    type: "boolean",
                    description: "Clear all cache entries (default behavior)",
                    default: false
                })
                .option("ir", {
                    type: "boolean",
                    description: "Clear only IR cache entries",
                    default: false
                })
                .option("logs", {
                    type: "boolean",
                    description: "Clear only log files",
                    default: false
                })
                .option("dry-run", {
                    type: "boolean",
                    description: "Preview what would be cleared without deleting",
                    default: false
                })
    );
}
