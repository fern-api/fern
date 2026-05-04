import { CliError } from "@fern-api/task-context";

import chalk from "chalk";
import type { Argv } from "yargs";
import { ApiChecker } from "../../api/checker/ApiChecker.js";
import type { Context } from "../../context/Context.js";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { DocsChecker } from "../../docs/checker/DocsChecker.js";
import { SdkChecker } from "../../sdk/checker/SdkChecker.js";
import { Icons } from "../../ui/format.js";
import type { Workspace } from "../../workspace/Workspace.js";
import { command } from "../_internal/command.js";
import { type JsonOutput, toJsonViolation } from "../_internal/toJsonViolation.js";

export declare namespace CheckCommand {
    export interface Args extends GlobalArgs {
        /** Validate a specific API */
        api?: string;
        /** Treat warnings as errors */
        strict: boolean;
        /** Output results as JSON to stdout */
        json: boolean;
    }
}

export class CheckCommand {
    public async handle(context: Context, args: CheckCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();

        this.validateArgs(args, workspace);

        const { apiCheckResult, sdkCheckResult, docsCheckResult } = await this.runChecks({
            context,
            workspace,
            args
        });

        const totalErrors =
            (apiCheckResult.invalidApis.size > 0 ? apiCheckResult.errorCount : 0) +
            sdkCheckResult.errorCount +
            docsCheckResult.errorCount;
        const totalWarnings = apiCheckResult.warningCount + sdkCheckResult.warningCount + docsCheckResult.warningCount;
        const hasErrors = totalErrors > 0 || (args.strict && totalWarnings > 0);

        if (args.json) {
            const response = this.buildJsonResponse({ apiCheckResult, sdkCheckResult, docsCheckResult, hasErrors });
            context.stdout.info(JSON.stringify(response, null, 2));
            if (hasErrors) {
                throw new CliError({ code: CliError.Code.ValidationError });
            }
            return;
        }

        // Fail if there are errors, or if strict mode and there are warnings.
        if (hasErrors) {
            throw new CliError({ code: CliError.Code.ValidationError });
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
        args
    }: {
        context: Context;
        workspace: Workspace;
        args: CheckCommand.Args;
    }): Promise<{
        apiCheckResult: ApiChecker.Result;
        sdkCheckResult: SdkChecker.Result;
        docsCheckResult: DocsChecker.Result;
    }> {
        const apiChecker = new ApiChecker({
            context,
            cliVersion: workspace.cliVersion
        });
        const apiCheckResult = await apiChecker.check({ workspace, strict: args.strict });

        const sdkChecker = new SdkChecker({ context });
        const sdkCheckResult = await sdkChecker.check({ workspace });

        const docsChecker = new DocsChecker({ context });
        const docsCheckResult = await docsChecker.check({ workspace, strict: args.strict });

        if (!args.json) {
            const violations: (
                | ApiChecker.ResolvedViolation
                | SdkChecker.ResolvedViolation
                | DocsChecker.ResolvedViolation
            )[] = [...apiCheckResult.violations, ...sdkCheckResult.violations, ...docsCheckResult.violations];

            if (violations.length > 0) {
                this.displayViolations(violations);
            }
        }

        return { apiCheckResult, sdkCheckResult, docsCheckResult };
    }

    private displayViolations(
        violations: Array<{
            displayRelativeFilepath: string;
            line: number;
            column: number;
            message: string;
            severity: string;
        }>
    ): void {
        for (const v of violations) {
            const color = v.severity === "warning" ? chalk.yellow : chalk.red;
            process.stderr.write(`${color(`${v.displayRelativeFilepath}:${v.line}:${v.column}: ${v.message}`)}\n`);
        }
    }

    private buildJsonResponse({
        apiCheckResult,
        sdkCheckResult,
        docsCheckResult,
        hasErrors
    }: {
        apiCheckResult: ApiChecker.Result;
        sdkCheckResult: SdkChecker.Result;
        docsCheckResult: DocsChecker.Result;
        hasErrors: boolean;
    }): JsonOutput.Response {
        const results: JsonOutput.Results = {};

        const showApiNames = new Set(apiCheckResult.violations.map((v) => v.apiName)).size > 1;
        if (apiCheckResult.violations.length > 0) {
            results.apis = apiCheckResult.violations.map((v) =>
                toJsonViolation(v, showApiNames ? { api: v.apiName } : undefined)
            );
        }

        if (sdkCheckResult.violations.length > 0) {
            results.sdks = sdkCheckResult.violations.map((v) => toJsonViolation(v));
        }

        if (docsCheckResult.violations.length > 0) {
            results.docs = docsCheckResult.violations.map((v) => toJsonViolation(v));
        }

        return {
            success: !hasErrors,
            results
        };
    }

    private validateArgs(args: CheckCommand.Args, workspace: Workspace): void {
        // Validate that the requested API exists if specified.
        if (args.api != null && workspace.apis[args.api] == null) {
            const availableApis = Object.keys(workspace.apis).join(", ");
            throw new CliError({
                message: `API '${args.api}' not found. Available APIs: ${availableApis}`,
                code: CliError.Code.ConfigError
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
                .option("json", {
                    type: "boolean",
                    description: "Output results as JSON to stdout",
                    default: false
                })
    );
}
