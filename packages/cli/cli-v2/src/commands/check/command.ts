import chalk from "chalk";
import type { Argv } from "yargs";
import { ApiChecker } from "../../api/checker/ApiChecker.js";
import { FernYmlSchemaLoader } from "../../config/fern-yml/FernYmlSchemaLoader.js";
import type { Context } from "../../context/Context.js";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { CliError } from "../../errors/CliError.js";
import { SdkChecker } from "../../sdk/checker/SdkChecker.js";
import { Icons } from "../../ui/format.js";
import type { Workspace } from "../../workspace/Workspace.js";
import { WorkspaceLoader } from "../../workspace/WorkspaceLoader.js";
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
        const schemaLoader = new FernYmlSchemaLoader({ cwd: context.cwd });
        const fernYml = await schemaLoader.loadOrThrow();

        context.telemetry.tag({ org: fernYml.data.org });

        const loader = new WorkspaceLoader({ cwd: context.cwd, logger: context.stderr });
        const workspace = await loader.loadOrThrow({ fernYml });

        this.validateArgs(args, workspace);

        const { totalErrors, totalWarnings } = await this.runChecks({ context, workspace, fernYml });

        // Fail if there are errors, or if strict mode and there are warnings.
        if (totalErrors > 0 || (args.strict && totalWarnings > 0)) {
            throw CliError.exit();
        }

        if (totalWarnings > 0) {
            context.stderr.info(`${Icons.warning} ${chalk.yellow(`Found ${totalWarnings} warnings`)}`);
            context.stderr.info(chalk.dim("  Run 'fern check --strict' to treat warnings as errors"));
            return;
        }

        context.stderr.info(`${Icons.success} ${chalk.green("All checks passed")}`);
    }

    private async runChecks({
        context,
        workspace,
        fernYml
    }: {
        context: Context;
        workspace: Workspace;
        fernYml: FernYmlSchemaLoader.Success;
    }): Promise<{ totalErrors: number; totalWarnings: number }> {
        const apiChecker = new ApiChecker({
            context,
            cliVersion: workspace.cliVersion
        });
        const apiCheckResult = await apiChecker.check({
            workspace
        });

        const sdkChecker = new SdkChecker({ context });
        const sdkCheckResult = await sdkChecker.check({ workspace, fernYml });

        return {
            totalErrors:
                (apiCheckResult.invalidApis.size > 0 ? apiCheckResult.errorCount : 0) + sdkCheckResult.errorCount,
            totalWarnings: apiCheckResult.warningCount + sdkCheckResult.warningCount
        };
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
