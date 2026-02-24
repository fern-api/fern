import type { Octokit } from "@octokit/rest";

import type { PipelineLogger } from "../PipelineLogger";
import { formatConflictReason, patchDescription } from "../replay-summary";
import type { ReplayStepResult } from "../types";

/**
 * Resolve guidance for a conflict reason. Suggests whether the user likely wants
 * to keep their customization, take the new generation, or combine both.
 */
function resolveGuidance(conflictReason: string | undefined): string {
    switch (conflictReason) {
        case "same-line-edit":
            return "You likely want to combine both -- keep your logic while incorporating the generation's structural changes.";
        case "new-file-both":
            return "Compare both versions and merge any unique content. If you created the file intentionally, your version is likely correct.";
        case "base-generation-mismatch":
            return "Review carefully -- the generated code changed significantly. You may need to re-apply your customization on top of the new structure.";
        case "patch-apply-failed":
            return "Your customization could not be applied automatically. Re-apply your changes manually on top of the new generated code.";
        default:
            return "Review both sides and keep whichever version (or combination) is correct for your use case.";
    }
}

interface ConflictFileEntry {
    file: string;
    customization: string;
    reason: string;
    guidance: string;
}

/**
 * Build the markdown body for the single conflict summary comment.
 * Returns undefined if there are no conflict files to report.
 */
function buildConflictCommentBody(
    conflictDetails: NonNullable<ReplayStepResult["conflictDetails"]>
): string | undefined {
    const entries: ConflictFileEntry[] = [];

    for (const detail of conflictDetails) {
        const description = patchDescription(detail);
        for (const file of detail.files) {
            if (file.status === "conflict") {
                entries.push({
                    file: file.file,
                    customization: description,
                    reason: formatConflictReason(file.conflictReason),
                    guidance: resolveGuidance(file.conflictReason)
                });
            }
        }
    }

    if (entries.length === 0) {
        return undefined;
    }

    const parts: string[] = [];

    parts.push("## Conflict Resolution Guide\n");
    parts.push(
        `This PR has **${entries.length} file${entries.length === 1 ? "" : "s"}** where your customizations conflict with the new SDK generation. ` +
            "Below is per-file guidance to help you resolve each conflict.\n"
    );
    parts.push(
        '> In GitHub\'s conflict editor, `<<<<<<< HEAD` ("Accept current") = **new generated code**, ' +
            '`>>>>>>> main` ("Accept incoming") = **your customization**.\n'
    );

    parts.push("| File | Your customization | Why it conflicted | Suggested resolution |");
    parts.push("|------|-------------------|-------------------|---------------------|");
    for (const entry of entries) {
        parts.push(`| \`${entry.file}\` | ${entry.customization} | ${entry.reason} | ${entry.guidance} |`);
    }

    parts.push("\n---");
    parts.push("*Posted by Fern Replay to help resolve SDK customization conflicts.*");

    return parts.join("\n");
}

/**
 * Post a single summary comment on a PR listing all conflicting files with
 * per-file context and resolution guidance.
 *
 * This uses issue comments (not review comments) to avoid fragility around
 * specific line numbers and to consolidate all guidance into one notification.
 *
 * Should be called after PR creation/update, only when conflicts exist.
 */
export async function postConflictComments(
    octokit: Octokit,
    owner: string,
    repo: string,
    prNumber: number,
    replayResult: ReplayStepResult | undefined,
    logger: PipelineLogger
): Promise<void> {
    if (replayResult == null) {
        return;
    }

    const conflictDetails = replayResult.conflictDetails;
    if (conflictDetails == null || conflictDetails.length === 0) {
        return;
    }

    const body = buildConflictCommentBody(conflictDetails);
    if (body == null) {
        logger.debug("No conflict files to comment on -- skipping conflict comment");
        return;
    }

    try {
        await octokit.issues.createComment({
            owner,
            repo,
            issue_number: prNumber,
            body
        });
        logger.debug(`Posted conflict resolution guide comment on PR #${prNumber}`);
    } catch (error) {
        logger.debug(
            `Could not post conflict comment on PR #${prNumber}: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}
