import { ClonedRepository, parseRepository } from "@fern-api/github";
import { Octokit } from "@octokit/rest";
import { access, writeFile } from "fs/promises";
import { join } from "path";
import { createReplayBranch } from "../github/createReplayBranch";
import type { ExistingPullRequest } from "../github/findExistingUpdatablePR";
import { findExistingUpdatablePR } from "../github/findExistingUpdatablePR";
import { parseCommitMessageForPR } from "../github/parseCommitMessage";
import { postConflictComments } from "../github/postConflictComments";
import type { PipelineLogger } from "../PipelineLogger";
import { formatReplayPrBody } from "../replay-summary";
import type { GithubStepConfig, GithubStepResult, PipelineContext, ReplayStepResult } from "../types";
import { BaseStep } from "./BaseStep";

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
                    return await this.executePushMode(repository);
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
                success: false,
                errorMessage: message
            };
        }
    }

    private async executePullRequestMode(
        repository: ClonedRepository,
        newPrBranch: string,
        skipCommit: boolean,
        replayConflictInfo:
            | {
                  previousGenerationSha: string;
                  currentGenerationSha: string;
                  hasConflicts: boolean;
                  baseBranchHead?: string;
              }
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
                await repository.forcePush();
            } else {
                await repository.push();
            }
            const pushedBranch = await repository.getCurrentBranch();
            result.branchUrl = `https://github.com/${this.config.uri}/tree/${pushedBranch}`;
            this.logger.info(`Pushed branch: ${result.branchUrl}`);

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

        // Runs after push so head SHA is available on remote
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

        if (!this.config.previewMode && replayConflictInfo?.hasConflicts === true && result.prNumber != null) {
            await postConflictComments(octokit, owner, repo, result.prNumber, replayResult, this.logger);
        }

        if (
            !this.config.previewMode &&
            result.prNumber != null &&
            replayConflictInfo?.hasConflicts === true &&
            replayResult != null
        ) {
            await this.postWebEditorFallbackComment(
                octokit,
                owner,
                repo,
                result.prNumber,
                prBranch,
                baseBranch,
                replayResult
            );
        }

        return result;
    }

    private async executePushMode(repository: ClonedRepository): Promise<GithubStepResult> {
        if (this.config.branch != null) {
            this.logger.debug(`Checking out branch ${this.config.branch}`);
            await repository.checkout(this.config.branch);
        }

        await this.ensureFernignore();

        this.logger.debug("Committing changes...");
        const finalCommitMessage = this.config.commitMessage ?? "SDK Generation";
        await repository.commitAllChanges(finalCommitMessage);
        this.logger.debug(`Committed changes to local copy of GitHub repository at ${this.outputDir}`);

        const result: GithubStepResult = {
            executed: true,
            success: true
        };

        if (!this.config.previewMode) {
            await repository.pushWithRebasingRemote();

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

    private deriveSkipCommit(replayResult: ReplayStepResult | undefined): boolean {
        if (replayResult == null) {
            return false;
        }
        return replayResult.executed && replayResult.flow != null && replayResult.flow !== "first-generation";
    }

    private deriveReplayConflictInfo(replayResult: ReplayStepResult | undefined):
        | {
              previousGenerationSha: string;
              currentGenerationSha: string;
              hasConflicts: boolean;
              baseBranchHead?: string;
          }
        | undefined {
        if (replayResult == null) {
            return undefined;
        }
        const hasConflicts = (replayResult.patchesWithConflicts ?? 0) > 0;
        const previousGenerationSha = replayResult.previousGenerationSha;
        const currentGenerationSha = replayResult.currentGenerationSha;
        if (previousGenerationSha != null && currentGenerationSha != null) {
            return {
                previousGenerationSha,
                currentGenerationSha,
                hasConflicts,
                baseBranchHead: replayResult.baseBranchHead
            };
        }
        return undefined;
    }

    private async togglePrDraftState(
        octokit: Octokit,
        existingPR: ExistingPullRequest,
        replayConflictInfo:
            | {
                  previousGenerationSha: string;
                  currentGenerationSha: string;
                  hasConflicts: boolean;
                  baseBranchHead?: string;
              }
            | undefined
    ): Promise<void> {
        const hasConflicts = replayConflictInfo?.hasConflicts === true;

        if (hasConflicts && !existingPR.isDraft) {
            await this.convertPrToDraft(octokit, existingPR.nodeId, existingPR.number);
        } else if (!hasConflicts && existingPR.isDraft) {
            await this.markPrReady(octokit, existingPR.nodeId, existingPR.number);
        }
    }

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

    private async postReplayConflictStatus(
        octokit: Octokit,
        owner: string,
        repo: string,
        sha: string,
        replayConflictInfo:
            | {
                  previousGenerationSha: string;
                  currentGenerationSha: string;
                  hasConflicts: boolean;
                  baseBranchHead?: string;
              }
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

    private async postWebEditorFallbackComment(
        octokit: Octokit,
        owner: string,
        repo: string,
        prNumber: number,
        branchName: string,
        baseBranch: string,
        replayResult: ReplayStepResult
    ): Promise<void> {
        try {
            const webEditorLikelyDisabled = await this.isWebEditorLikelyDisabled(
                octokit,
                owner,
                repo,
                prNumber,
                replayResult
            );

            if (!webEditorLikelyDisabled) {
                this.logger.debug(`PR #${prNumber}: web conflict editor appears usable, skipping fallback comment`);
                return;
            }

            const comment = buildWebEditorFallbackComment(branchName, baseBranch);
            await octokit.issues.createComment({
                owner,
                repo,
                issue_number: prNumber,
                body: comment
            });
            this.logger.info(`Posted web-editor fallback comment on PR #${prNumber}`);
        } catch (error) {
            this.logger.debug(
                `Could not post web-editor fallback comment: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    private async isWebEditorLikelyDisabled(
        octokit: Octokit,
        owner: string,
        repo: string,
        prNumber: number,
        replayResult: ReplayStepResult
    ): Promise<boolean> {
        const conflictDetails = replayResult.conflictDetails ?? [];
        const allConflictFiles = conflictDetails.flatMap((d) => d.files);
        const totalConflictFiles = allConflictFiles.length;

        const hasFileDeletionConflict = allConflictFiles.some((f) => {
            const status = (f.status ?? "").toLowerCase();
            const reason = (f.conflictReason ?? "").toLowerCase();
            return status === "skipped" || reason.includes("delete") || reason.includes("removed");
        });

        if (hasFileDeletionConflict) {
            this.logger.debug(`PR #${prNumber}: detected file deletion conflict, web editor likely disabled`);
            return true;
        }

        if (totalConflictFiles >= WEB_EDITOR_FILE_THRESHOLD) {
            this.logger.debug(
                `PR #${prNumber}: ${totalConflictFiles} conflicting files exceeds threshold (${WEB_EDITOR_FILE_THRESHOLD}), web editor likely disabled`
            );
            return true;
        }

        const totalHunks = (replayResult.conflicts ?? []).reduce(
            (sum, fileConflict) => sum + fileConflict.conflicts.length,
            0
        );
        if (totalHunks >= WEB_EDITOR_HUNK_THRESHOLD) {
            this.logger.debug(
                `PR #${prNumber}: ${totalHunks} conflict hunks exceeds threshold (${WEB_EDITOR_HUNK_THRESHOLD}), web editor likely disabled`
            );
            return true;
        }

        const mergeableState = await this.pollMergeableState(octokit, owner, repo, prNumber);
        if (mergeableState.mergeable === null) {
            this.logger.debug(`PR #${prNumber}: mergeable state still null after polling, web editor likely disabled`);
            return true;
        }

        return false;
    }

    private async pollMergeableState(
        octokit: Octokit,
        owner: string,
        repo: string,
        prNumber: number
    ): Promise<{ mergeable: boolean | null; mergeableState: string }> {
        for (let attempt = 0; attempt < MERGEABLE_POLL_MAX_ATTEMPTS; attempt++) {
            const { data: pr } = await octokit.pulls.get({
                owner,
                repo,
                pull_number: prNumber
            });

            if (pr.mergeable != null) {
                return {
                    mergeable: pr.mergeable,
                    mergeableState: pr.mergeable_state
                };
            }

            if (attempt < MERGEABLE_POLL_MAX_ATTEMPTS - 1) {
                await sleep(MERGEABLE_POLL_DELAY_MS);
            }
        }

        return { mergeable: null, mergeableState: "unknown" };
    }
}

const WEB_EDITOR_FILE_THRESHOLD = 20;
const WEB_EDITOR_HUNK_THRESHOLD = 50;
const MERGEABLE_POLL_MAX_ATTEMPTS = 3;
const MERGEABLE_POLL_DELAY_MS = 1500;

function buildWebEditorFallbackComment(branchName: string, baseBranch: string): string {
    const lines = [
        `> **Note:** These conflicts may be too complex for GitHub's web editor. To resolve locally:`,
        `>`,
        `> 1. Check out this branch:`,
        `>    \`\`\`sh`,
        `>    git fetch origin && git checkout ${branchName}`,
        `>    \`\`\``,
        `> 2. Merge the base branch:`,
        `>    \`\`\`sh`,
        `>    git merge origin/${baseBranch}`,
        `>    \`\`\``,
        `> 3. Resolve conflicts in your editor (VS Code, IntelliJ, etc. have built-in merge tools)`,
        `> 4. Commit and push:`,
        `>    \`\`\`sh`,
        `>    git add -A && git commit -m "resolve conflicts" && git push`,
        `>    \`\`\``,
        `>`,
        `> **Label guide:** In your editor's merge view, "current" = new generated code, "incoming" = your customization.`
    ];
    return lines.join("\n");
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
