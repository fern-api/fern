import chalk from "chalk";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { Icons } from "../../../ui/format.js";
import { createUpdateService } from "../../../update/createUpdateService.js";
import { command } from "../../_internal/command.js";

export declare namespace ListCommand {
    export interface Args extends GlobalArgs {
        json?: boolean;
        "include-prereleases"?: boolean;
        limit?: number;
    }
}

export class ListCommand {
    public async handle(context: Context, args: ListCommand.Args): Promise<void> {
        const service = createUpdateService(context);
        const result = await service.listVersions({
            includePreReleases: args["include-prereleases"] === true,
            remoteLimit: args.limit ?? 10
        });

        if (args.json === true) {
            context.stdout.info(JSON.stringify(result, null, 2));
            return;
        }

        context.stdout.info("Installed Versions");
        context.stdout.info("==================");
        if (result.installed.length === 0) {
            context.stdout.info("  (none — run `fern update` to install the latest)");
        } else {
            for (const entry of result.installed) {
                const marker = entry.active ? `${Icons.success} ` : "  ";
                const presence = entry.installed ? "" : chalk.dim(" (binary missing)");
                context.stdout.info(`${marker}${entry.version}${presence}`);
            }
        }
        context.stdout.info("");

        context.stdout.info("Available Versions");
        context.stdout.info("==================");
        if (result.remote.length === 0) {
            context.stdout.info("  (no releases found or network unavailable)");
            return;
        }
        for (const entry of result.remote) {
            const marker = entry.active ? `${Icons.success} ` : entry.installed ? `${Icons.info} ` : "  ";
            const tags: string[] = [];
            if (entry.prerelease === true) {
                tags.push("prerelease");
            }
            if (entry.installed) {
                tags.push("installed");
            }
            const suffix = tags.length > 0 ? chalk.dim(`  (${tags.join(", ")})`) : "";
            context.stdout.info(`${marker}${entry.version}${suffix}`);
        }
    }
}

export function addListCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new ListCommand();
    command(
        cli,
        "list",
        "List installed and available CLI versions",
        (context, args) => cmd.handle(context, args as ListCommand.Args),
        (yargs) =>
            yargs
                .option("json", {
                    type: "boolean",
                    description: "Output in JSON format",
                    default: false
                })
                .option("include-prereleases", {
                    type: "boolean",
                    description: "Include prereleases in the remote listing",
                    default: false
                })
                .option("limit", {
                    type: "number",
                    description: "Maximum number of remote versions to fetch",
                    default: 10
                })
    );
}
