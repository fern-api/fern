import { CliError } from "@fern-api/task-context";

import chalk from "chalk";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { DocsChecker } from "../../../docs/checker/DocsChecker.js";
import { Icons } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";
import { type JsonOutput, toJsonViolation } from "../../_internal/toJsonViolation.js";

export declare namespace CheckCommand {
    export interface Args extends GlobalArgs {
        /** Treat warnings as errors */
        strict: boolean;
        /** Output results as JSON to stdout */
        json: boolean;
    }
}

export class CheckCommand {
    public async handle(context: Context, args: CheckCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();

        if (workspace.docs == null) {
            throw new CliError({
                message:
                    "No docs configuration found in fern.yml.\n\n" +
                    "  Add a 'docs:' section to your fern.yml to get started.",
                code: CliError.Code.ConfigError
            });
        }

        const checker = new DocsChecker({ context });
        const result = await checker.check({ workspace, strict: args.strict });

        const hasErrors = result.hasErrors || (args.strict && result.hasWarnings);

        if (args.json) {
            const response = this.buildJsonResponse({ result, hasErrors });
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

        if (hasErrors) {
            throw new CliError({ code: CliError.Code.ValidationError });
        }

        if (result.warningCount > 0) {
            context.stderr.info(`${Icons.warning} ${chalk.yellow(`Found ${result.warningCount} warnings`)}`);
            context.stderr.info(chalk.dim("  Run 'fern docs check --strict' to treat warnings as errors"));
            return;
        }

        context.stderr.info(`${Icons.success} ${chalk.green("All checks passed")}`);
    }

    private buildJsonResponse({
        result,
        hasErrors
    }: {
        result: DocsChecker.Result;
        hasErrors: boolean;
    }): JsonOutput.Response {
        const results: JsonOutput.Results = {};
        if (result.violations.length > 0) {
            results.docs = result.violations.map((v) => toJsonViolation(v));
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
        "Validate docs configuration",
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
    );
}
