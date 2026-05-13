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
        versions?: boolean;
        "dry-run"?: boolean;
    }
}

export class ClearCommand {
    public async handle(context: Context, args: ClearCommand.Args): Promise<void> {
        const { cache } = context;

        const dryRun = args["dry-run"] ?? false;

        // Default (no flags) clears `ir` and `logs` but never `versions`.
        // --all is opt-in for the destructive everything-including-installed-CLIs path.
        const anyExplicit = args.ir === true || args.logs === true || args.versions === true;
        const clearAll = args.all === true;
        const clearOptions = {
            ir: clearAll || (anyExplicit ? args.ir === true : true),
            logs: clearAll || (anyExplicit ? args.logs === true : true),
            versions: clearAll || (anyExplicit ? args.versions === true : false),
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
                    description: "Clear all cache entries including installed CLI versions",
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
                .option("versions", {
                    type: "boolean",
                    description: "Clear only installed CLI versions from the versions cache",
                    default: false
                })
                .option("dry-run", {
                    type: "boolean",
                    description: "Preview what would be cleared without deleting",
                    default: false
                })
    );
}
