import { CliError } from "@fern-api/task-context";

import chalk from "chalk";
import type { Argv } from "yargs";
import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { LegacyProjectAdapter } from "../../../../docs/adapter/LegacyProjectAdapter.js";
import { MdxParseValidator } from "../../../../docs/validator/MdxParseValidator.js";
import { Icons } from "../../../../ui/format.js";
import { command } from "../../../_internal/command.js";

export declare namespace CheckCommand {
    export interface Args extends GlobalArgs {}
}

export class CheckCommand {
    public async handle(context: Context, _args: CheckCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();

        if (workspace.docs == null) {
            throw new CliError({
                message:
                    "No docs configuration found in fern.yml.\n\n" +
                    "  Add a 'docs:' section to your fern.yml to get started.",
                code: CliError.Code.ConfigError
            });
        }

        const adapter = new LegacyProjectAdapter({ context });
        const project = await adapter.adapt(workspace);
        const docsWorkspace = project.docsWorkspaces;
        if (docsWorkspace == null) {
            throw new CliError({
                message:
                    "No docs configuration found in fern.yml.\n\n" +
                    "  Add a 'docs:' section to your fern.yml to get started.",
                code: CliError.Code.ConfigError
            });
        }

        const validator = new MdxParseValidator({ context });
        const { errors, totalFiles } = await validator.validate({ workspace: docsWorkspace });

        for (const error of errors) {
            context.stderr.info(`\n${error.toString()}\n`);
        }

        if (errors.length > 0) {
            context.stderr.info(
                `${Icons.error} ${chalk.red(`Found ${errors.length} MDX parse ${errors.length === 1 ? "error" : "errors"} across ${totalFiles} ${totalFiles === 1 ? "file" : "files"}`)}`
            );
            throw new CliError({ code: CliError.Code.ValidationError });
        }

        context.stderr.info(
            `${Icons.success} ${chalk.green(`All ${totalFiles} MDX ${totalFiles === 1 ? "file is" : "files are"} valid`)}`
        );
    }
}

export function addCheckCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new CheckCommand();
    command(cli, "check", "Validate MDX syntax in your docs", (context, args) =>
        cmd.handle(context, args as CheckCommand.Args)
    );
}
