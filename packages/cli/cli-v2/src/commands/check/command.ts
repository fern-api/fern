import chalk from "chalk";
import type { Argv } from "yargs";
import { ApiChecker } from "../../api/checker/ApiChecker.js";
import type { Context } from "../../context/Context.js";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { CliError } from "../../errors/CliError.js";
import { SdkChecker } from "../../sdk/checker/SdkChecker.js";
import { Icons } from "../../ui/format.js";
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

        const apiChecker = new ApiChecker({
            context,
            cliVersion: workspace.cliVersion
        });

        const apiCheckResult = await apiChecker.check({
            workspace,
            apiNames: args.api != null ? [args.api] : undefined,
            strict: args.strict
        });

        const sdkChecker = new SdkChecker({ context });
        const sdkCheckResult = sdkChecker.check({ workspace });

        const totalErrors =
            (apiCheckResult.invalidApis.size > 0 ? apiCheckResult.errorCount : 0) + sdkCheckResult.errorCount;
        const totalWarnings = apiCheckResult.warningCount + sdkCheckResult.warningCount;

        // Fail if there are errors, or if strict mode and there are warnings.
        if (totalErrors > 0 || (args.strict && totalWarnings > 0)) {
            throw CliError.exit();
        }

        if (totalWarnings > 0) {
            process.stderr.write(`${Icons.warning} ${chalk.yellow(`Found ${totalWarnings} warnings`)}\n`);
            process.stderr.write(chalk.dim("  Run 'fern check --strict' to treat warnings as errors\n"));
            return;
        }

        process.stderr.write(`${Icons.success} ${chalk.green("All checks passed")}\n`);
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
