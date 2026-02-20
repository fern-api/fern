import { cloneRepository } from "@fern-api/github";
import { FERN_BOT_EMAIL, FERN_BOT_NAME, GitClient, type ResetResult, reset } from "@fern-api/replay";
import tmp from "tmp-promise";

export type { ResetResult };

export interface ReplayResetRemoteParams {
    /** GitHub repo URI (e.g., "owner/repo") */
    githubRepo: string;
    /** GitHub token with push permissions */
    token: string;
    /** Target branch (defaults to repo default branch) */
    branch?: string;
    /** Report what would happen but don't commit/push */
    dryRun?: boolean;
}

export interface ReplayResetRemoteResult {
    /** The underlying reset result from @fern-api/replay */
    reset: ResetResult;
    /** Branch that was pushed to (undefined if dry-run or nothing to reset) */
    branch?: string;
}

/**
 * Reset Replay on a remote GitHub repository.
 * Clones the repo, deletes replay.lock, commits with [fern-replay] prefix, and pushes directly.
 */
export async function replayResetRemote(params: ReplayResetRemoteParams): Promise<ReplayResetRemoteResult> {
    const { githubRepo, token, dryRun } = params;

    const tmpDir = await tmp.dir({ unsafeCleanup: true });
    try {
        const repository = await cloneRepository({
            githubRepository: githubRepo,
            installationToken: token,
            targetDirectory: tmpDir.path
        });

        const repoPath = tmpDir.path;
        const defaultBranch = await repository.getDefaultBranch();
        const targetBranch = params.branch ?? defaultBranch;

        // Checkout target branch if specified
        if (params.branch != null) {
            const branchExists = await repository.remoteBranchExists(params.branch);
            if (branchExists) {
                await repository.checkoutRemoteBranch(params.branch);
            }
        }

        // Run reset (synchronous — deletes .fern/replay.lock)
        const resetResult = reset(repoPath, { dryRun });

        if (resetResult.nothingToReset || dryRun) {
            return { reset: resetResult };
        }

        // Stage the lockfile deletion, commit, and push
        const git = new GitClient(repoPath);
        await git.exec(["add", ".fern/replay.lock"]);

        const commitMessage = `[fern-replay] Reset Replay\n\nRemoved ${resetResult.patchesRemoved} tracked patch(es).`;

        await git.exec([
            "-c",
            `user.name=${FERN_BOT_NAME}`,
            "-c",
            `user.email=${FERN_BOT_EMAIL}`,
            "commit",
            "-m",
            commitMessage
        ]);

        await repository.pushUpstream(targetBranch);

        return {
            reset: resetResult,
            branch: targetBranch
        };
    } finally {
        await tmpDir.cleanup();
    }
}
