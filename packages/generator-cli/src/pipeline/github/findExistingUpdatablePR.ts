import { Octokit } from "@octokit/rest";

import type { PipelineLogger } from "../PipelineLogger";
import { FERN_BOT_LOGIN } from "./constants";

export interface ExistingPullRequest {
    number: number;
    headBranch: string;
    htmlUrl: string;
    isDraft: boolean;
    nodeId: string;
}

export async function findExistingUpdatablePR(
    octokit: Octokit,
    owner: string,
    repo: string,
    baseBranch: string,
    logger: PipelineLogger
): Promise<ExistingPullRequest | undefined> {
    try {
        const { data: pulls } = await octokit.pulls.list({
            owner,
            repo,
            state: "open",
            base: baseBranch,
            sort: "updated",
            direction: "desc",
            per_page: 20
        });

        for (const pr of pulls) {
            const prAuthor = pr.user?.login;
            if (prAuthor !== FERN_BOT_LOGIN) {
                // In self-hosted mode, PRs may be authored by the token owner, not fern-api[bot].
                // Don't skip — let the commit check determine if PR is updatable.
                logger.debug(`PR #${pr.number}: author ${prAuthor} is not ${FERN_BOT_LOGIN}, checking commits anyway`);
            }

            if (!pr.head.ref.startsWith("fern-bot/")) {
                logger.debug(`PR #${pr.number} skipped: branch ${pr.head.ref} does not start with fern-bot/`);
                continue;
            }

            const hasOnlyGenerationCommits = await checkPRHasOnlyGenerationCommits(
                octokit,
                owner,
                repo,
                pr.number,
                logger
            );

            if (hasOnlyGenerationCommits) {
                logger.debug(`Found existing updatable PR #${pr.number} with branch ${pr.head.ref}`);
                return {
                    number: pr.number,
                    headBranch: pr.head.ref,
                    htmlUrl: pr.html_url,
                    isDraft: pr.draft ?? false,
                    nodeId: pr.node_id
                };
            } else {
                logger.debug(`PR #${pr.number} skipped: contains non-generation commits`);
            }
        }

        return undefined;
    } catch (error) {
        logger.debug(`Error finding existing PRs: ${error instanceof Error ? error.message : String(error)}`);
        return undefined;
    }
}

export async function checkPRHasOnlyGenerationCommits(
    octokit: Octokit,
    owner: string,
    repo: string,
    pullNumber: number,
    logger: PipelineLogger
): Promise<boolean> {
    try {
        const { data: commits } = await octokit.pulls.listCommits({
            owner,
            repo,
            pull_number: pullNumber,
            per_page: 100
        });

        for (const commit of commits) {
            const authorLogin = commit.author?.login;
            const authorEmail = commit.commit.author?.email;
            const commitMessage = commit.commit.message ?? "";

            const isFernAuthor =
                authorLogin === FERN_BOT_LOGIN ||
                authorEmail === "115122769+fern-api[bot]@users.noreply.github.com" ||
                commit.commit.author?.name === "fern-api";

            const isFernCommitMessage =
                commitMessage.startsWith("[fern-generated]") || commitMessage.startsWith("[fern-replay]");

            if (!isFernAuthor && !isFernCommitMessage) {
                logger.debug(
                    `Commit ${commit.sha.substring(0, 7)} is not a generation commit: ` +
                        `author=${authorLogin}, email=${authorEmail}, message="${commitMessage.slice(0, 40)}"`
                );
                return false;
            }
        }

        return true;
    } catch (error) {
        logger.debug(`Error checking PR commits: ${error instanceof Error ? error.message : String(error)}`);
        return false;
    }
}
