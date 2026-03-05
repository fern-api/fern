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
            return "Both the generator and your customization created this file";
        case "base-generation-mismatch":
            return "This customization was from a previous generation";
        case "patch-apply-failed":
            return "The customization could not be applied to the new code";
        default:
            return "Your edit overlaps with changes in the new generation";
    }
}

export function patchDescription(detail: { patchMessage: string; files: string[] }): string {
    if (detail.patchMessage && detail.patchMessage !== "update") {
        return detail.patchMessage;
    }
    const firstFile = detail.files[0];
    return firstFile != null ? `changes in ${firstFile}` : "customization";
}

export function logReplaySummary(result: ReplayStepResult, logger: PipelineLogger): void {
    if (!result.executed) {
        return;
    }

    const applied = result.patchesApplied ?? 0;
    const absorbed = result.patchesAbsorbed ?? 0;
    const unresolvedCount = result.unresolvedPatches?.length ?? 0;
    const preserved = applied - absorbed;

    logger.debug(
        `Replay: flow=${result.flow}, detected=${result.patchesDetected ?? 0}, applied=${applied}, absorbed=${absorbed}, unresolved=${unresolvedCount}`
    );

    if (preserved > 0) {
        const absorbedNote = absorbed > 0 ? ` (some customizations now part of generated code)` : "";
        logger.info(`Replay: customizations preserved${absorbedNote}`);
    } else if (absorbed > 0) {
        logger.info(`Replay: customizations now part of generated code`);
    }

    if (unresolvedCount > 0) {
        const totalFiles = (result.unresolvedPatches ?? []).reduce(
            (sum, patch) => sum + patch.conflictDetails.length,
            0
        );
        logger.warn(
            `Replay: ${plural(totalFiles, "file")} ${totalFiles === 1 ? "has" : "have"} unresolved conflicts — resolve via \`fern replay resolve\``
        );
        for (const patch of result.unresolvedPatches ?? []) {
            logger.warn(`  "${patchDescription(patch)}":`);
            for (const file of patch.conflictDetails) {
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
    options?: { branchName?: string; repoUri?: string }
): string | undefined {
    if (result == null || !result.executed) {
        return undefined;
    }

    const applied = result.patchesApplied ?? 0;
    const absorbed = result.patchesAbsorbed ?? 0;
    const unresolvedPatches = result.unresolvedPatches ?? [];
    const hasUnresolved = unresolvedPatches.length > 0;
    const preserved = applied - absorbed;

    if (preserved === 0 && !hasUnresolved) {
        return undefined;
    }

    const parts: string[] = [];

    if (preserved > 0 && !hasUnresolved) {
        parts.push(`\u2705 Customizations automatically preserved in this update.`);
    } else if (preserved > 0) {
        const totalFiles = unresolvedPatches.reduce((sum, patch) => sum + patch.conflictDetails.length, 0);
        parts.push(
            `\u2705 Customizations automatically preserved, but ${plural(totalFiles, "file")} ${totalFiles === 1 ? "needs" : "need"} your attention.`
        );
    }

    if (hasUnresolved) {
        const totalFiles = unresolvedPatches.reduce((sum, patch) => sum + patch.conflictDetails.length, 0);

        parts.push(`\n### Action required: ${plural(totalFiles, "file")} with unresolved customization conflicts\n`);
        parts.push(
            `The new generation changed code you previously customized. Non-conflicting customizations have been applied automatically. The following files need manual resolution:\n`
        );

        parts.push(`| File | Your customization | Why it conflicted |`);
        parts.push(`|------|-------------------|-------------------|`);
        for (const patch of unresolvedPatches) {
            const description = patchDescription(patch);
            for (const file of patch.conflictDetails) {
                parts.push(`| \`${file.file}\` | ${description} | ${formatConflictReason(file.conflictReason)} |`);
            }
        }

        const branch = options?.branchName ?? "<branch-name>";
        const repoUri = options?.repoUri;
        const repoName = repoUri?.split("/").pop() ?? "<repo>";

        parts.push(`\n#### How to resolve\n`);
        parts.push(`1. Check out this branch:`);
        parts.push(`   \`\`\`sh`);
        parts.push(`   git fetch origin && git checkout -b ${branch} origin/${branch}`);
        parts.push(`   \`\`\``);
        if (repoUri != null) {
            parts.push(`   Or if you don't have the repo cloned:`);
            parts.push(`   \`\`\`sh`);
            parts.push(
                `   git clone https://github.com/${repoUri}.git && cd ${repoName} && git checkout -b ${branch} origin/${branch}`
            );
            parts.push(`   \`\`\``);
        }
        parts.push(`2. Run: \`fern replay resolve\``);
        parts.push(`3. Open the conflicting files in your editor — you'll see standard merge conflict markers`);
        parts.push(`4. Resolve using your editor's merge tools (VS Code, IntelliJ, etc.)`);
        parts.push(`5. Run: \`fern replay resolve\` again to finalize`);
        parts.push(`6. Push your changes\n`);
        parts.push(`Your resolved customizations will be remembered on future SDK generations.`);
        parts.push(
            `If you merge this PR without resolving, your unresolved customizations will conflict again on the next generation.`
        );
    }

    return parts.join("\n");
}
