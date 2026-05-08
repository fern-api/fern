import chalk from "chalk";
import { FERN_YML_FILENAME } from "../../config/fern-yml/constants.js";
import { FernYmlEditor } from "../../config/fern-yml/FernYmlEditor.js";
import type { Context } from "../../context/Context.js";
import { Icons } from "../../ui/format.js";
import type { Workspace } from "../../workspace/Workspace.js";
import type { DocsChecker } from "../checker/DocsChecker.js";

export declare namespace DocsFixer {
    export interface FixResult {
        /** Number of violations that were automatically fixed */
        fixedCount: number;
        /** Descriptions of what was fixed */
        fixes: FixDescription[];
    }

    export interface FixDescription {
        field: string;
        description: string;
        oldValue: string;
        newValue: string;
    }
}

/**
 * Applies automatic fixes to docs configuration issues detected by DocsChecker.
 *
 * Currently supports:
 *   - Replacing invalid instance URLs with the computed suggestion (e.g. dots → dashes).
 */
export class DocsFixer {
    private readonly context: Context;

    constructor({ context }: { context: Context }) {
        this.context = context;
    }

    public async fix({
        workspace,
        violations
    }: {
        workspace: Workspace;
        violations: DocsChecker.ResolvedViolation[];
    }): Promise<DocsFixer.FixResult> {
        const fernYmlPath = workspace.absoluteFilePath;
        if (fernYmlPath == null) {
            return { fixedCount: 0, fixes: [] };
        }

        const fixableViolations = violations.filter((v) => this.isInstanceUrlViolation(v));
        if (fixableViolations.length === 0) {
            return { fixedCount: 0, fixes: [] };
        }

        const editor = await FernYmlEditor.load({ fernYmlPath });
        const fixes: DocsFixer.FixDescription[] = [];

        for (const violation of fixableViolations) {
            const parsed = this.parseInstanceUrlViolation(violation);
            if (parsed == null) {
                continue;
            }

            await editor.setDocsInstanceUrl(parsed.index, parsed.suggestion);
            fixes.push({
                field: `instances[${parsed.index}].url`,
                description: "invalid instance URL replaced with suggestion",
                oldValue: parsed.originalUrl,
                newValue: parsed.suggestion
            });
        }

        if (fixes.length > 0) {
            await editor.save();
            this.displayFixes(fixes);
        }

        return { fixedCount: fixes.length, fixes };
    }

    private isInstanceUrlViolation(violation: DocsChecker.ResolvedViolation): boolean {
        return violation.message.includes("Invalid instance URL") && violation.message.includes("Suggestion:");
    }

    private parseInstanceUrlViolation(
        violation: DocsChecker.ResolvedViolation
    ): { index: number; originalUrl: string; suggestion: string } | undefined {
        // Message format: `instances[0].url: Invalid instance URL "old.url": ... Suggestion: new-url`
        const indexMatch = /instances\[(\d+)\]\.url/.exec(violation.message);
        const urlMatch = /Invalid instance URL "([^"]+)"/.exec(violation.message);
        const suggestionMatch = /Suggestion:\s*(\S+)/.exec(violation.message);

        if (indexMatch?.[1] == null || urlMatch?.[1] == null || suggestionMatch?.[1] == null) {
            return undefined;
        }

        return {
            index: Number.parseInt(indexMatch[1], 10),
            originalUrl: urlMatch[1],
            suggestion: suggestionMatch[1]
        };
    }

    private displayFixes(fixes: DocsFixer.FixDescription[]): void {
        this.context.stderr.info("");
        this.context.stderr.info(
            `${Icons.success} ${chalk.green(`Fixed ${fixes.length} docs issue(s) in ${FERN_YML_FILENAME}:`)}`
        );
        for (const fix of fixes) {
            this.context.stderr.info(
                `  ${chalk.dim("•")} ${chalk.bold(fix.field)}: ${fix.description} (${chalk.red(fix.oldValue)} → ${chalk.green(fix.newValue)})`
            );
        }
    }
}
