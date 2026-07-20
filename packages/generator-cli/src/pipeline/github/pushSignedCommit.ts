import { extractErrorMessage } from "@fern-api/core-utils";
import type { ClonedRepository } from "@fern-api/github";
import type { Octokit } from "@octokit/rest";

import type { PipelineLogger } from "../PipelineLogger";
import { FERN_BOT_EMAIL, FERN_BOT_NAME } from "./constants";

const MAX_CONCURRENT_PUSH_RETRIES = 3;

/**
 * Upper bound on how many local-only commits are individually recreated as signed API
 * commits. Chains longer than this (which should never happen for pipeline-created
 * branches) fall back to signing HEAD only, matching the previous behavior.
 */
const MAX_SIGNED_CHAIN_LENGTH = 20;

export interface CommitAuthor {
    name: string;
    email: string;
}

const PAT_TOKEN_PREFIXES = ["ghp_", "github_pat_"];

/**
 * Resolves the commit identity to send to the Git Data API for the given auth token.
 *
 * Personal access tokens cannot auto-sign API-created commits, and omitting the
 * identity fields attributes them to the PAT owner. Pinning the Fern bot identity
 * keeps author/committer stable for tooling that filters on them (e.g. CI
 * ignore-committer rules). Signing-capable principals (App installation `ghs_`,
 * OAuth `gho_`) keep the omitted default so GitHub attributes the commit to the
 * bot user and stamps the "Verified" signature.
 */
export function resolveCommitAuthor(token: string, author: CommitAuthor | undefined): CommitAuthor | undefined {
    if (author != null) {
        return author;
    }
    if (PAT_TOKEN_PREFIXES.some((prefix) => token.startsWith(prefix))) {
        return { name: FERN_BOT_NAME, email: FERN_BOT_EMAIL };
    }
    return undefined;
}

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
    /**
     * Override the commit author and committer identity.
     *
     * Omitted: neither `author` nor `committer` is sent, so GitHub fills both in from
     * the authenticated installation (e.g. `fern-api[bot]` / the Fern bot noreply email)
     * and signs the commit. Sending `author` alone is not enough: the Git Data API
     * defaults `committer` to the provided `author`, which suppresses auto-signing.
     * Set: forces both `author` and `committer` to the provided identity — suppresses
     * auto-signing, but pins the committer for tooling that reads `git log --format=%cn`.
     */
    author?: CommitAuthor;
    logger: PipelineLogger;
}

/**
 * Pushes the current branch HEAD to GitHub as signed commits by:
 * 1. Pushing the local commit to a temporary ref (uploads tree + blob objects).
 * 2. Recreating every local-only commit (oldest first) via the GitHub REST API (which
 *    GitHub signs with the App's key when the octokit instance is authenticated with a
 *    GitHub App installation token), re-parenting each onto its signed predecessor. This
 *    covers multi-commit branches (e.g. `[fern-generated]` + `[fern-replay]`) so every
 *    commit on the PR shows as Verified, not just HEAD.
 * 3. Updating the branch ref to point to the signed head commit.
 * 4. Deleting the temporary ref.
 * 5. Fast-forwarding the local branch to the signed commit SHA.
 *
 * Returns the SHA of the signed head commit on the remote (which differs from the local HEAD SHA).
 */
export async function pushSignedCommit({
    repository,
    octokit,
    owner,
    repo,
    branch,
    force,
    rebaseOnConflict = false,
    author,
    logger
}: PushSignedCommitOptions): Promise<string> {
    const tempRef = `refs/temp/fern-${Date.now()}`;
    let tempRefPushed = false;

    try {
        let localHeadSha = await repository.getHeadSha();

        await repository.pushObjectToRef(localHeadSha, tempRef);
        tempRefPushed = true;

        for (let attempt = 0; attempt < MAX_CONCURRENT_PUSH_RETRIES; attempt++) {
            const signedSha = await signLocalCommitChain({
                repository,
                octokit,
                owner,
                repo,
                localHeadSha,
                author,
                logger
            });

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
                    localHeadSha = await repository.getHeadSha();
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

/**
 * Recreates every local-only commit (oldest first) as a signed commit via the GitHub API,
 * re-parenting each onto the signed replacement of its predecessor. Returns the signed SHA
 * corresponding to the local HEAD.
 */
async function signLocalCommitChain({
    repository,
    octokit,
    owner,
    repo,
    localHeadSha,
    author,
    logger
}: {
    repository: ClonedRepository;
    octokit: Octokit;
    owner: string;
    repo: string;
    localHeadSha: string;
    author?: CommitAuthor;
    logger: PipelineLogger;
}): Promise<string> {
    let chain = await repository.getLocalOnlyCommits();
    if (chain.length === 0 || chain[chain.length - 1] !== localHeadSha) {
        // No remote-tracking refs to compare against (or HEAD moved unexpectedly) —
        // sign HEAD only, matching the previous single-commit behavior.
        chain = [localHeadSha];
    } else if (chain.length > MAX_SIGNED_CHAIN_LENGTH) {
        logger.warn(
            `Local commit chain has ${chain.length} commits (limit ${MAX_SIGNED_CHAIN_LENGTH}); signing HEAD only.`
        );
        chain = [localHeadSha];
    }

    // GitHub's web-flow signer keys off `committer`. The Git Data API defaults
    // `committer` to `author` when `author` is provided, so sending `author` alone
    // suppresses auto-signing. Omitting both lets GitHub fill them in from the
    // authenticated signing-capable principal (App installation, OAuth — never a PAT)
    // and stamp the "Verified" signature; the App's bot identity keeps the Fern bot
    // noreply email, so attribution-based tooling (replay commit detection,
    // findExistingUpdatablePR) still matches.
    const identityFields = author != null ? { author, committer: author } : {};

    const signedShaByLocalSha = new Map<string, string>();
    let signedSha = localHeadSha;
    for (const sha of chain) {
        const [treeSha, message, parents] = await Promise.all([
            repository.getCommitTreeHash(sha),
            repository.getCommitMessage(sha),
            repository.getCommitParents(sha)
        ]);
        const { data: signedCommit } = await octokit.git.createCommit({
            owner,
            repo,
            message,
            tree: treeSha,
            parents: parents.map((parent) => signedShaByLocalSha.get(parent) ?? parent),
            ...identityFields
        });
        signedShaByLocalSha.set(sha, signedCommit.sha);
        signedSha = signedCommit.sha;
    }
    if (chain.length > 1) {
        logger.debug(`Signed ${chain.length} local commits via the GitHub API`);
    }
    return signedSha;
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
    if (hasNumericStatus(err) && err.status === 404) {
        return true;
    }
    // GitHub's updateRef returns 422 (not 404) when the branch doesn't exist yet.
    if (hasNumericStatus(err) && err.status === 422) {
        const message = extractErrorMessage(err).toLowerCase();
        return message.includes("reference does not exist");
    }
    return false;
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
