import { extractErrorMessage } from "@fern-api/core-utils";
import type { ClonedRepository } from "@fern-api/github";
import type { Octokit } from "@octokit/rest";

import type { PipelineLogger } from "../PipelineLogger";

const MAX_CONCURRENT_PUSH_RETRIES = 3;

export interface PushSignedCommitOptions {
    repository: ClonedRepository;
    octokit: Octokit;
    owner: string;
    repo: string;
    /** The branch name whose ref will be updated to the signed commit. */
    branch: string;
    /**
     * Force-update the branch ref (non-fast-forward allowed).
     * Use `true` when updating bot-owned branches (e.g. `fern-bot/*`) that the pipeline exclusively owns.
     */
    force: boolean;
    /**
     * When `force` is false and the ref update fails with a non-fast-forward error, rebase the
     * local branch onto the remote and retry. Only safe when the branch may contain real
     * upstream commits that must be preserved (e.g. push mode onto a shared branch).
     * Defaults to false; re-parenting onto remote HEAD with the local tree (which discards
     * remote changes) is only safe for bot-owned branches and is therefore never done here.
     */
    rebaseOnConflict?: boolean;
    logger: PipelineLogger;
}

/**
 * Pushes the current branch HEAD to GitHub as a signed commit by:
 * 1. Pushing the local commit to a temporary ref (uploads tree + blob objects).
 * 2. Creating a new commit via the GitHub REST API (which GitHub signs with the App's key
 *    when the octokit instance is authenticated with a GitHub App installation token).
 * 3. Updating the branch ref to point to the signed commit.
 * 4. Deleting the temporary ref.
 * 5. Fast-forwarding the local branch to the signed commit SHA.
 *
 * Returns the SHA of the signed commit on the remote (which differs from the local HEAD SHA).
 */
export async function pushSignedCommit({
    repository,
    octokit,
    owner,
    repo,
    branch,
    force,
    rebaseOnConflict = false,
    logger
}: PushSignedCommitOptions): Promise<string> {
    const tempRef = `refs/temp/fern-${Date.now()}`;
    let tempRefPushed = false;

    try {
        let [localHeadSha, treeSha, message, parents] = await Promise.all([
            repository.getHeadSha(),
            repository.getHeadTreeHash(),
            repository.getHeadCommitMessage(),
            repository.getHeadParents()
        ]);

        await repository.pushObjectToRef(localHeadSha, tempRef);
        tempRefPushed = true;

        for (let attempt = 0; attempt < MAX_CONCURRENT_PUSH_RETRIES; attempt++) {
            const { data: signedCommit } = await octokit.git.createCommit({
                owner,
                repo,
                message,
                tree: treeSha,
                parents
            });
            const signedSha = signedCommit.sha;

            try {
                await upsertBranchRef({ octokit, owner, repo, branch, sha: signedSha, force });
                logger.debug(`Updated refs/heads/${branch} to signed commit ${signedSha}`);
                await syncLocalToSignedCommit({ repository, branch, signedSha });
                return signedSha;
            } catch (err) {
                if (!isNonFastForwardError(err) || force || attempt >= MAX_CONCURRENT_PUSH_RETRIES - 1) {
                    throw err;
                }

                if (rebaseOnConflict) {
                    logger.warn(
                        `Non-fast-forward on refs/heads/${branch} (attempt ${attempt + 1}/${MAX_CONCURRENT_PUSH_RETRIES}); rebasing locally and retrying.`
                    );
                    await repository.pullWithRebase(branch);
                    [localHeadSha, treeSha, message, parents] = await Promise.all([
                        repository.getHeadSha(),
                        repository.getHeadTreeHash(),
                        repository.getHeadCommitMessage(),
                        repository.getHeadParents()
                    ]);
                    // The rebased commit is not a descendant of the original tempRef tip,
                    // so force-push is required to overwrite it.
                    await repository.pushObjectToRef(localHeadSha, tempRef, { force: true });
                } else {
                    throw err;
                }
            }
        }

        throw new Error(
            `Failed to push signed commit to refs/heads/${branch} after ${MAX_CONCURRENT_PUSH_RETRIES} attempts`
        );
    } finally {
        if (tempRefPushed) {
            try {
                await octokit.git.deleteRef({ owner, repo, ref: tempRef.replace(/^refs\//, "") });
            } catch (err) {
                logger.debug(`Failed to delete temp ref ${tempRef}: ${extractErrorMessage(err)}`);
            }
        }
    }
}

async function upsertBranchRef({
    octokit,
    owner,
    repo,
    branch,
    sha,
    force
}: {
    octokit: Octokit;
    owner: string;
    repo: string;
    branch: string;
    sha: string;
    force: boolean;
}): Promise<void> {
    try {
        await octokit.git.updateRef({
            owner,
            repo,
            ref: `heads/${branch}`,
            sha,
            force
        });
    } catch (err) {
        if (isNotFoundError(err)) {
            await octokit.git.createRef({
                owner,
                repo,
                ref: `refs/heads/${branch}`,
                sha
            });
            return;
        }
        throw err;
    }
}

async function syncLocalToSignedCommit({
    repository,
    branch,
    signedSha
}: {
    repository: ClonedRepository;
    branch: string;
    signedSha: string;
}): Promise<void> {
    // Intentionally does not swallow errors: if the signed commit exists on the remote but the
    // local branch cannot be aligned to it, downstream operations (tag push, getHeadSha() used
    // for changelog URLs) would silently use the stale local SHA.
    await repository.fetch(["origin", branch]);
    await repository.resetHardToSha(signedSha);
}

function hasNumericStatus(err: unknown): err is { status: number } {
    return (
        typeof err === "object" &&
        err != null &&
        "status" in err &&
        typeof (err as { status: unknown }).status === "number"
    );
}

function isNotFoundError(err: unknown): boolean {
    return hasNumericStatus(err) && err.status === 404;
}

export function isNonFastForwardError(err: unknown): boolean {
    if (!hasNumericStatus(err) || err.status !== 422) {
        return false;
    }
    const message = extractErrorMessage(err).toLowerCase();
    return (
        message.includes("not a fast forward") ||
        message.includes("not a fast-forward") ||
        message.includes("update is not a fast forward")
    );
}
