import type { Argv } from "yargs";
import { ApiChecker } from "../../api/checker/ApiChecker.js";
import type { Context } from "../../context/Context.js";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { CliError } from "../../errors/CliError.js";
import type { Workspace } from "../../workspace/Workspace.js";
import { command } from "../_internal/command.js";

export declare namespace CheckCommand {
    export interface Args extends GlobalArgs {
        /** Validate a specific API */
        api?: string;
        /** Treat warnings as errors */
        strict: boolean;
    }
}

export class CheckCommand {
    public async handle(context: Context, args: CheckCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();

        this.validateArgs(args, workspace);

        const checker = new ApiChecker({
            context,
            cliVersion: workspace.cliVersion
        });

        const checkResult = await checker.check({
            workspace,
            apiNames: args.api != null ? [args.api] : undefined,
            strict: args.strict
        });

        const hasErrors = checkResult.invalidApis.size > 0;
        const hasWarnings = checkResult.warningCount > 0;

        // Fail if there are errors, or if strict mode and there are warnings.
        if (hasErrors || (args.strict && hasWarnings)) {
            throw CliError.exit();
        }
    }

    private validateArgs(args: CheckCommand.Args, workspace: Workspace): void {
        // Validate that the requested API exists if specified.
        if (args.api != null && workspace.apis[args.api] == null) {
            const availableApis = Object.keys(workspace.apis).join(", ");
            throw new CliError({
                message: `API '${args.api}' not found. Available APIs: ${availableApis}`
            });
        }
    }
}

export function addCheckCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new CheckCommand();
    command(
        cli,
        "check",
        "Validate your API, docs, and SDK configuration",
        (context, args) => cmd.handle(context, args as CheckCommand.Args),
        (yargs) =>
            yargs
                .option("api", {
                    type: "string",
                    description: "Validate a specific API"
                })
                .option("strict", {
                    type: "boolean",
                    description: "Treat warnings as errors",
                    default: false
                })
    );
}
