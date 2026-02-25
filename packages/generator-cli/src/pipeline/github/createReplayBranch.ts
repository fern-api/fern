import type { ClonedRepository } from "@fern-api/github";

import type { PipelineLogger } from "../PipelineLogger";

export async function createReplayBranch(
    repository: ClonedRepository,
    branchName: string,
    commitMessage: string | undefined,
    replayConflictInfo:
        | {
              previousGenerationSha: string;
              currentGenerationSha: string;
              hasConflicts: boolean;
              baseBranchHead?: string;
          }
        | undefined,
    logger: PipelineLogger
): Promise<string | undefined> {
    if (replayConflictInfo?.hasConflicts) {
        // Parent must be previousGenerationSha to create a divergent fork in history.
        // GitHub computes merge base = previousGen, then shows real 3-way diff between
        // main's path (previousGen → mainHEAD) and the branch (previousGen → synthetic).
        // Using baseBranchHead (= main HEAD) would make the branch linear, showing
        // conflict markers as plain text instead of real merge conflicts.
        const parentSha = replayConflictInfo.previousGenerationSha;
        // Use baseBranchHead for lockfile restore — it's on main's lineage and has the
        // correct lockfile state (pre-replay). Fall back to previousGenerationSha.
        const lockfileRestoreSha = replayConflictInfo.baseBranchHead ?? replayConflictInfo.previousGenerationSha;

        logger.debug(`Creating divergent PR branch with generation tree (parent: ${parentSha.substring(0, 7)})`);

        // Use the pure generation tree — NOT HEAD's tree (which has conflict markers as text).
        // With the generation tree parented off previousGenerationSha, GitHub computes a real
        // 3-way merge: base=previousGen, main=previousGen+user edits, PR=newGen. Files where
        // both sides diverged show as real merge conflicts in the PR "Files changed" view.
        const genTreeHash = await repository.getCommitTreeHash(replayConflictInfo.currentGenerationSha);
        const syntheticCommitSha = await repository.commitTree(
            genTreeHash,
            parentSha,
            `[fern-generated] ${commitMessage ?? "Update SDK"}`
        );

        await repository.createBranchFromCommit(branchName, syntheticCommitSha);

        // Restore the lockfile from the base branch so it matches main.
        // The HEAD tree has a replay-updated lockfile which would cause a spurious
        // lockfile conflict in the PR. Main's lockfile is the source of truth.
        try {
            await repository.restoreFilesFromCommit(lockfileRestoreSha, ".fern/replay.lock");
            await repository.commitAllChanges(`[fern-generated] ${commitMessage ?? "Update SDK"}`);
        } catch (error) {
            logger.debug(
                `Could not restore lockfile from base branch: ${error instanceof Error ? error.message : String(error)}`
            );
        }

        return syntheticCommitSha;
    } else if (replayConflictInfo != null) {
        const parentSha = replayConflictInfo.previousGenerationSha;

        logger.debug(`Creating linear PR branch from HEAD (no conflicts)`);

        await repository.createBranchFromHead(branchName);

        const genTreeHash = await repository.getCommitTreeHash(replayConflictInfo.currentGenerationSha);
        const tagCommitSha = await repository.commitTree(
            genTreeHash,
            parentSha,
            `[fern-generated] ${commitMessage ?? "Update SDK"}`
        );

        return tagCommitSha;
    } else {
        // No previous generation info — use existing linear behavior
        await repository.createBranchFromHead(branchName);
        return undefined;
    }
}
