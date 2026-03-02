import type { PipelineLogger } from "./PipelineLogger";
import type { ReplayStepResult } from "./types";

function plural(n: number, word: string): string {
    return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export function formatConflictReason(reason: string | undefined): string {
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

export function patchDescription(detail: { patchMessage: string; files: Array<{ file: string }> }): string {
    if (detail.patchMessage && detail.patchMessage !== "update") {
        return detail.patchMessage;
    }
    const firstFile = detail.files[0]?.file;
    return firstFile != null ? `changes in ${firstFile}` : "customization";
}

export function logReplaySummary(result: ReplayStepResult, logger: PipelineLogger): void {
    if (!result.executed) {
        return;
    }

    const applied = result.patchesApplied ?? 0;
    const absorbed = result.patchesAbsorbed ?? 0;
    const conflicts = result.patchesWithConflicts ?? 0;
    const preserved = applied - absorbed;

    logger.debug(
        `Replay: flow=${result.flow}, detected=${result.patchesDetected ?? 0}, applied=${applied}, absorbed=${absorbed}, conflicts=${conflicts}`
    );

    if (preserved > 0) {
        const absorbedNote = absorbed > 0 ? ` (some customizations now part of generated code)` : "";
        logger.info(`Replay: customizations preserved${absorbedNote}`);
    } else if (absorbed > 0) {
        logger.info(`Replay: customizations now part of generated code`);
    }

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

    for (const warning of result.warnings ?? []) {
        logger.warn(`Replay: ${warning}`);
    }
}

export function formatReplayPrBody(
    result: ReplayStepResult | undefined,
    options?: { branchName?: string }
): string | undefined {
    if (result == null || !result.executed) {
        return undefined;
    }

    const applied = result.patchesApplied ?? 0;
    const absorbed = result.patchesAbsorbed ?? 0;
    const conflicts = result.patchesWithConflicts ?? 0;
    const preserved = applied - absorbed;

    if (preserved === 0 && conflicts === 0) {
        return undefined;
    }

    const parts: string[] = [];

    if (preserved > 0 && conflicts === 0) {
        parts.push(`\u2705 Customizations automatically preserved in this update.`);
    } else if (preserved > 0) {
        parts.push(
            `\u2705 Customizations automatically preserved, but ${plural(conflicts, "file")} ${conflicts === 1 ? "needs" : "need"} your attention.`
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
            `> \u26a0\ufe0f **Label guide:** In GitHub's conflict editor, \`<<<<<<< HEAD\` ("Accept current") = new generated code. \`>>>>>>> main\` ("Accept incoming") = your customization.\n`
        );

        parts.push(`| File | Your customization | Why it conflicted |`);
        parts.push(`|------|-------------------|-------------------|`);
        for (const detail of result.conflictDetails ?? []) {
            const description = patchDescription(detail);
            for (const f of detail.files) {
                parts.push(`| \`${f.file}\` | ${description} | ${formatConflictReason(f.conflictReason)} |`);
            }
        }

        const branch = options?.branchName ?? "<branch-name>";
        parts.push(`\n#### How to fix\n`);

        parts.push(`**Option A: Resolve in GitHub (recommended for simple conflicts)**\n`);
        parts.push(`1. Click the **Resolve conflicts** button below`);
        parts.push(`2. For each file, choose which code to keep:`);
        parts.push(`   - \`<<<<<<< HEAD\` / "Accept current changes" = **new generated code**`);
        parts.push(`   - \`>>>>>>> main\` / "Accept incoming changes" = **your customization**`);
        parts.push(`   - Or manually combine both, then delete the conflict markers`);
        parts.push(`3. Click **Mark as resolved** for each file, then **Commit merge**\n`);

        parts.push(`**Option B: Resolve locally**\n`);
        parts.push(`1. Fetch and check out this branch:`);
        parts.push(`   \`\`\`sh`);
        parts.push(`   git fetch origin && git checkout ${branch}`);
        parts.push(`   \`\`\``);
        parts.push(`2. Merge the base branch and resolve conflicts in your editor:`);
        parts.push(`   \`\`\`sh`);
        parts.push(`   git merge origin/main`);
        parts.push(`   \`\`\``);
        parts.push(`3. Commit and push:`);
        parts.push(`   \`\`\`sh`);
        parts.push(`   git add -A && git commit -m "resolve conflicts" && git push`);
        parts.push(`   \`\`\`\n`);
        parts.push(`Your resolved changes will be remembered on future SDK generations.`);
    }

    return parts.join("\n");
}
