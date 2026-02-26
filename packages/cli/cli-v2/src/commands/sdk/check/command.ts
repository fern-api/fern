import chalk from "chalk";
import type { Argv } from "yargs";
import { ApiChecker } from "../../../api/checker/ApiChecker.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { CliError } from "../../../errors/CliError.js";
import { SdkChecker } from "../../../sdk/checker/SdkChecker.js";
import { Icons } from "../../../ui/format.js";
import type { Workspace } from "../../../workspace/Workspace.js";
import { command } from "../../_internal/command.js";

export declare namespace SdkCheckCommand {
    export interface Args extends GlobalArgs {
        /** Validate a specific API */
        api?: string;
        /** Treat warnings as errors */
        strict: boolean;
    }
}

export class SdkCheckCommand {
    public async handle(context: Context, args: SdkCheckCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();

        this.validateArgs(args, workspace);

        // Run API checks first since SDKs depend on valid APIs.
        const apiChecker = new ApiChecker({
            context,
            cliVersion: workspace.cliVersion
        });

        const apiCheckResult = await apiChecker.check({
            workspace,
            apiNames: args.api != null ? [args.api] : undefined,
            strict: args.strict
        });

        // Run SDK-specific checks.
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
            process.stderr.write(chalk.dim("  Run 'fern sdk check --strict' to treat warnings as errors\n"));
            return;
        }

        process.stderr.write(`${Icons.success} ${chalk.green("All SDK checks passed")}\n`);
    }

    private validateArgs(args: SdkCheckCommand.Args, workspace: Workspace): void {
        // Validate that the requested API exists if specified.
        if (args.api != null && workspace.apis[args.api] == null) {
            const availableApis = Object.keys(workspace.apis).join(", ");
            throw new CliError({
                message: `API '${args.api}' not found. Available APIs: ${availableApis}`
            });
        }
    }
}

export function addCheckCommand(cli: Argv<GlobalArgs>, parentPath?: string): void {
    const cmd = new SdkCheckCommand();
    command(
        cli,
        "check",
        "Validate your API and SDK configuration",
        (context, args) => cmd.handle(context, args as SdkCheckCommand.Args),
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
                }),
        parentPath
    );
}
