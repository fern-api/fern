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
          }
        | undefined,
    logger: PipelineLogger
): Promise<string | undefined> {
    if (replayConflictInfo == null) {
        // No previous generation info — use existing linear behavior
        await repository.createBranchFromHead(branchName);
        return undefined;
    }

    const parentSha = replayConflictInfo.previousGenerationSha;

    // Always create a linear branch from HEAD — the code is clean.
    // The lockfile stays as-is: it has the latest generation, current_generation,
    // and any status: unresolved markers so `fern replay resolve` works on the branch.
    await repository.createBranchFromHead(branchName);

    // Tag commit: pure generation tree + previousGenerationSha as parent.
    // Not used as branch content — only pushed as the fern-generation-base tag
    // so that the next run's sync detection works.
    //
    // previousGenerationSha can become unreachable after a squash-merge + branch delete:
    // the old fern-bot commit only existed on the now-deleted PR branch, and `git fetch
    // --unshallow` doesn't pull dangling objects. When that happens, `git commit-tree -p
    // <sha>` fails fatal. Skip the tag update in that case — the branch was already created
    // from HEAD so the SDK still ships; we just lose the moving tag for this run.
    try {
        const genTreeHash = await repository.getCommitTreeHash(replayConflictInfo.currentGenerationSha);
        const tagCommitSha = await repository.commitTree(
            genTreeHash,
            parentSha,
            `[fern-generated] ${commitMessage ?? "Update SDK"}`
        );
        return tagCommitSha;
    } catch (error) {
        logger.warn(
            `Could not create fern-generation-base tag commit: parent ${parentSha} is unreachable in this clone ` +
                `(likely on a squash-merged + deleted branch). Continuing without tag update. Underlying error: ${String(error)}`
        );
        return undefined;
    }
}
