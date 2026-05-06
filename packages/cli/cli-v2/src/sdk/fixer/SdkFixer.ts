import { getLatestGeneratorVersion } from "@fern-api/configuration-loader";

import chalk from "chalk";
import { FERN_YML_FILENAME } from "../../config/fern-yml/constants.js";
import { FernYmlEditor } from "../../config/fern-yml/FernYmlEditor.js";
import type { Context } from "../../context/Context.js";
import { Icons } from "../../ui/format.js";
import { Version } from "../../version.js";
import type { Workspace } from "../../workspace/Workspace.js";
import type { SdkChecker } from "../checker/SdkChecker.js";
import { getGeneratorIdFromImage } from "../config/converter/getGeneratorIdFromImage.js";
import type { Target } from "../config/Target.js";

export declare namespace SdkFixer {
    export interface FixResult {
        /** Number of violations that were automatically fixed */
        fixedCount: number;
        /** Descriptions of what was fixed */
        fixes: FixDescription[];
    }

    export interface FixDescription {
        targetName: string;
        description: string;
        oldValue: string;
        newValue: string;
    }
}

/**
 * Applies automatic fixes to SDK configuration issues detected by SdkChecker.
 *
 * Currently supports:
 *   - Replacing invalid or empty versions with the latest stable release.
 */
export class SdkFixer {
    private readonly context: Context;

    constructor({ context }: { context: Context }) {
        this.context = context;
    }

    /**
     * Attempt to fix SDK violations by modifying fern.yml.
     *
     * Only version-related violations are fixable. Returns the number of
     * fixes applied.
     */
    public async fix({
        workspace,
        violations
    }: {
        workspace: Workspace;
        violations: SdkChecker.ResolvedViolation[];
    }): Promise<SdkFixer.FixResult> {
        const fernYmlPath = workspace.absoluteFilePath;
        if (fernYmlPath == null) {
            return { fixedCount: 0, fixes: [] };
        }

        const targets = workspace.sdks?.targets;
        if (targets == null || targets.length === 0) {
            return { fixedCount: 0, fixes: [] };
        }

        const fixableViolations = violations.filter((v) => this.isVersionViolation(v));
        if (fixableViolations.length === 0) {
            return { fixedCount: 0, fixes: [] };
        }

        const editor = await FernYmlEditor.load({ fernYmlPath });
        const fixes: SdkFixer.FixDescription[] = [];

        for (const violation of fixableViolations) {
            const target = this.findTargetForViolation(targets, violation);
            if (target == null) {
                continue;
            }

            const latestVersion = await this.resolveLatestVersion(target);
            if (latestVersion == null) {
                this.context.stderr.info(
                    `${Icons.warning} ${chalk.yellow(`Could not resolve latest version for '${target.name}' — skipping fix`)}`
                );
                continue;
            }

            await editor.setTargetVersion(target.name, latestVersion);
            fixes.push({
                targetName: target.name,
                description: target.version.length === 0 ? "empty version replaced" : "invalid version replaced",
                oldValue: target.version.length === 0 ? "(empty)" : target.version,
                newValue: latestVersion
            });
        }

        if (fixes.length > 0) {
            await editor.save();
            this.displayFixes(fixes);
        }

        return { fixedCount: fixes.length, fixes };
    }

    private isVersionViolation(violation: SdkChecker.ResolvedViolation): boolean {
        return (
            violation.message.includes("does not exist for generator") ||
            violation.message === "Version must not be empty"
        );
    }

    private findTargetForViolation(targets: Target[], violation: SdkChecker.ResolvedViolation): Target | undefined {
        // Match by nodePath which contains the target name.
        const targetNameFromPath = violation.nodePath[2];
        if (typeof targetNameFromPath === "string") {
            return targets.find((t) => t.name === targetNameFromPath);
        }
        return undefined;
    }

    private async resolveLatestVersion(target: Target): Promise<string | undefined> {
        try {
            const generatorId = getGeneratorIdFromImage({ image: target.image });
            void generatorId;
            return await getLatestGeneratorVersion({
                generatorName: target.image,
                cliVersion: Version,
                channel: undefined,
                includeMajor: true
            });
        } catch {
            return undefined;
        }
    }

    private displayFixes(fixes: SdkFixer.FixDescription[]): void {
        this.context.stderr.info("");
        this.context.stderr.info(
            `${Icons.success} ${chalk.green(`Fixed ${fixes.length} SDK issue(s) in ${FERN_YML_FILENAME}:`)}`
        );
        for (const fix of fixes) {
            this.context.stderr.info(
                `  ${chalk.cyan(fix.targetName)}: ${chalk.dim(fix.oldValue)} ${chalk.white("\u2192")} ${chalk.green(fix.newValue)}`
            );
        }
    }
}
