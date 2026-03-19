import { extractErrorMessage } from "@fern-api/core-utils";
import { ClonedRepository, parseRepository } from "@fern-api/github";
import { Octokit } from "@octokit/rest";
import { access, writeFile } from "fs/promises";
import { join } from "path";
import { createReplayBranch } from "../github/createReplayBranch";
import { findExistingUpdatablePR } from "../github/findExistingUpdatablePR";
import { parseCommitMessageForPR } from "../github/parseCommitMessage";
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

            // Ensure full git history is available.
            // Fiddle clones with --depth 1 for performance.
            // Replay references historical SHAs from .fern/replay.lock that won't exist
            // in a shallow clone.
            try {
                await repository.fetch(["--unshallow"]);
            } catch {
                // Not a shallow clone — already has full history. This is fine.
            }

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
            if (isUpdatingExistingPR) {
                // Force push is safe: fern-bot/* branches are exclusively owned by this pipeline,
                // and required when the clone lacks remote tracking refs (e.g., shallow clone from fiddle).
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
                    this.logger.debug(`Could not push generation tag: ${extractErrorMessage(error)}`);
                }
            }
        }

        const finalCommitMessage = this.config.commitMessage ?? "SDK Generation";
        const { prTitle, prBody } = parseCommitMessageForPR(
            finalCommitMessage,
            this.config.changelogEntry,
            this.config.prDescription,
            this.config.versionBumpReason
        );
        const replaySection = formatReplayPrBody(replayResult, { branchName: prBranch, repoUri: this.config.uri });
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
                this.logger.debug(`Failed to update PR title/body: ${extractErrorMessage(error)}`);
            }
        } else {
            const head = `${owner}:${prBranch}`;

            try {
                const { data: pullRequest } = await octokit.pulls.create({
                    owner,
                    repo,
                    title: prTitle,
                    body: enrichedBody,
                    head,
                    base: baseBranch
                });

                this.logger.info(`Created pull request: ${pullRequest.html_url}`);
                result.prUrl = pullRequest.html_url;
                result.prNumber = pullRequest.number;
            } catch (error) {
                const message = extractErrorMessage(error);
                if (message.includes("A pull request already exists for")) {
                    this.logger.warn(`A pull request already exists for ${head}`);
                } else {
                    throw error;
                }
            }
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
          }
        | undefined {
        if (replayResult == null) {
            return undefined;
        }
        const previousGenerationSha = replayResult.previousGenerationSha;
        const currentGenerationSha = replayResult.currentGenerationSha;
        if (previousGenerationSha != null && currentGenerationSha != null) {
            return {
                previousGenerationSha,
                currentGenerationSha
            };
        }
        return undefined;
    }
}
