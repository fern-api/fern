import type { ClonedRepository } from "@fern-api/github";

import type { PipelineLogger } from "../PipelineLogger";

/**
 * Creates the PR branch for replay commits.
 *
 * When replay detected conflicts, uses the current HEAD tree (which contains
 * conflict markers from the replay commit) so users can see and resolve them
 * directly in the PR "Files changed" view. The PR is created as a draft to
 * prevent merging before conflicts are resolved.
 *
 * When there are no conflicts, creates a synthetic divergent commit using the
 * pure generation tree, so GitHub's 3-way merge can cleanly apply patches in
 * non-squash workflows.
 *
 * Returns the synthetic/generation-base commit SHA so the caller can push a
 * persistent tag for squash merge compatibility.
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
            `Creating PR branch with conflict markers from HEAD (previous generation: ${replayConflictInfo.previousGenerationSha.substring(0, 7)})`
        );

        // Use HEAD's tree — this is the replay commit that contains conflict markers
        // in files where user customizations overlap with generation changes. Users
        // see these markers in the PR diff and can resolve them directly.
        const headTreeHash = await repository.getHeadTreeHash();
        const syntheticCommitSha = await repository.commitTree(
            headTreeHash,
            replayConflictInfo.previousGenerationSha,
            `[fern-generated] ${commitMessage ?? "Update SDK"}`
        );

        await repository.createBranchFromCommit(branchName, syntheticCommitSha);

        // Restore the lockfile from the previous generation so it matches main.
        // The HEAD tree has a replay-updated lockfile which would cause a spurious
        // lockfile conflict in the PR. Main's lockfile is the source of truth.
        try {
            await repository.restoreFilesFromCommit(replayConflictInfo.previousGenerationSha, ".fern/replay.lock");
            await repository.commitAllChanges(`[fern-generated] ${commitMessage ?? "Update SDK"}`);
        } catch (error) {
            logger.debug(
                `Could not restore lockfile from previous generation: ${error instanceof Error ? error.message : String(error)}`
            );
        }

        return syntheticCommitSha;
    } else if (replayConflictInfo != null) {
        logger.debug(
            `Creating divergent PR branch from previous generation ${replayConflictInfo.previousGenerationSha.substring(0, 7)} (no conflicts)`
        );

        // No conflicts — use the pure generation tree so GitHub's 3-way merge
        // can cleanly apply patches in non-squash workflows.
        const genTreeHash = await repository.getCommitTreeHash(replayConflictInfo.currentGenerationSha);
        const syntheticCommitSha = await repository.commitTree(
            genTreeHash,
            replayConflictInfo.previousGenerationSha,
            `[fern-generated] ${commitMessage ?? "Update SDK"}`
        );

        await repository.createBranchFromCommit(branchName, syntheticCommitSha);

        return syntheticCommitSha;
    } else {
        // No previous generation info — use existing linear behavior
        await repository.createBranchFromHead(branchName);
        return undefined;
    }
}
