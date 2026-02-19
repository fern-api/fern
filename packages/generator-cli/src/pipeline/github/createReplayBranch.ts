import type { ClonedRepository } from "@fern-api/github";

import type { PipelineLogger } from "../PipelineLogger";

/**
 * Creates the PR branch for replay commits. When replay detected conflicts and we have the
 * previous generation SHA, creates a synthetic divergent commit so GitHub shows real merge
 * conflicts instead of conflict markers as plain text.
 *
 * Returns the synthetic commit SHA when a divergent branch was created, so the caller
 * can push a persistent tag for squash merge compatibility.
 */
export async function createReplayBranch(
    repository: ClonedRepository,
    branchName: string,
    commitMessage: string | undefined,
    replayConflictInfo:
        | {
              previousGenerationSha: string;
              currentGenerationSha: string;
              hasConflicts: boolean;
          }
        | undefined,
    logger: PipelineLogger
): Promise<string | undefined> {
    if (replayConflictInfo?.hasConflicts) {
        logger.debug(
            `Creating divergent PR branch from previous generation ${replayConflictInfo.previousGenerationSha.substring(0, 7)} for real merge conflicts`
        );
        // Get the tree from the [fern-generated] commit (pure generation, no patches).
        // This lets git's native 3-way merge handle patch application — clean patches
        // merge automatically, conflicting ones show proper single-layer conflict markers.
        const genTreeHash = await repository.getCommitTreeHash(replayConflictInfo.currentGenerationSha);

        // Create a synthetic commit whose parent is the old generation but whose tree
        // is the new generation output. This creates divergence from main so GitHub's
        // 3-way merge detects real conflicts where customer patches overlap with
        // generator changes. Use the [fern-generated] prefix so replay can identify it.
        const syntheticCommitSha = await repository.commitTree(
            genTreeHash,
            replayConflictInfo.previousGenerationSha,
            `[fern-generated] ${commitMessage ?? "Update SDK"}`
        );

        await repository.createBranchFromCommit(branchName, syntheticCommitSha);

        // Don't rewrite the lockfile on the PR branch. Main's lockfile is used verbatim.
        // Both sides (main and PR branch) have the same lockfile content, so git
        // auto-merges cleanly — no more lockfile conflicts on divergent PRs.
        // The synthetic commit SHA is preserved via the fern-generation-base tag,
        // and syncFromDivergentMerge() handles recovery after squash merge.

        return syntheticCommitSha;
    } else {
        // No conflicts or no previous generation — use existing linear behavior
        await repository.createBranchFromHead(branchName);
        return undefined;
    }
}
