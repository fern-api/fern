import { CliError } from "@fern-api/task-context";

import chalk from "chalk";
import type { Argv } from "yargs";
import { ApiChecker } from "../../api/checker/ApiChecker.js";
import type { Context } from "../../context/Context.js";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { isClaudeCodeSession } from "../../context/isClaudeCodeSession.js";
import { DocsChecker } from "../../docs/checker/DocsChecker.js";
import { applyMdxFixes } from "../../docs/fixer/applyMdxFixes.js";
import { DocsFixer } from "../../docs/fixer/DocsFixer.js";
import { offerAiFixes } from "../../docs/fixer/offerAiFixes.js";
import { SdkChecker } from "../../sdk/checker/SdkChecker.js";
import { SdkFixer } from "../../sdk/fixer/SdkFixer.js";
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
        /** Automatically fix issues that have a known resolution */
        fix: boolean;
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

        // When a page fails MDX parsing, downstream rules that depend on
        // the parsed tree (e.g. `valid-markdown-links`) will surface a
        // generic "failed to initialize" violation against the same file.
        // Hide those duplicates — the rich MDX error already explains the
        // root cause far better. Apply this in both JSON and text paths for
        // consistency.
        const filesWithMdxParseErrors = new Set(docsCheckResult.mdxParseErrors.map((e) => e.displayRelativeFilepath));
        const mdxRawMessages = new Set(docsCheckResult.mdxParseErrors.map((e) => e.rawMessage));
        const filteredDocsViolations = docsCheckResult.violations.filter(
            (v) => !(filesWithMdxParseErrors.size > 0 && isMdxParseSymptom(v, filesWithMdxParseErrors, mdxRawMessages))
        );

        // docsCheckResult.errorCount already includes mdxParseErrors.length
        // (computed in DocsChecker as counts.errorCount + mdxResult.errors.length).
        const totalErrors =
            (apiCheckResult.invalidApis.size > 0 ? apiCheckResult.errorCount : 0) +
            sdkCheckResult.errorCount +
            docsCheckResult.errorCount;
        const totalWarnings = apiCheckResult.warningCount + sdkCheckResult.warningCount + docsCheckResult.warningCount;
        const hasErrors = totalErrors > 0 || (args.strict && totalWarnings > 0);

        if (args.json) {
            const response = this.buildJsonResponse({
                apiCheckResult,
                sdkCheckResult,
                docsCheckResult,
                filteredDocsViolations,
                hasErrors
            });
            context.stdout.info(JSON.stringify(response, null, 2));
            if (hasErrors) {
                throw new CliError({ code: CliError.Code.ValidationError });
            }
            return;
        }

        const violations: (
            | ApiChecker.ResolvedViolation
            | SdkChecker.ResolvedViolation
            | DocsChecker.ResolvedViolation
        )[] = [...apiCheckResult.violations, ...sdkCheckResult.violations, ...filteredDocsViolations];

        if (violations.length > 0) {
            this.displayViolations(violations);
        }

        let totalFixedCount = 0;

        if (docsCheckResult.mdxParseErrors.length > 0) {
            this.displayMdxParseErrors(context, docsCheckResult.mdxParseErrors);

            if (args.fix) {
                totalFixedCount += await applyMdxFixes(context, docsCheckResult.mdxParseErrors);
            } else {
                // Offer AI-assisted fixes when running interactively.
                // Skip when: non-TTY (CI), JSON mode, or inside a Claude Code session
                // (the AI is already in the IDE, so prompting here is redundant).
                const isTTY = process.stdout.isTTY === true;
                if (isTTY && !isClaudeCodeSession()) {
                    await offerAiFixes(context, docsCheckResult.mdxParseErrors);
                }
            }
        }

        // Apply SDK fixes when --fix is specified.
        if (args.fix && sdkCheckResult.violations.length > 0) {
            const sdkFixer = new SdkFixer({ context });
            const sdkFixResult = await sdkFixer.fix({ workspace, violations: sdkCheckResult.violations });
            totalFixedCount += sdkFixResult.fixedCount;
        }

        // Apply docs config fixes when --fix is specified.
        if (args.fix && filteredDocsViolations.length > 0) {
            const docsFixer = new DocsFixer({ context });
            const docsFixResult = await docsFixer.fix({ workspace, violations: filteredDocsViolations });
            totalFixedCount += docsFixResult.fixedCount;
        }

        // Fail if there are errors and either --fix was not used, or --fix ran but
        // could not resolve any violations (non-fixable errors remain).
        if (hasErrors && (!args.fix || totalFixedCount === 0)) {
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

    private displayMdxParseErrors(context: Context, errors: DocsChecker.Result["mdxParseErrors"]): void {
        for (const error of errors) {
            // The rich, multi-line Rust-style render lives on `toString`.
            // Surround each error with blank lines so they're visually distinct.
            context.stderr.info(`\n${error.toString()}\n`);
        }
    }

    private buildJsonResponse({
        apiCheckResult,
        sdkCheckResult,
        docsCheckResult,
        filteredDocsViolations,
        hasErrors
    }: {
        apiCheckResult: ApiChecker.Result;
        sdkCheckResult: SdkChecker.Result;
        docsCheckResult: DocsChecker.Result;
        filteredDocsViolations: DocsChecker.ResolvedViolation[];
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

        if (filteredDocsViolations.length > 0 || docsCheckResult.mdxParseErrors.length > 0) {
            results.docs = [
                ...filteredDocsViolations.map((v) => toJsonViolation(v)),
                ...docsCheckResult.mdxParseErrors.map((e) => ({
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

/**
 * Returns true if a docs violation is a downstream symptom of an MDX parse
 * failure that we have already surfaced via {@link MdxParseError}.
 *
 * Two matching strategies:
 * 1. Path-based: the violation message contains the failing file's path/suffix
 *    (e.g. `valid-markdown` rule: "Markdown failed to parse: ... user.mdx").
 * 2. Raw-message-based: the violation message contains the raw parser error
 *    verbatim (e.g. `valid-markdown-links` "failed to initialize" violations
 *    embed the parse error but not the filepath).
 */
function isMdxParseSymptom(
    violation: DocsChecker.ResolvedViolation,
    filesWithMdxParseErrors: Set<string>,
    mdxRawMessages: Set<string>
): boolean {
    // Matches both "Markdown failed to parse: ..." (valid-markdown rule),
    // "Rule X failed to initialize: ..." (valid-markdown-links rule), and
    // other downstream "failed to parse" / "failed to initialize" variants.
    if (!/failed to parse|failed to initialize/i.test(violation.message)) {
        return false;
    }

    // Strategy 1: the violation message contains the raw MDX parse error.
    // This covers rules like valid-markdown-links that embed the error message
    // but not the filepath.
    for (const rawMessage of mdxRawMessages) {
        if (rawMessage.length > 0 && violation.message.includes(rawMessage)) {
            return true;
        }
    }

    // Strategy 2: the violation message contains the failing file's path or a
    // suffix of it (cwd-relative vs fern-folder-relative paths may differ).
    for (const filepath of filesWithMdxParseErrors) {
        if (violation.message.includes(filepath)) {
            return true;
        }
        // Use at least two path segments to avoid false matches between files
        // that share only a basename (e.g. api/intro.mdx vs sdk/intro.mdx).
        const parts = filepath.split("/").filter(Boolean);
        for (let len = parts.length; len >= 2; len--) {
            const suffix = parts.slice(parts.length - len).join("/");
            if (violation.message.includes(suffix)) {
                return true;
            }
        }
        // Only fall back to single-segment (basename) matching when there is
        // no directory component to disambiguate.
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
                .option("fix", {
                    type: "boolean",
                    description: "Automatically fix issues that have a known resolution",
                    default: false
                })
    );
}
