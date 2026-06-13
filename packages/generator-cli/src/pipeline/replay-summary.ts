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
    const unresolvedFiles = (result.unresolvedPatches ?? []).reduce(
        (sum, patch) => sum + patch.conflictDetails.length,
        0
    );
    const preserved = applied - absorbed;

    // Operator-friendly structured INFO line. Grep-keyed on "[replay]" so customers
    // and on-call can pull metrics out of pipeline logs without a parser.
    // `success=` reflects whether the replay logic itself succeeded (NOT step.success,
    // which stays true on replay crashes so the orchestrator doesn't abort generation).
    const replayLogicSucceeded = result.replayCrashed !== true;
    // `degraded=` is APPEND-ONLY: the existing keys are frozen on-call grep
    // keys (see CONTEXT.md in fern-replay) — never rename or reorder them.
    logger.info(
        `[replay] flow=${result.flow ?? "unknown"} detected=${result.patchesDetected ?? 0} ` +
            `applied=${applied} conflicts=${result.patchesWithConflicts ?? 0} ` +
            `absorbed=${absorbed} repointed=${result.patchesRepointed ?? 0} ` +
            `content_rebased=${result.patchesContentRebased ?? 0} ` +
            `kept_as_user_owned=${result.patchesKeptAsUserOwned ?? 0} ` +
            `unresolved=${unresolvedCount} unresolved_files=${unresolvedFiles} ` +
            `warnings=${result.warnings?.length ?? 0} success=${replayLogicSucceeded} ` +
            `degraded=${result.degraded === true}`
    );

    if (preserved > 0) {
        const absorbedNote = absorbed > 0 ? ` (some customizations now part of generated code)` : "";
        logger.info(`Replay: customizations preserved${absorbedNote}`);
    } else if (absorbed > 0) {
        logger.info(`Replay: customizations now part of generated code`);
    }

    if (unresolvedCount > 0) {
        // Per-conflict-reason bucket counts at DEBUG. Surfaced before the per-file
        // WARN block so debug runs see the categorical breakdown first.
        const buckets = { sameLineEdit: 0, newFileBoth: 0, baseGenerationMismatch: 0, patchApplyFailed: 0, other: 0 };
        for (const patch of result.unresolvedPatches ?? []) {
            for (const file of patch.conflictDetails) {
                switch (file.conflictReason) {
                    case "same-line-edit":
                        buckets.sameLineEdit += 1;
                        break;
                    case "new-file-both":
                        buckets.newFileBoth += 1;
                        break;
                    case "base-generation-mismatch":
                        buckets.baseGenerationMismatch += 1;
                        break;
                    case "patch-apply-failed":
                        buckets.patchApplyFailed += 1;
                        break;
                    default:
                        buckets.other += 1;
                }
            }
        }
        logger.debug(
            `[replay] conflict_buckets same_line_edit=${buckets.sameLineEdit} ` +
                `new_file_both=${buckets.newFileBoth} ` +
                `base_generation_mismatch=${buckets.baseGenerationMismatch} ` +
                `patch_apply_failed=${buckets.patchApplyFailed} other=${buckets.other}`
        );

        logger.warn(
            `Replay: ${plural(unresolvedFiles, "file")} ${unresolvedFiles === 1 ? "has" : "have"} unresolved conflicts — resolve via \`fern replay resolve\``
        );
        for (const patch of result.unresolvedPatches ?? []) {
            logger.warn(`  "${patchDescription(patch)}":`);
            for (const file of patch.conflictDetails) {
                logger.warn(`    ${file.file} — ${formatConflictReason(file.conflictReason)}`);
            }
        }
    }

    if (result.replayCrashed === true && result.errorMessage != null) {
        // Replay crashed — surface the reason so debug logs explain what
        // `success=false` in the structured line means.
        logger.warn(`Replay: ${result.errorMessage}`);
    }

    for (const warning of result.warnings ?? []) {
        logger.warn(`Replay: ${warning}`);
    }
}

/**
 * Renders the degraded-run warning block for the TOP of a PR body, or
 * undefined when the run was healthy.
 *
 * Deliberately separate from `formatReplayPrBody`: that function returns
 * undefined when nothing was preserved and nothing conflicted — exactly the
 * shape of a degraded run — so a degraded warning routed through it would
 * never render. This block is composed independently via `composePrBody`.
 *
 * Also renders when the replay logic crashed (`replayCrashed === true`):
 * a crashed run ships a PR with zero replay signal otherwise, which is the
 * same silent-loss hole.
 */
export function formatReplayDegradedBlock(result: ReplayStepResult | undefined): string | undefined {
    if (result == null || !result.executed) {
        return undefined;
    }

    const reasons = result.degradedReasons ?? [];
    const isDegraded = result.degraded === true || reasons.length > 0;
    const crashed = result.replayCrashed === true;
    if (!isDegraded && !crashed) {
        return undefined;
    }

    const lines: string[] = [];
    lines.push(`> [!WARNING]`);
    lines.push(
        `> **Customizations may not have been preserved in this update — review the diff before merging.**`
    );
    if (reasons.length > 0) {
        lines.push(`>`);
        for (const reason of reasons) {
            lines.push(`> - ${reason.message}`);
        }
    } else if (crashed) {
        lines.push(`>`);
        const detail = result.errorMessage != null ? ` (${result.errorMessage})` : "";
        lines.push(`> - Replay did not complete on this run${detail}.`);
    }
    lines.push(`>`);
    lines.push(
        `> The previous generation was not reachable while this update was prepared. ` +
            `To verify customizations were carried forward, widen the clone window ` +
            `(e.g. \`git fetch --unshallow\`) and re-run generation.`
    );
    return lines.join("\n");
}

/**
 * Pure PR-body composition. The degraded block — when present — sits at the
 * very top, above the version header; the replay section appends after a
 * divider. One composition site serves both the create-PR and
 * update-existing-PR paths in GithubStep.
 */
export function composePrBody(parts: { prBody: string; replaySection?: string; degradedBlock?: string }): string {
    let body = parts.prBody;
    if (parts.replaySection != null) {
        body = body + "\n\n---\n\n" + parts.replaySection;
    }
    if (parts.degradedBlock != null) {
        body = parts.degradedBlock + "\n\n---\n\n" + body;
    }
    return body;
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
            // Surface the patch ID so the permanent-dismiss instruction below
            // (`fern replay forget <patch-id>`) is actionable from the PR body.
            const descriptionWithId = patch.patchId ? `${description} (\`${patch.patchId}\`)` : description;
            for (const file of patch.conflictDetails) {
                parts.push(`| \`${file.file}\` | ${descriptionWithId} | ${formatConflictReason(file.conflictReason)} |`);
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
        parts.push(
            `To permanently dismiss a customization instead — keep the generated code, and it will not return on future generations — run: \`fern replay forget <patch-id>\` (patch IDs are shown in the table above).\n`
        );
        parts.push(`Your resolved customizations will be remembered on future SDK generations.`);
        parts.push(
            `If you merge this PR without resolving, your unresolved customizations will conflict again on the next generation.`
        );
    }

    return parts.join("\n");
}
