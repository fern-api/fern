import { CliError } from "@fern-api/task-context";

import chalk from "chalk";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { isClaudeCodeSession } from "../../../context/isClaudeCodeSession.js";
import { DocsChecker } from "../../../docs/checker/DocsChecker.js";
import { applyMdxFixes } from "../../../docs/fixer/applyMdxFixes.js";
import { DocsFixer } from "../../../docs/fixer/DocsFixer.js";
import { offerAiFixes } from "../../../docs/fixer/offerAiFixes.js";
import { Icons } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";
import { type JsonOutput, toJsonViolation } from "../../_internal/toJsonViolation.js";

export declare namespace CheckCommand {
    export interface Args extends GlobalArgs {
        /** Treat warnings as errors */
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

        // Suppress downstream "failed to initialize" violations that are
        // symptom duplicates of MDX parse errors we surface with rich formatting.
        const filesWithMdxParseErrors = new Set(result.mdxParseErrors.map((e) => e.displayRelativeFilepath));
        const mdxRawMessages = new Set(result.mdxParseErrors.map((e) => e.rawMessage));
        const filteredViolations = result.violations.filter(
            (v) => !(filesWithMdxParseErrors.size > 0 && isMdxParseSymptom(v, filesWithMdxParseErrors, mdxRawMessages))
        );

        const hasErrors = result.hasErrors || (args.strict && result.hasWarnings);

        if (args.json) {
            const response = this.buildJsonResponse({ result, filteredViolations, hasErrors });
            context.stdout.info(JSON.stringify(response, null, 2));
            if (hasErrors) {
                throw new CliError({ code: CliError.Code.ValidationError });
            }
            return;
        }

        if (filteredViolations.length > 0) {
            for (const v of filteredViolations) {
                const color = v.severity === "warning" ? chalk.yellow : chalk.red;
                process.stderr.write(`${color(`${v.displayRelativeFilepath}:${v.line}:${v.column}: ${v.message}`)}\n`);
            }
        }

        let totalFixedCount = 0;

        if (result.mdxParseErrors.length > 0) {
            for (const error of result.mdxParseErrors) {
                context.stderr.info(`\n${error.toString()}\n`);
            }

            if (args.fix) {
                totalFixedCount += await applyMdxFixes(context, result.mdxParseErrors);
            } else {
                const isTTY = process.stdout.isTTY === true;
                if (isTTY && !isClaudeCodeSession()) {
                    await offerAiFixes(context, result.mdxParseErrors);
                }
            }
        }

        // Apply docs config fixes when --fix is specified.
        if (args.fix && filteredViolations.length > 0) {
            const docsFixer = new DocsFixer({ context });
            const fixResult = await docsFixer.fix({ workspace, violations: filteredViolations });
            totalFixedCount += fixResult.fixedCount;
        }

        // Fail if there are errors and either --fix was not used, or --fix ran but
        // could not resolve any violations (non-fixable errors remain).
        if (hasErrors && (!args.fix || totalFixedCount === 0)) {
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
        filteredViolations,
        hasErrors
    }: {
        result: DocsChecker.Result;
        filteredViolations: DocsChecker.ResolvedViolation[];
        hasErrors: boolean;
    }): JsonOutput.Response {
        const results: JsonOutput.Results = {};
        if (filteredViolations.length > 0 || result.mdxParseErrors.length > 0) {
            results.docs = [
                ...filteredViolations.map((v) => toJsonViolation(v)),
                ...result.mdxParseErrors.map((e) => ({
                    severity: "error",
                    rule: e.code.code,
                    filepath: e.displayRelativeFilepath,
                    ...(e.line != null ? { line: e.line } : {}),
                    ...(e.column != null ? { column: e.column } : {}),
                    message: `[${e.code.code}] ${e.code.title}: ${e.rawMessage}`
                }))
            ];
        }
        return {
            success: !hasErrors,
            results
        };
    }
}

/**
 * Returns true if a docs violation is a downstream symptom of an MDX parse
 * failure that we have already surfaced with rich formatting.
 */
function isMdxParseSymptom(
    violation: DocsChecker.ResolvedViolation,
    filesWithMdxParseErrors: Set<string>,
    mdxRawMessages: Set<string>
): boolean {
    if (!/failed to parse|failed to initialize/i.test(violation.message)) {
        return false;
    }

    // Check if the violation message contains the raw MDX parse error.
    for (const rawMessage of mdxRawMessages) {
        if (rawMessage.length > 0 && violation.message.includes(rawMessage)) {
            return true;
        }
    }

    // Check if the violation message references the failing file path.
    for (const filepath of filesWithMdxParseErrors) {
        if (violation.message.includes(filepath)) {
            return true;
        }
        const parts = filepath.split("/").filter(Boolean);
        for (let len = parts.length; len >= 2; len--) {
            const suffix = parts.slice(parts.length - len).join("/");
            if (violation.message.includes(suffix)) {
                return true;
            }
        }
        if (parts.length === 1) {
            const basename = parts[0];
            if (basename != null && violation.message.includes(basename)) {
                return true;
            }
        }
    }
    return false;
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
                .option("fix", {
                    type: "boolean",
                    description: "Automatically fix issues that have a known resolution",
                    default: false
                })
    );
}
