import { ClonedRepository, parseRepository } from "@fern-api/github";
import { Octokit } from "@octokit/rest";
import { access, writeFile } from "fs/promises";
import { join } from "path";
import { FERN_BOT_EMAIL, FERN_BOT_NAME } from "../github/constants";
import { createReplayBranch } from "../github/createReplayBranch";
import type { ExistingPullRequest } from "../github/findExistingUpdatablePR";
import { findExistingUpdatablePR } from "../github/findExistingUpdatablePR";
import { parseCommitMessageForPR } from "../github/parseCommitMessage";
import type { PipelineLogger } from "../PipelineLogger";
import { formatReplayPrBody } from "../replay-summary";
import type { GithubStepConfig, GithubStepResult, PipelineContext, ReplayStepResult } from "../types";
import { BaseStep } from "./BaseStep";

/**
 * Step that handles GitHub operations: commit, push, branch creation, and PR management.
 * Supports both "push" and "pull-request" modes.
 *
 * When run after ReplayStep in the pipeline, reads replay results from PipelineContext
 * to determine whether to skip committing (replay already committed) and whether to
 * create divergent branches for conflict visualization.
 */
export class GithubStep extends BaseStep {
    readonly name = "github";

    constructor(
        outputDir: string,
        logger: PipelineLogger,
        private readonly config: GithubStepConfig
    ) {
        super(outputDir, logger);
    }

    async execute(context: PipelineContext): Promise<GithubStepResult> {
        const replayResult = context.previousStepResults.replay;

        // Derive skipCommit and replayConflictInfo from pipeline context if not explicitly set
        const skipCommit = this.config.skipCommit ?? this.deriveSkipCommit(replayResult);
        const replayConflictInfo = this.config.replayConflictInfo ?? this.deriveReplayConflictInfo(replayResult);

        try {
            this.logger.debug("Starting GitHub self-hosted flow in directory: " + this.outputDir);
            const repository = ClonedRepository.createAtPath(this.outputDir);

            const now = new Date();
            const formattedDate = now
                .toISOString()
                .replace("T", "_")
                .replace(/:/g, "-")
                .replace("Z", "")
                .replace(".", "_");
            const newPrBranch = `fern-bot/${formattedDate}`;

            // Ensure git commits are attributed to a bot user
            try {
                await repository.setUserAndEmail({
                    name: FERN_BOT_NAME,
                    email: FERN_BOT_EMAIL
                });
            } catch {
                // pass
            }

            const mode = this.config.mode;
            switch (mode) {
                case "pull-request":
                    return await this.executePullRequestMode(
                        repository,
                        newPrBranch,
                        skipCommit,
                        replayConflictInfo,
                        replayResult
                    );
                case "push":
                    return await this.executePushMode(repository, skipCommit);
                default: {
                    const exhaustive: never = mode;
                    throw new Error(`Unexpected GitHub mode: ${String(exhaustive)}`);
                }
            }
        } catch (error) {
            const message = `Error during GitHub self-hosted flow: ${String(error)}`;
            this.logger.error(message);
            return {
                executed: true,
                success: false
            };
        }
    }

    private async executePullRequestMode(
        repository: ClonedRepository,
        newPrBranch: string,
        skipCommit: boolean,
        replayConflictInfo:
            | { previousGenerationSha: string; currentGenerationSha: string; hasConflicts: boolean }
            | undefined,
        replayResult: ReplayStepResult | undefined
    ): Promise<GithubStepResult> {
        const baseBranch = this.config.branch ?? (await repository.getDefaultBranch());
        const octokit = new Octokit({ auth: this.config.token });
        const { owner, repo } = parseRepository(this.config.uri);

        const existingPR = await findExistingUpdatablePR(octokit, owner, repo, baseBranch, this.logger);

        let prBranch: string;
        let isUpdatingExistingPR = false;
        let generationBaseSha: string | undefined;

        if (existingPR != null) {
            this.logger.info(
                `Found existing updatable PR #${existingPR.number}, will update branch ${existingPR.headBranch}`
            );
            prBranch = existingPR.headBranch;
            isUpdatingExistingPR = true;
            if (skipCommit) {
                generationBaseSha = await createReplayBranch(
                    repository,
                    prBranch,
                    this.config.commitMessage,
                    replayConflictInfo,
                    this.logger
                );
            } else {
                await repository.checkoutRemoteBranch(prBranch);
            }
        } else {
            this.logger.debug(`No existing updatable PR found, creating new branch ${newPrBranch}`);
            prBranch = newPrBranch;
            if (skipCommit) {
                generationBaseSha = await createReplayBranch(
                    repository,
                    prBranch,
                    this.config.commitMessage,
                    replayConflictInfo,
                    this.logger
                );
            } else {
                await repository.checkout(prBranch);
            }
        }

        if (!skipCommit) {
            await this.ensureFernignore();

            this.logger.debug("Committing changes...");
            const finalCommitMessage = this.config.commitMessage ?? "SDK Generation";
            await repository.commitAllChanges(finalCommitMessage);
            this.logger.debug(`Committed changes to local copy of GitHub repository at ${this.outputDir}`);
        }

        const result: GithubStepResult = {
            executed: true,
            success: true,
            updatedExistingPr: isUpdatingExistingPR
        };

        if (!this.config.previewMode) {
            if (skipCommit && isUpdatingExistingPR) {
                // Replay commits replace the old PR branch entirely
                await repository.forcePush();
            } else {
                await repository.push();
            }
            const pushedBranch = await repository.getCurrentBranch();
            result.branchUrl = `https://github.com/${this.config.uri}/tree/${pushedBranch}`;
            this.logger.info(`Pushed branch: ${result.branchUrl}`);

            // Push a persistent tag pointing to the [fern-generated] synthetic commit.
            // This ensures the commit is reachable even after squash merges.
            if (generationBaseSha != null) {
                try {
                    const sanitizedName = this.config.generatorName?.replace(/\//g, "--");
                    const tagName =
                        sanitizedName != null ? `fern-generation-base--${sanitizedName}` : "fern-generation-base";
                    await repository.createAndPushTag(tagName, generationBaseSha);
                    this.logger.debug(`Pushed ${tagName} tag for generation tracking`);
                    result.generationBaseTagSha = generationBaseSha;
                } catch (error) {
                    this.logger.debug(
                        `Could not push generation tag: ${error instanceof Error ? error.message : String(error)}`
                    );
                }
            }
        }

        // Post commit status and toggle draft state based on replay conflicts.
        // This runs after push so the head SHA is available on the remote.
        if (!this.config.previewMode) {
            const headSha = await repository.getHeadSha();
            await this.postReplayConflictStatus(octokit, owner, repo, headSha, replayConflictInfo, replayResult);

            if (isUpdatingExistingPR && existingPR != null) {
                await this.togglePrDraftState(octokit, existingPR, replayConflictInfo);
            }
        }

        const finalCommitMessage = this.config.commitMessage ?? "SDK Generation";
        const { prTitle, prBody } = parseCommitMessageForPR(finalCommitMessage);
        const replaySection = formatReplayPrBody(replayResult, { branchName: prBranch });
        const enrichedBody = replaySection != null ? prBody + "\n\n---\n\n" + replaySection : prBody;

        if (isUpdatingExistingPR && existingPR != null) {
            this.logger.info(`Updated existing pull request: ${existingPR.htmlUrl}`);
            result.prUrl = existingPR.htmlUrl;
            result.prNumber = existingPR.number;

            try {
                await octokit.pulls.update({
                    owner,
                    repo,
                    pull_number: existingPR.number,
                    title: prTitle,
                    body: enrichedBody
                });
                this.logger.debug(`Updated PR #${existingPR.number} title and body`);
            } catch (error) {
                this.logger.debug(
                    `Failed to update PR title/body: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        } else {
            const head = `${owner}:${prBranch}`;

            const hasConflicts = replayConflictInfo?.hasConflicts === true;
            try {
                const { data: pullRequest } = await octokit.pulls.create({
                    owner,
                    repo,
                    title: prTitle,
                    body: enrichedBody,
                    head,
                    base: baseBranch,
                    draft: hasConflicts
                });

                this.logger.info(`Created pull request: ${pullRequest.html_url}`);
                result.prUrl = pullRequest.html_url;
                result.prNumber = pullRequest.number;
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                if (message.includes("A pull request already exists for")) {
                    this.logger.warn(`A pull request already exists for ${head}`);
                } else {
                    throw error;
                }
            }
        }

        return result;
    }

    private async executePushMode(repository: ClonedRepository, skipCommit: boolean): Promise<GithubStepResult> {
        if (!skipCommit) {
            if (this.config.branch != null) {
                this.logger.debug(`Checking out branch ${this.config.branch}`);
                await repository.checkout(this.config.branch);
            }

            await this.ensureFernignore();

            this.logger.debug("Committing changes...");
            const finalCommitMessage = this.config.commitMessage ?? "SDK Generation";
            await repository.commitAllChanges(finalCommitMessage);
            this.logger.debug(`Committed changes to local copy of GitHub repository at ${this.outputDir}`);
        }

        const result: GithubStepResult = {
            executed: true,
            success: true
        };

        if (!this.config.previewMode) {
            if (skipCommit) {
                await repository.forcePush();
            } else {
                await repository.pushWithRebasingRemote();
            }

            const pushedBranch = await repository.getCurrentBranch();
            result.branchUrl = `https://github.com/${this.config.uri}/tree/${pushedBranch}`;
            this.logger.info(`Pushed branch: ${result.branchUrl}`);
        }

        return result;
    }

    private async ensureFernignore(): Promise<void> {
        this.logger.debug("Checking for .fernignore file...");
        const fernignorePath = join(this.outputDir, ".fernignore");
        try {
            await access(fernignorePath);
            this.logger.debug(".fernignore already exists");
        } catch {
            this.logger.debug("Creating .fernignore file...");
            await writeFile(fernignorePath, "# Specify files that shouldn't be modified by Fern\n", "utf-8");
        }
    }

    /**
     * Derive skipCommit from replay step result.
     * When replay ran and produced a report (i.e. lockfile existed), it created its own commits.
     */
    private deriveSkipCommit(replayResult: ReplayStepResult | undefined): boolean {
        if (replayResult == null) {
            return false;
        }
        // Replay creates commits when it actually ran (report != null equivalent: flow is set)
        return replayResult.executed && replayResult.flow != null && replayResult.flow !== "first-generation";
    }

    /**
     * Derive replay conflict info from replay step result.
     */
    private deriveReplayConflictInfo(
        replayResult: ReplayStepResult | undefined
    ): { previousGenerationSha: string; currentGenerationSha: string; hasConflicts: boolean } | undefined {
        if (replayResult == null) {
            return undefined;
        }
        const hasConflicts = (replayResult.patchesWithConflicts ?? 0) > 0;
        const previousGenerationSha = replayResult.previousGenerationSha;
        const currentGenerationSha = replayResult.currentGenerationSha;
        if (hasConflicts && previousGenerationSha != null && currentGenerationSha != null) {
            return { previousGenerationSha, currentGenerationSha, hasConflicts: true };
        }
        return undefined;
    }

    /**
     * Toggle an existing PR's draft state based on replay conflicts.
     * Converts to draft when conflicts are detected (blocks merge),
     * marks as ready when a previously-conflicting PR is now clean.
     */
    private async togglePrDraftState(
        octokit: Octokit,
        existingPR: ExistingPullRequest,
        replayConflictInfo:
            | { previousGenerationSha: string; currentGenerationSha: string; hasConflicts: boolean }
            | undefined
    ): Promise<void> {
        const hasConflicts = replayConflictInfo?.hasConflicts === true;

        if (hasConflicts && !existingPR.isDraft) {
            await this.convertPrToDraft(octokit, existingPR.nodeId, existingPR.number);
        } else if (!hasConflicts && existingPR.isDraft) {
            await this.markPrReady(octokit, existingPR.nodeId, existingPR.number);
        }
    }

    /**
     * Convert a PR to draft via GraphQL so the merge button is disabled.
     */
    private async convertPrToDraft(octokit: Octokit, nodeId: string, prNumber: number): Promise<void> {
        try {
            await octokit.graphql(
                `mutation($id: ID!) {
                    convertPullRequestToDraft(input: {pullRequestId: $id}) {
                        pullRequest { isDraft }
                    }
                }`,
                { id: nodeId }
            );
            this.logger.info(`Converted PR #${prNumber} to draft due to replay conflicts`);
        } catch (error) {
            this.logger.debug(
                `Could not convert PR to draft: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Mark a draft PR as ready for review via GraphQL (conflicts resolved).
     */
    private async markPrReady(octokit: Octokit, nodeId: string, prNumber: number): Promise<void> {
        try {
            await octokit.graphql(
                `mutation($id: ID!) {
                    markPullRequestReadyForReview(input: {pullRequestId: $id}) {
                        pullRequest { isDraft }
                    }
                }`,
                { id: nodeId }
            );
            this.logger.info(`Marked PR #${prNumber} as ready (conflicts resolved)`);
        } catch (error) {
            this.logger.debug(`Could not mark PR as ready: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Post a commit status check indicating replay conflict state.
     * Namespaced per generator to support multi-generator repos.
     */
    private async postReplayConflictStatus(
        octokit: Octokit,
        owner: string,
        repo: string,
        sha: string,
        replayConflictInfo:
            | { previousGenerationSha: string; currentGenerationSha: string; hasConflicts: boolean }
            | undefined,
        replayResult: ReplayStepResult | undefined
    ): Promise<void> {
        if (replayResult == null || !replayResult.executed) {
            return;
        }

        const hasConflicts = replayConflictInfo?.hasConflicts === true;
        const conflictFileCount = (replayResult.conflictDetails ?? []).reduce(
            (sum, detail) => sum + detail.files.length,
            0
        );
        const sanitizedName = this.config.generatorName?.replace(/\//g, "--");
        const context =
            sanitizedName != null ? `fern / sdk customizations / ${sanitizedName}` : "fern / sdk customizations";

        try {
            await octokit.repos.createCommitStatus({
                owner,
                repo,
                sha,
                state: hasConflicts ? "failure" : "success",
                context,
                description: hasConflicts
                    ? `${conflictFileCount} file(s) need manual conflict resolution — see PR description`
                    : "All customizations applied"
            });
            this.logger.debug(`Posted ${hasConflicts ? "failing" : "passing"} commit status (${context})`);
        } catch (error) {
            this.logger.debug(
                `Could not post commit status: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }
}
