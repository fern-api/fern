import { CliError } from "@fern-api/task-context";
import chalk from "chalk";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { SdkChecker } from "../../../sdk/checker/SdkChecker.js";
import { SdkFixer } from "../../../sdk/fixer/SdkFixer.js";
import { Icons } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";
import { type JsonOutput, toJsonViolation } from "../../_internal/toJsonViolation.js";

export declare namespace CheckCommand {
    export interface Args extends GlobalArgs {
        /** Treat warnings as errors. */
        strict: boolean;
        /** Output results as JSON to stdout */
        json: boolean;
        /** Automatically fix issues that have a known resolution */
        fix: boolean;
    }
}

export class CheckCommand {
    public async handle(context: Context, args: CheckCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();

        const checker = new SdkChecker({ context });
        const result = await checker.check({ workspace });

        const hasErrors = result.errorCount > 0 || (args.strict && result.warningCount > 0);

        if (args.json) {
            const response = this.buildJsonResponse({ sdkCheckResult: result, hasErrors });
            context.stdout.info(JSON.stringify(response, null, 2));
            if (hasErrors) {
                throw new CliError({ code: CliError.Code.ValidationError });
            }
            return;
        }

        if (result.violations.length > 0) {
            for (const v of result.violations) {
                const color = v.severity === "warning" ? chalk.yellow : chalk.red;
                process.stderr.write(`${color(`${v.displayRelativeFilepath}:${v.line}:${v.column}: ${v.message}`)}\n`);
            }
        }

        // Apply SDK fixes when --fix is specified.
        let sdkFixedCount = 0;
        if (args.fix && result.violations.length > 0) {
            const sdkFixer = new SdkFixer({ context });
            const fixResult = await sdkFixer.fix({ workspace, violations: result.violations });
            sdkFixedCount = fixResult.fixedCount;
        }

        // Fail if there are errors and either --fix was not used, or --fix ran but
        // could not resolve any violations (non-fixable errors remain).
        if (hasErrors && (!args.fix || sdkFixedCount === 0)) {
            throw new CliError({ code: CliError.Code.ValidationError });
        }

        if (result.warningCount > 0) {
            context.stderr.info(`${Icons.warning} ${chalk.yellow(`Found ${result.warningCount} warnings`)}`);
            context.stderr.info(chalk.dim("  Run 'fern sdk check --strict' to treat warnings as errors"));
            return;
        }

        context.stderr.info(`${Icons.success} ${chalk.green("All checks passed")}`);
    }

    private buildJsonResponse({
        sdkCheckResult,
        hasErrors
    }: {
        sdkCheckResult: SdkChecker.Result;
        hasErrors: boolean;
    }): JsonOutput.Response {
        const results: JsonOutput.Results = {};

        if (sdkCheckResult.violations.length > 0) {
            results.sdks = sdkCheckResult.violations.map((v) => toJsonViolation(v));
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
        "Validate SDK configuration",
        (context, args) => cmd.handle(context, args as CheckCommand.Args),
        (yargs) =>
            yargs
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
                .option("fix", {
                    type: "boolean",
                    description: "Automatically fix issues that have a known resolution",
                    default: false
                })
    );
}
