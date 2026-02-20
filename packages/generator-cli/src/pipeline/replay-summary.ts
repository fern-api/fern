import type { PipelineLogger } from "./PipelineLogger";
import type { ReplayStepResult } from "./types";

function plural(n: number, word: string): string {
    return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function formatConflictReason(reason: string | undefined): string {
    switch (reason) {
        case "same-line-edit":
            return "The new generation changed the same lines you edited";
        case "new-file-both":
            return "You and the generator both created this file";
        case "base-generation-mismatch":
            return "The generated code changed significantly around your edit";
        case "patch-apply-failed":
            return "Your change could not be applied to the new generated code";
        default:
            return "Your edit overlaps with changes in the new generation";
    }
}

function patchDescription(detail: { patchMessage: string; files: Array<{ file: string }> }): string {
    if (detail.patchMessage && detail.patchMessage !== "update") {
        return detail.patchMessage;
    }
    const firstFile = detail.files[0]?.file;
    return firstFile != null ? `changes in ${firstFile}` : "customization";
}

/**
 * Log a human-readable replay summary via the given logger.
 * All logic lives here — callers just pass a PipelineLogger (optionally with chalk-wrapping).
 */
export function logReplaySummary(result: ReplayStepResult, logger: PipelineLogger): void {
    if (!result.executed) {
        return;
    }

    const applied = result.patchesApplied ?? 0;
    const rebased = result.patchesContentRebased ?? 0;
    const userOwned = result.patchesKeptAsUserOwned ?? 0;
    const repointed = result.patchesRepointed ?? 0;
    const absorbed = result.patchesAbsorbed ?? 0;
    const conflicts = result.patchesWithConflicts ?? 0;
    const preserved = applied + rebased + userOwned + repointed;

    // Debug: full stats
    logger.debug(
        `Replay: flow=${result.flow}, detected=${result.patchesDetected ?? 0}, applied=${applied}, rebased=${rebased}, userOwned=${userOwned}, repointed=${repointed}, absorbed=${absorbed}, conflicts=${conflicts}`
    );

    // Info: happy-path summary
    if (preserved > 0) {
        const absorbedNote = absorbed > 0 ? ` (${plural(absorbed, "customization")} now part of generated code)` : "";
        logger.info(`Replay: ${plural(preserved, "customization")} preserved${absorbedNote}`);
    } else if (absorbed > 0) {
        logger.info(`Replay: ${plural(absorbed, "customization")} now part of generated code`);
    }

    // Debug: breakdown
    if (rebased > 0) {
        logger.debug(`Replay: ${plural(rebased, "customization")} rebased to current generation`);
    }
    if (userOwned > 0) {
        logger.debug(`Replay: ${plural(userOwned, "user-owned file")} preserved`);
    }

    // Warn: conflicts
    if (conflicts > 0) {
        const totalFiles = (result.conflictDetails ?? []).reduce((sum, d) => sum + d.files.length, 0);
        logger.warn(
            `Replay: ${plural(totalFiles, "file")} ${totalFiles === 1 ? "has" : "have"} merge conflicts — resolve in the PR or locally`
        );
        for (const detail of result.conflictDetails ?? []) {
            logger.warn(`  "${patchDescription(detail)}":`);
            for (const file of detail.files) {
                logger.warn(`    ${file.file} — ${formatConflictReason(file.conflictReason)}`);
            }
        }
    }

    // Warnings from replay engine
    for (const warning of result.warnings ?? []) {
        logger.warn(`Replay: ${warning}`);
    }
}

/**
 * Format the replay section for a PR body. Returns undefined if there's nothing to add.
 */
export function formatReplayPrBody(
    result: ReplayStepResult | undefined,
    options?: { branchName?: string }
): string | undefined {
    if (result == null || !result.executed) {
        return undefined;
    }

    const applied = result.patchesApplied ?? 0;
    const rebased = result.patchesContentRebased ?? 0;
    const userOwned = result.patchesKeptAsUserOwned ?? 0;
    const repointed = result.patchesRepointed ?? 0;
    const conflicts = result.patchesWithConflicts ?? 0;
    const preserved = applied + rebased + userOwned + repointed;

    if (preserved === 0 && conflicts === 0) {
        return undefined;
    }

    const parts: string[] = [];

    // Happy-path summary
    if (preserved > 0 && conflicts === 0) {
        parts.push(`\u2705 ${plural(preserved, "customization")} automatically preserved in this update.`);
    } else if (preserved > 0) {
        parts.push(
            `\u2705 ${plural(preserved, "customization")} automatically preserved, but ${plural(conflicts, "file")} ${conflicts === 1 ? "needs" : "need"} your attention.`
        );
    }

    // Conflict detail
    if (conflicts > 0) {
        const allFiles = (result.conflictDetails ?? []).flatMap((d) => d.files);
        const totalFiles = allFiles.length;

        parts.push(`\n### \u26a0\ufe0f Action required: ${plural(totalFiles, "file")} with customization conflicts\n`);
        parts.push(
            `You previously customized ${totalFiles === 1 ? "a file" : "files"} in this SDK. This generation changed the same code, so your ${totalFiles === 1 ? "edit" : "edits"} couldn't be applied automatically.\n`
        );
        parts.push(
            `> This PR is in **draft** to prevent merging before you resolve the conflicts. After fixing, mark it as **Ready for review**.\n`
        );

        parts.push(`| File | Your customization | Why it conflicted |`);
        parts.push(`|------|-------------------|-------------------|`);
        for (const detail of result.conflictDetails ?? []) {
            const description = patchDescription(detail);
            for (const f of detail.files) {
                parts.push(`| \`${f.file}\` | ${description} | ${formatConflictReason(f.conflictReason)} |`);
            }
        }

        // Resolution instructions — open by default, no details/summary wrapper
        const branch = options?.branchName ?? "<branch-name>";
        parts.push(`\n#### How to fix\n`);
        parts.push(`1. Check out this branch:`);
        parts.push(`   \`\`\`sh`);
        parts.push(`   git fetch origin && git checkout ${branch}`);
        parts.push(`   \`\`\``);
        parts.push(
            `2. Open the conflicting ${totalFiles === 1 ? "file" : "files"} listed above. Look for conflict markers like this:`
        );
        parts.push(`   \`\`\``);
        parts.push(`   <<<<<<< Your customization`);
        parts.push(`   // your code`);
        parts.push(`   =======`);
        parts.push(`   // newly generated code`);
        parts.push(`   >>>>>>> Generated`);
        parts.push(`   \`\`\``);
        parts.push(`   Keep the code you want (usually a combination of both), and delete the marker lines.`);
        parts.push(`3. Commit and push:`);
        parts.push(`   \`\`\`sh`);
        parts.push(`   git add -A && git commit -m "resolve conflicts" && git push`);
        parts.push(`   \`\`\``);
        parts.push(`4. On this PR, click **Ready for review** to enable merging.\n`);
        parts.push(`Your resolved changes will be remembered on future SDK generations.`);
    }

    return parts.join("\n");
}
