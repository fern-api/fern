import { CliError } from "@fern-api/task-context";

import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { Migrator } from "../../../migrator/index.js";
import { command } from "../../_internal/command.js";

export declare namespace MigrateCommand {
    export interface Args extends GlobalArgs {
        /**
         * If set, the original configuration files will not be deleted after migration.
         */
        delete: boolean;
    }
}

export class MigrateCommand {
    public async handle(context: Context, args: MigrateCommand.Args): Promise<void> {
        const migrator = new Migrator({
            cwd: context.cwd,
            logger: context.stdout,
            deleteOriginals: args.delete
        });

        const result = await migrator.migrate();
        for (const warning of result.warnings) {
            switch (warning.type) {
                case "deprecated":
                    context.stdout.warn(`Deprecated: ${warning.message}`);
                    break;
                case "unsupported":
                    context.stdout.warn(`Unsupported: ${warning.message}`);
                    break;
                case "conflict":
                    context.stderr.error(`Error: ${warning.message}`);
                    break;
                case "info":
                    context.stdout.info(warning.message);
                    break;
            }
            if (warning.suggestion != null) {
                context.stdout.info(`  Suggestion: ${warning.suggestion}`);
            }
        }

        if (result.success) {
            if (result.outputPath != null) {
                context.stdout.debug(`Created: ${result.outputPath}`);
            }
            return;
        }

        throw new CliError({ message: "Migration failed", code: CliError.Code.ConfigError });
    }
}

export function addMigrateCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new MigrateCommand();
    command(
        cli,
        "migrate",
        "Migrate legacy configuration files to fern.yml",
        (context, args) => cmd.handle(context, args as MigrateCommand.Args),
        (yargs) =>
            yargs.option("delete", {
                type: "boolean",
                description: "Keep original files after migration",
                default: true
            })
    );
}
