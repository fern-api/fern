import chalk from "chalk";
import type { Argv } from "yargs";
import type { Context } from "../../context/Context.js";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { Icons } from "../../ui/format.js";
import { createUpdateService } from "../../update/createUpdateService.js";
import { commandWithSubcommands } from "../_internal/commandWithSubcommands.js";
import { addListCommand } from "./list/index.js";
import { addUseCommand } from "./use/index.js";

export declare namespace UpdateCommand {
    export interface Args extends GlobalArgs {
        to?: string;
        check?: boolean;
        force?: boolean;
        "no-activate"?: boolean;
        "include-prereleases"?: boolean;
    }
}

export class UpdateCommand {
    public async handle(context: Context, args: UpdateCommand.Args): Promise<void> {
        const service = createUpdateService(context);

        if (args.check === true) {
            const result = await service.checkLatest({
                includePreReleases: args["include-prereleases"] === true
            });
            if (result.isUpgradeAvailable) {
                context.stdout.info(
                    `${Icons.info} A newer version is available: ${chalk.cyan(result.latestVersion)} (current: ${
                        result.currentVersion
                    })`
                );
                context.stdout.info(`  Run ${chalk.bold("fern update")} to install it.`);
            } else {
                context.stdout.info(
                    `${Icons.success} Already on the latest version (${chalk.cyan(result.currentVersion)})`
                );
            }
            return;
        }

        const requestedVersion = args.to;
        const includePreReleases = args["include-prereleases"] === true;
        const targetVersion = requestedVersion ?? (await service.checkLatest({ includePreReleases })).latestVersion;

        const switchActive = args["no-activate"] !== true;
        const force = args.force === true;

        context.stdout.info(`Installing fern ${chalk.cyan(targetVersion)}...`);
        const result = await service.installVersion({ version: targetVersion, switchActive, force });

        const downloadedNote = result.downloaded ? "downloaded and installed" : "already installed";
        context.stdout.info(`${Icons.success} fern ${chalk.cyan(result.version)} ${downloadedNote}`);
        if (result.switchedActive) {
            context.stdout.info(`${Icons.success} Switched active version to ${chalk.cyan(result.version)}`);
        } else if (!switchActive) {
            context.stdout.info("  Active version was not changed (--no-activate).");
        }
    }
}

export function addUpdateCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new UpdateCommand();
    commandWithSubcommands(
        cli,
        "update",
        "Install and switch between CLI versions",
        (context, args) => cmd.handle(context, args as UpdateCommand.Args),
        (yargs) =>
            yargs
                .option("to", {
                    type: "string",
                    description: "Specific version to install (e.g. 1.2.3). Defaults to latest."
                })
                .option("check", {
                    type: "boolean",
                    description: "Check for the latest version without installing anything",
                    default: false
                })
                .option("force", {
                    type: "boolean",
                    description: "Re-download the binary even if it is already in the cache",
                    default: false
                })
                .option("no-activate", {
                    type: "boolean",
                    description: "Install the version but do not switch the active version",
                    default: false
                })
                .option("include-prereleases", {
                    type: "boolean",
                    description: "Allow prereleases when resolving the latest version",
                    default: false
                }),
        [addListCommand, addUseCommand]
    );
}
