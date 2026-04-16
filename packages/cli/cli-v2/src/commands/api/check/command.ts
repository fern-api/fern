import { CliError } from "@fern-api/task-context";

import chalk from "chalk";
import type { Argv } from "yargs";
import { ApiChecker } from "../../../api/checker/ApiChecker.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { Icons } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";
import { type JsonOutput, toJsonViolation } from "../../_internal/toJsonViolation.js";

export declare namespace CheckCommand {
    export interface Args extends GlobalArgs {
        /** Validate a specific API */
        api?: string;
        /** Treat warnings as errors. */
        strict: boolean;
        /** Output results as JSON to stdout */
        json: boolean;
    }
}

export class CheckCommand {
    public async handle(context: Context, args: CheckCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();

        if (args.api != null && workspace.apis[args.api] == null) {
            const availableApis = Object.keys(workspace.apis).join(", ");
            throw new CliError({
                message: `API '${args.api}' not found. Available APIs: ${availableApis}`,
                code: CliError.Code.ConfigError
            });
        }

        const checker = new ApiChecker({ context, cliVersion: workspace.cliVersion });
        const result = await checker.check({
            workspace,
            apiNames: args.api != null ? [args.api] : undefined,
            strict: args.strict
        });

        const hasErrors = result.invalidApis.size > 0 || (args.strict && result.warningCount > 0);

        if (args.json) {
            const response = this.buildJsonResponse({ apiCheckResult: result, hasErrors });
            context.stdout.info(JSON.stringify(response, null, 2));
            if (hasErrors) {
                throw CliError.validationError();
            }
            return;
        }

        if (result.violations.length > 0) {
            for (const v of result.violations) {
                const color = v.severity === "warning" ? chalk.yellow : chalk.red;
                process.stderr.write(`${color(`${v.displayRelativeFilepath}:${v.line}:${v.column}: ${v.message}`)}\n`);
            }
        }

        if (hasErrors) {
            throw CliError.validationError();
        }

        if (result.warningCount > 0) {
            context.stderr.info(`${Icons.warning} ${chalk.yellow(`Found ${result.warningCount} warnings`)}`);
            context.stderr.info(chalk.dim("  Run 'fern api check --strict' to treat warnings as errors"));
            return;
        }

        context.stderr.info(`${Icons.success} ${chalk.green("All checks passed")}`);
    }

    private buildJsonResponse({
        apiCheckResult,
        hasErrors
    }: {
        apiCheckResult: ApiChecker.Result;
        hasErrors: boolean;
    }): JsonOutput.Response {
        const results: JsonOutput.Results = {};

        const showApiNames = new Set(apiCheckResult.violations.map((v) => v.apiName)).size > 1;
        if (apiCheckResult.violations.length > 0) {
            results.apis = apiCheckResult.violations.map((v) =>
                toJsonViolation(v, showApiNames ? { api: v.apiName } : undefined)
            );
        }

        return {
            success: !hasErrors,
            results
        };
    }
}

export function addCheckCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new CheckCommand();
    command(
        cli,
        "check",
        "Validate API definitions",
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
                .option("json", {
                    type: "boolean",
                    description: "Output results as JSON to stdout",
                    default: false
                })
    );
}
