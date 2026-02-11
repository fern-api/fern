import { computeSemanticVersion } from "@fern-api/api-workspace-commons";
import { FernToken, getAccessToken } from "@fern-api/auth";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { fernConfigJson, GeneratorInvocation, generatorsYml } from "@fern-api/configuration";
import { createVenusService } from "@fern-api/core";
import { assertNever, ContainerRunner, replaceEnvVariables } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { ClonedRepository, cloneRepository, parseRepository } from "@fern-api/github";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { FernIr, PublishTarget } from "@fern-api/ir-sdk";
import { getDynamicGeneratorConfig } from "@fern-api/remote-workspace-runner";
import { type ReplayConfig, type ReplayReport, ReplayService } from "@fern-api/replay";
import { TaskContext } from "@fern-api/task-context";
import { FernVenusApi } from "@fern-api/venus-api-sdk";
import {
    AbstractAPIWorkspace,
    getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation
} from "@fern-api/workspace-loader";
import { Octokit } from "@octokit/rest";
import chalk from "chalk";
import * as fs from "fs/promises";
import os from "os";
import path from "path";
import tmp from "tmp-promise";
import { writeFilesToDiskAndRunGenerator } from "./runGenerator.js";
import { isAutoVersion } from "./VersionUtils.js";

export async function runLocalGenerationForWorkspace({
    token,
    projectConfig,
    workspace,
    generatorGroup,
    version,
    keepDocker,
    inspect,
    context,
    absolutePathToPreview,
    runner,
    ai,
    replay
}: {
    token: FernToken | undefined;
    projectConfig: fernConfigJson.ProjectConfig;
    workspace: AbstractAPIWorkspace<unknown>;
    generatorGroup: generatorsYml.GeneratorGroup;
    version: string | undefined;
    keepDocker: boolean;
    context: TaskContext;
    absolutePathToPreview: AbsoluteFilePath | undefined;
    runner: ContainerRunner | undefined;
    inspect: boolean;
    ai: generatorsYml.AiServicesSchema | undefined;
    replay: generatorsYml.ReplayConfigSchema | undefined;
}): Promise<void> {
    const results = await Promise.all(
        generatorGroup.generators.map(async (generatorInvocation) => {
            return context.runInteractiveTask({ name: generatorInvocation.name }, async (interactiveTaskContext) => {
                const substituteEnvVars = <T>(stringOrObject: T) =>
                    replaceEnvVariables(stringOrObject, { onError: (e) => interactiveTaskContext.failAndThrow(e) });

                generatorInvocation = substituteEnvVars(generatorInvocation);

                const fernWorkspace = await workspace.toFernWorkspace(
                    { context },
                    getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation(generatorInvocation),
                    generatorInvocation.apiOverride?.specs
                );

                const dynamicGeneratorConfig = getDynamicGeneratorConfig({
                    apiName: fernWorkspace.definition.rootApiFile.contents.name,
                    organization: projectConfig.organization,
                    generatorInvocation: generatorInvocation
                });

                const packageName = getPackageNameFromGeneratorConfig(generatorInvocation);
                version = version ?? (await computeSemanticVersion({ packageName, generatorInvocation }));

                const intermediateRepresentation = generateIntermediateRepresentation({
                    workspace: fernWorkspace,
                    audiences: generatorGroup.audiences,
                    generationLanguage: generatorInvocation.language,
                    keywords: generatorInvocation.keywords,
                    smartCasing: generatorInvocation.smartCasing,
                    exampleGeneration: {
                        includeOptionalRequestPropertyExamples: false,
                        disabled: generatorInvocation.disableExamples
                    },
                    readme: generatorInvocation.readme,
                    version: version ?? (await computeSemanticVersion({ packageName, generatorInvocation })),
                    packageName,
                    context,
                    sourceResolver: new SourceResolverImpl(context, fernWorkspace),
                    dynamicGeneratorConfig,
                    generationMetadata: {
                        cliVersion: workspace.cliVersion,
                        generatorName: generatorInvocation.name,
                        generatorVersion: generatorInvocation.version,
                        generatorConfig: generatorInvocation.config
                    }
                });

                const venus = createVenusService({ token: token?.value });

                if (generatorInvocation.absolutePathToLocalOutput == null) {
                    token = await getAccessToken();
                    if (token == null) {
                        interactiveTaskContext.failWithoutThrowing("Please provide a FERN_TOKEN in your environment.");
                        return;
                    }
                }

                const organization = await venus.organization.get(
                    FernVenusApi.OrganizationId(projectConfig.organization)
                );

                if (generatorInvocation.absolutePathToLocalOutput == null && !organization.ok) {
                    interactiveTaskContext.failWithoutThrowing(
                        `Failed to load details for organization ${projectConfig.organization}.`
                    );
                    return;
                }

                if (organization.ok) {
                    if (organization.body.isWhitelabled) {
                        if (intermediateRepresentation.readmeConfig == null) {
                            intermediateRepresentation.readmeConfig = emptyReadmeConfig;
                        }
                        intermediateRepresentation.readmeConfig.whiteLabel = true;
                    }
                    intermediateRepresentation.selfHosted = organization.body.selfHostedSdKs;
                }

                // Set the publish config on the intermediateRepresentation if available
                const publishConfig = getPublishConfig({
                    generatorInvocation,
                    org: organization.ok ? organization.body : undefined,
                    version,
                    packageName,
                    context: interactiveTaskContext
                });
                if (publishConfig != null) {
                    intermediateRepresentation.publishConfig = publishConfig;
                }

                const absolutePathToPreviewForGenerator = resolveAbsolutePathToLocalPreview(
                    absolutePathToPreview,
                    generatorInvocation
                );

                const absolutePathToLocalOutput =
                    absolutePathToPreviewForGenerator ??
                    generatorInvocation.absolutePathToLocalOutput ??
                    AbsoluteFilePath.of(await tmp.dir().then((dir) => dir.path));

                const selfhostedGithubConfig = getSelfhostedGithubConfig(
                    generatorInvocation,
                    absolutePathToPreviewForGenerator != null
                );

                // Validate that automatic versioning requires self-hosted GitHub configuration
                if (version != null && isAutoVersion(version)) {
                    if (selfhostedGithubConfig == null) {
                        context.failAndThrow(
                            `Automatic versioning (--version AUTO) requires a self-hosted GitHub repository configuration. ` +
                                `Regular GitHub repositories are not supported because auto versioning needs to push changes back to the repository. ` +
                                `Please configure your generator with self-hosted GitHub output in generators.yml. ` +
                                `Example:\n` +
                                `generators:\n` +
                                `  - name: fernapi/fern-typescript-sdk\n` +
                                `    version: latest\n` +
                                `    github:\n` +
                                `      uri: your-org/your-sdk-repo\n` +
                                `      token: \${GITHUB_TOKEN}\n` +
                                `      mode: pull-request\n`
                        );
                    }
                }

                if (selfhostedGithubConfig != null) {
                    await fs.rm(absolutePathToLocalOutput, { recursive: true, force: true });
                    await fs.mkdir(absolutePathToLocalOutput, { recursive: true });

                    // Log git environment info for debugging
                    interactiveTaskContext.logger.debug(
                        `Self-hosted GitHub mode: cloning ${selfhostedGithubConfig.uri} to ${absolutePathToLocalOutput}`
                    );
                    try {
                        const { execSync } = await import("child_process");
                        const gitPath = execSync("which git 2>/dev/null || echo 'not found'", {
                            encoding: "utf-8"
                        }).trim();
                        const gitVersion = execSync("git --version 2>/dev/null || echo 'unknown'", {
                            encoding: "utf-8"
                        }).trim();
                        interactiveTaskContext.logger.debug(
                            `Git environment: path=${gitPath}, version=${gitVersion}, PATH=${process.env.PATH ?? "unset"}`
                        );
                    } catch {
                        interactiveTaskContext.logger.debug(
                            `Git environment: unable to determine git info, PATH=${process.env.PATH ?? "unset"}`
                        );
                    }

                    try {
                        const repo = await cloneRepository({
                            githubRepository: selfhostedGithubConfig.uri,
                            installationToken: selfhostedGithubConfig.token,
                            targetDirectory: absolutePathToLocalOutput,
                            timeoutMs: 30000 // 30 seconds timeout for credential/network issues
                        });

                        // For push mode and pull-request mode with a target branch,
                        // checkout the target branch while the working tree is clean.
                        // This prevents non-fast-forward errors that occur when trying to checkout
                        // after files have been generated (dirty working tree).
                        const mode = selfhostedGithubConfig.mode ?? "push";
                        if ((mode === "push" || mode === "pull-request") && selfhostedGithubConfig.branch != null) {
                            interactiveTaskContext.logger.debug(
                                `Checking out branch ${selfhostedGithubConfig.branch} before generation`
                            );
                            // For pull-request mode, the branch must exist on remote
                            // (to match remote generation behavior)
                            if (mode === "pull-request") {
                                const branchExists = await repo.remoteBranchExists(selfhostedGithubConfig.branch);
                                if (!branchExists) {
                                    const parsedRepo = parseRepository(selfhostedGithubConfig.uri);
                                    interactiveTaskContext.failAndThrow(
                                        `Branch ${selfhostedGithubConfig.branch} does not exist in repository ${parsedRepo.owner}/${parsedRepo.repo}`
                                    );
                                }
                            }
                            await repo.checkoutRemoteBranch(selfhostedGithubConfig.branch);
                        }
                    } catch (error) {
                        interactiveTaskContext.failAndThrow(
                            `Failed to clone GitHub repository ${selfhostedGithubConfig.uri}: ${error instanceof Error ? error.message : String(error)}`
                        );
                    }
                }

                let absolutePathToLocalSnippetJSON: AbsoluteFilePath | undefined = undefined;
                if (generatorInvocation.raw?.snippets?.path != null) {
                    absolutePathToLocalSnippetJSON = AbsoluteFilePath.of(
                        join(workspace.absoluteFilePath, RelativeFilePath.of(generatorInvocation.raw.snippets.path))
                    );
                }
                if (absolutePathToLocalSnippetJSON == null && selfhostedGithubConfig != null) {
                    absolutePathToLocalSnippetJSON = AbsoluteFilePath.of(
                        (await getWorkspaceTempDir()).path + "/snippet.json"
                    );
                }

                // NOTE(tjb9dc): Important that we get a new temp dir per-generator, as we don't want their local files to collide.
                const workspaceTempDir = await getWorkspaceTempDir();

                const { shouldCommit, autoVersioningCommitMessage } = await writeFilesToDiskAndRunGenerator({
                    organization: projectConfig.organization,
                    absolutePathToFernConfig: projectConfig._absolutePath,
                    workspace: fernWorkspace,
                    generatorInvocation,
                    absolutePathToLocalOutput,
                    absolutePathToLocalSnippetJSON,
                    absolutePathToLocalSnippetTemplateJSON: undefined,
                    version,
                    audiences: generatorGroup.audiences,
                    workspaceTempDir,
                    keepDocker,
                    context: interactiveTaskContext,
                    irVersionOverride: generatorInvocation.irVersionOverride,
                    outputVersionOverride: version,
                    writeUnitTests: true,
                    generateOauthClients: organization.ok ? (organization?.body.oauthClientEnabled ?? false) : false,
                    generatePaginatedClients: organization.ok ? (organization?.body.paginationEnabled ?? false) : false,
                    includeOptionalRequestPropertyExamples: false,
                    inspect,
                    executionEnvironment: undefined, // This should use the Docker fallback with proper image name
                    ir: intermediateRepresentation,
                    whiteLabel: organization.ok ? organization.body.isWhitelabled : false,
                    runner,
                    ai
                });

                interactiveTaskContext.logger.info(chalk.green("Wrote files to " + absolutePathToLocalOutput));

                // --- REPLAY INTEGRATION ---
                const replayConfig = convertReplayConfig(replay);
                let replayReport: ReplayReport | undefined;

                // Skip replay in preview mode (no persistent git history)
                if (replayConfig != null && absolutePathToPreviewForGenerator == null) {
                    try {
                        const gitDir = join(absolutePathToLocalOutput, RelativeFilePath.of(".git"));
                        const isGitRepo = await fs
                            .access(gitDir)
                            .then(() => true)
                            .catch(() => false);

                        if (isGitRepo) {
                            interactiveTaskContext.logger.info("Running Fern Replay...");
                            const replayService = new ReplayService(absolutePathToLocalOutput, replayConfig);
                            replayReport = await replayService.runReplay({
                                stageOnly: selfhostedGithubConfig == null,
                                cliVersion: "unknown",
                                generatorVersions: {
                                    [generatorInvocation.name]: generatorInvocation.version
                                }
                            });

                            if (replayReport.patchesDetected > 0) {
                                interactiveTaskContext.logger.info(
                                    `Replay: ${replayReport.patchesApplied}/${replayReport.patchesDetected} customizations applied`
                                );
                            }
                            if (replayReport.patchesWithConflicts > 0) {
                                interactiveTaskContext.logger.warn(
                                    `Replay: ${replayReport.patchesWithConflicts} patch(es) had conflicts`
                                );
                                for (const conflict of replayReport.conflicts) {
                                    interactiveTaskContext.logger.warn(`  Conflict in ${conflict.file}`);
                                }
                                const isCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";
                                if (isCI && replayConfig.on_conflict?.ci === "fail") {
                                    interactiveTaskContext.failAndThrow(
                                        `Replay: ${replayReport.patchesWithConflicts} conflict(s) detected in CI mode.`
                                    );
                                }
                            }
                            if (replayReport.warnings != null) {
                                for (const warning of replayReport.warnings) {
                                    interactiveTaskContext.logger.warn(`Replay: ${warning}`);
                                }
                            }

                            // Ensure .fernignore has replay entries so the lockfile survives
                            // future generation wipes. This handles first-generation without bootstrap.
                            await ensureReplayFernignoreEntries(absolutePathToLocalOutput);
                        }
                    } catch (error) {
                        interactiveTaskContext.logger.warn(
                            `Replay: failed - ${error instanceof Error ? error.message : String(error)}`
                        );
                    }
                }
                // --- END REPLAY INTEGRATION ---

                if (selfhostedGithubConfig != null && shouldCommit) {
                    await postProcessGithubSelfHosted(
                        interactiveTaskContext,
                        selfhostedGithubConfig,
                        absolutePathToLocalOutput,
                        autoVersioningCommitMessage,
                        replayReport != null
                    );
                }
            });
        })
    );

    if (results.some((didSucceed) => !didSucceed)) {
        context.failAndThrow();
    }
}

function getPackageNameFromGeneratorConfig(generatorInvocation: GeneratorInvocation): string | undefined {
    // Check output.package-name for npm/PyPI/etc.
    if (typeof generatorInvocation.raw?.output === "object" && generatorInvocation.raw?.output !== null) {
        const packageName = (generatorInvocation.raw.output as { ["package-name"]?: string })["package-name"];
        if (packageName != null) {
            return packageName;
        }

        // Check output.coordinate for Maven (Java)
        const coordinate = (generatorInvocation.raw.output as { coordinate?: string }).coordinate;
        if (coordinate != null) {
            return coordinate;
        }
    }

    // Check config.package_name if output.package-name is not set
    if (typeof generatorInvocation.raw?.config === "object" && generatorInvocation.raw?.config !== null) {
        const packageName = (generatorInvocation.raw.config as { package_name?: string }).package_name;
        if (packageName != null) {
            return packageName;
        }

        // go-sdk generator uses module.path to set the package name
        const modulePath = (generatorInvocation.raw.config as { module?: { path?: string } }).module?.path;
        if (modulePath != null) {
            return modulePath;
        }
    }
    return undefined;
}
function resolveAbsolutePathToLocalPreview(
    absolutePathToPreview: AbsoluteFilePath | undefined,
    generatorInvocation: GeneratorInvocation
): AbsoluteFilePath | undefined {
    if (absolutePathToPreview == null) {
        return undefined;
    }
    const generatorName = generatorInvocation.name.split("/").pop() ?? "sdk";
    const subfolderName = generatorName.replace(/[^a-zA-Z0-9-_]/g, "_");

    return absolutePathToPreview ? join(absolutePathToPreview, RelativeFilePath.of(subfolderName)) : undefined;
}

function parseCommitMessageForPR(commitMessage: string): { prTitle: string; prBody: string } {
    const lines = commitMessage.split("\n");
    const prTitle = lines[0]?.trim() || "SDK Generation";
    const prBody = lines.slice(1).join("\n").trim() || "Automated SDK generation by Fern";
    return { prTitle, prBody };
}

const FERN_BOT_NAME = "fern-api";
const FERN_BOT_EMAIL = "115122769+fern-api[bot]@users.noreply.github.com";
const FERN_BOT_LOGIN = "fern-api[bot]";

interface ExistingPullRequest {
    number: number;
    headBranch: string;
    htmlUrl: string;
}

async function findExistingUpdatablePR(
    octokit: Octokit,
    owner: string,
    repo: string,
    baseBranch: string,
    context: TaskContext
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
            if (!pr.head.ref.startsWith("fern-bot/")) {
                context.logger.debug(`PR #${pr.number} skipped: branch ${pr.head.ref} does not start with fern-bot/`);
                continue;
            }

            const prAuthor = pr.user?.login;
            if (prAuthor !== FERN_BOT_LOGIN) {
                // In self-hosted mode, PRs are authored by the token owner, not fern-api[bot].
                // The fern-bot/ branch prefix + generation-only commit check is sufficient.
                context.logger.debug(
                    `PR #${pr.number}: author ${prAuthor} is not ${FERN_BOT_LOGIN}, checking commits for fern-bot/ branch`
                );
            }

            const hasOnlyGenerationCommits = await checkPRHasOnlyGenerationCommits(
                octokit,
                owner,
                repo,
                pr.number,
                context
            );

            if (hasOnlyGenerationCommits) {
                context.logger.debug(`Found existing updatable PR #${pr.number} with branch ${pr.head.ref}`);
                return {
                    number: pr.number,
                    headBranch: pr.head.ref,
                    htmlUrl: pr.html_url
                };
            } else {
                context.logger.debug(`PR #${pr.number} skipped: contains non-generation commits`);
            }
        }

        return undefined;
    } catch (error) {
        context.logger.debug(`Error finding existing PRs: ${error instanceof Error ? error.message : String(error)}`);
        return undefined;
    }
}

async function checkPRHasOnlyGenerationCommits(
    octokit: Octokit,
    owner: string,
    repo: string,
    pullNumber: number,
    context: TaskContext
): Promise<boolean> {
    try {
        const { data: commits } = await octokit.pulls.listCommits({
            owner,
            repo,
            pull_number: pullNumber,
            per_page: 100
        });

        // Check if all commits are Fern-managed (generation, replay, or replayed patches).
        // When replay is active, the PR will contain:
        //   [fern-generated] ... → replayed patch commits (original messages) → [fern-replay] ...
        // The replayed patches between [fern-generated] and [fern-replay] are Fern-managed.
        const hasGenerationCommit = commits.some((c) => (c.commit.message ?? "").startsWith("[fern-generated]"));
        const hasReplayCommit = commits.some((c) => (c.commit.message ?? "").startsWith("[fern-replay]"));

        for (const commit of commits) {
            const authorLogin = commit.author?.login;
            const authorEmail = commit.commit.author?.email;
            const commitMessage = commit.commit.message ?? "";

            const isFernAuthor =
                authorLogin === FERN_BOT_LOGIN ||
                authorEmail === FERN_BOT_EMAIL ||
                commit.commit.author?.name === FERN_BOT_NAME;

            const isFernCommitMessage =
                commitMessage.startsWith("[fern-generated]") || commitMessage.startsWith("[fern-replay]");

            // If the PR has both [fern-generated] and [fern-replay] commits,
            // intermediate commits are replayed patches and are Fern-managed.
            const isReplayedPatch = hasGenerationCommit && hasReplayCommit;

            if (!isFernAuthor && !isFernCommitMessage && !isReplayedPatch) {
                context.logger.debug(
                    `Commit ${commit.sha.substring(0, 7)} is not a generation commit: ` +
                        `author=${authorLogin}, email=${authorEmail}, message=${commitMessage.substring(0, 40)}`
                );
                return false;
            }
        }

        return true;
    } catch (error) {
        context.logger.debug(`Error checking PR commits: ${error instanceof Error ? error.message : String(error)}`);
        return false;
    }
}

async function postProcessGithubSelfHosted(
    context: TaskContext,
    selfhostedGithubConfig: SelhostedGithubConfig,
    absolutePathToLocalOutput: AbsoluteFilePath,
    commitMessage?: string,
    skipCommit?: boolean
): Promise<void> {
    try {
        context.logger.debug("Starting GitHub self-hosted flow in directory: " + absolutePathToLocalOutput);
        const repository = ClonedRepository.createAtPath(absolutePathToLocalOutput);
        const now = new Date();
        const formattedDate = now.toISOString().replace("T", "_").replace(/:/g, "-").replace("Z", "").replace(".", "_");
        const newPrBranch = `fern-bot/${formattedDate}`;
        // Ensure git commits are attributed to a bot user so pushes/PRs have a consistent author.
        try {
            // Use repository helper to set git user/email if available
            await repository.setUserAndEmail({
                name: FERN_BOT_NAME,
                email: FERN_BOT_EMAIL
            });
        } catch (_other) {
            // pass
        }

        const mode = selfhostedGithubConfig.mode ?? "push";
        switch (mode) {
            case "pull-request": {
                const baseBranch = selfhostedGithubConfig.branch ?? (await repository.getDefaultBranch());

                const octokit = new Octokit({
                    auth: selfhostedGithubConfig.token
                });
                const parsedRepo = parseRepository(selfhostedGithubConfig.uri);
                const { owner, repo } = parsedRepo;

                const existingPR = await findExistingUpdatablePR(octokit, owner, repo, baseBranch, context);

                let prBranch: string;
                let isUpdatingExistingPR = false;

                if (existingPR != null) {
                    context.logger.info(
                        `Found existing updatable PR #${existingPR.number}, will update branch ${existingPR.headBranch}`
                    );
                    prBranch = existingPR.headBranch;
                    isUpdatingExistingPR = true;
                    if (skipCommit) {
                        // Replay already committed on the current branch.
                        // Create a branch from HEAD with the PR's name to preserve replay commits.
                        await repository.createBranchFromHead(prBranch);
                    } else {
                        await repository.checkoutRemoteBranch(prBranch);
                    }
                } else {
                    context.logger.debug(`No existing updatable PR found, creating new branch ${newPrBranch}`);
                    prBranch = newPrBranch;
                    await repository.checkout(prBranch);
                }

                const finalCommitMessage = commitMessage ?? "SDK Generation";

                if (!skipCommit) {
                    context.logger.debug("Checking for .fernignore file...");
                    const fernignorePath = join(absolutePathToLocalOutput, RelativeFilePath.of(".fernignore"));
                    try {
                        await fs.access(fernignorePath);
                        context.logger.debug(".fernignore already exists");
                    } catch {
                        context.logger.debug("Creating .fernignore file...");
                        await fs.writeFile(
                            fernignorePath,
                            "# Specify files that shouldn't be modified by Fern\n",
                            "utf-8"
                        );
                    }

                    context.logger.debug("Committing changes...");
                    await repository.commitAllChanges(finalCommitMessage);
                    context.logger.debug(
                        `Committed changes to local copy of GitHub repository at ${absolutePathToLocalOutput}`
                    );
                }

                if (!selfhostedGithubConfig.previewMode) {
                    if (skipCommit && isUpdatingExistingPR) {
                        // Replay created commits from HEAD on a new branch; force-push to update the existing PR
                        await repository.forcePush();
                    } else {
                        await repository.push();
                    }
                    const pushedBranch = await repository.getCurrentBranch();
                    context.logger.info(
                        `Pushed branch: https://github.com/${selfhostedGithubConfig.uri}/tree/${pushedBranch}`
                    );
                }

                if (isUpdatingExistingPR && existingPR != null) {
                    context.logger.info(`Updated existing pull request: ${existingPR.htmlUrl}`);

                    const { prTitle, prBody } = parseCommitMessageForPR(finalCommitMessage);
                    try {
                        await octokit.pulls.update({
                            owner,
                            repo,
                            pull_number: existingPR.number,
                            title: prTitle,
                            body: prBody
                        });
                        context.logger.debug(`Updated PR #${existingPR.number} title and body`);
                    } catch (error) {
                        context.logger.debug(
                            `Failed to update PR title/body: ${error instanceof Error ? error.message : String(error)}`
                        );
                    }
                } else {
                    const head = `${owner}:${prBranch}`;
                    const { prTitle, prBody } = parseCommitMessageForPR(finalCommitMessage);

                    try {
                        const { data: pullRequest } = await octokit.pulls.create({
                            owner,
                            repo,
                            title: prTitle,
                            body: prBody,
                            head,
                            base: baseBranch,
                            draft: false
                        });

                        context.logger.info(`Created pull request: ${pullRequest.html_url}`);
                    } catch (error) {
                        const message = error instanceof Error ? error.message : String(error);
                        if (message.includes("A pull request already exists for")) {
                            context.failWithoutThrowing(`A pull request already exists for ${head}`);
                        } else {
                            throw error;
                        }
                    }
                }
                break;
            }
            case "push": {
                if (selfhostedGithubConfig.branch != null) {
                    context.logger.debug(`Checking out branch ${selfhostedGithubConfig.branch}`);
                    await repository.checkout(selfhostedGithubConfig.branch);
                }

                if (!skipCommit) {
                    context.logger.debug("Checking for .fernignore file...");
                    const fernignorePath = join(absolutePathToLocalOutput, RelativeFilePath.of(".fernignore"));
                    try {
                        await fs.access(fernignorePath);
                        context.logger.debug(".fernignore already exists");
                    } catch {
                        context.logger.debug("Creating .fernignore file...");
                        await fs.writeFile(
                            fernignorePath,
                            "# Specify files that shouldn't be modified by Fern\n",
                            "utf-8"
                        );
                    }

                    context.logger.debug("Committing changes...");
                    await repository.commitAllChanges(commitMessage ?? "SDK Generation");
                    context.logger.debug(
                        `Committed changes to local copy of GitHub repository at ${absolutePathToLocalOutput}`
                    );
                }

                if (!selfhostedGithubConfig.previewMode) {
                    await repository.pushWithRebasingRemote();

                    const pushedBranch = await repository.getCurrentBranch();
                    context.logger.info(
                        `Pushed branch: https://github.com/${selfhostedGithubConfig.uri}/tree/${pushedBranch}`
                    );
                }
                break;
            }
            default:
                assertNever(mode);
        }
    } catch (error) {
        context.failAndThrow(`Error during GitHub self-hosted flow: ${String(error)}`);
    }
}

export async function getWorkspaceTempDir(): Promise<tmp.DirectoryResult> {
    return tmp.dir({
        // use the /private prefix on osx so that docker can access the tmpdir
        // see https://stackoverflow.com/a/45123074
        tmpdir: os.platform() === "darwin" ? path.join("/private", os.tmpdir()) : undefined,
        prefix: "fern"
    });
}

function getPublishConfig({
    generatorInvocation,
    org,
    version,
    packageName,
    context
}: {
    generatorInvocation: generatorsYml.GeneratorInvocation;
    org?: FernVenusApi.Organization;
    version?: string;
    packageName?: string;
    context: TaskContext;
}): FernIr.PublishingConfig | undefined {
    if (generatorInvocation.raw?.github != null && isGithubSelfhosted(generatorInvocation.raw.github)) {
        const [owner, repo] = generatorInvocation.raw.github.uri.split("/");
        if (owner == null || repo == null) {
            return context.failAndThrow(
                `Invalid GitHub repository URI: ${generatorInvocation.raw.github.uri}. Expected format: owner/repo`
            );
        }

        const irMode = generatorInvocation.raw.github.mode === "pull-request" ? "pull-request" : undefined;

        return FernIr.PublishingConfig.github({
            owner,
            repo,
            uri: generatorInvocation.raw.github.uri,
            token: generatorInvocation.raw.github.token,
            mode: irMode,
            branch: generatorInvocation.raw.github.branch,
            target: getPublishTarget({ outputSchema: generatorInvocation.raw.output, version, packageName })
        });
    }

    if (generatorInvocation.raw?.output?.location === "local-file-system") {
        let publishTarget: PublishTarget | undefined = undefined;
        if (generatorInvocation.language === "python") {
            publishTarget = PublishTarget.pypi({
                version,
                packageName
            });
            context.logger.debug(`Created PyPiPublishTarget: version ${version} package name: ${packageName}`);
        } else if (generatorInvocation.language === "rust") {
            // Use Crates publish target for Rust (Cargo/crates.io)
            publishTarget = PublishTarget.crates({
                version,
                packageName
            });
            context.logger.debug(`Created CratesPublishTarget: version ${version} package name: ${packageName}`);
        } else if (generatorInvocation.language === "java") {
            const config = generatorInvocation.raw?.config;

            interface JavaGeneratorConfig {
                group?: unknown;
                artifact?: unknown;
                "package-prefix"?: unknown;
                [key: string]: unknown;
            }

            // Support both styles: package-prefix/package_name and group/artifact
            const mavenCoordinate = (() => {
                if (!config || typeof config !== "object" || config === null) {
                    return undefined;
                }

                const configObj = config as JavaGeneratorConfig;

                if (typeof configObj.group === "string" && typeof configObj.artifact === "string") {
                    return {
                        groupId: configObj.group,
                        artifactId: configObj.artifact
                    };
                } else if (typeof configObj["package-prefix"] === "string" && packageName) {
                    return {
                        groupId: configObj["package-prefix"],
                        artifactId: packageName
                    };
                } else if (typeof configObj["package-prefix"] === "string" && !packageName) {
                    context.logger.warn("Java generator has package-prefix configured but packageName is missing");
                }

                return undefined;
            })();

            const coordinate = mavenCoordinate ? `${mavenCoordinate.groupId}:${mavenCoordinate.artifactId}` : undefined;

            if (coordinate) {
                const mavenVersion = version ?? "0.0.0";
                publishTarget = PublishTarget.maven({
                    coordinate,
                    version: mavenVersion,
                    usernameEnvironmentVariable: "MAVEN_USERNAME",
                    passwordEnvironmentVariable: "MAVEN_PASSWORD",
                    mavenUrlEnvironmentVariable: "MAVEN_PUBLISH_REGISTRY_URL"
                });
                context.logger.debug(`Created MavenPublishTarget: coordinate ${coordinate} version ${mavenVersion}`);
            } else if (config && typeof config === "object") {
                context.logger.debug(
                    "Java generator config provided but could not construct Maven coordinate. " +
                        "Expected either 'group' and 'artifact' or 'package-prefix' with packageName."
                );
            }
        }

        return FernIr.PublishingConfig.filesystem({
            generateFullProject: org?.selfHostedSdKs ?? false,
            publishTarget
        });
    }

    return generatorInvocation.outputMode._visit({
        downloadFiles: () => {
            return FernIr.PublishingConfig.filesystem({
                generateFullProject: org?.selfHostedSdKs ?? false,
                publishTarget: undefined
            });
        },
        github: () => undefined,
        githubV2: () => undefined,
        publish: () => undefined,
        publishV2: () => undefined,
        _other: () => undefined
    });
}

function getPublishTarget({
    outputSchema,
    version,
    packageName
}: {
    outputSchema: generatorsYml.GeneratorOutputSchema | undefined;
    version?: string;
    packageName?: string;
}): PublishTarget {
    const defaultPublishTarget = FernIr.PublishTarget.postman({
        apiKey: "",
        workspaceId: "",
        collectionId: undefined
    });

    if (outputSchema == null) {
        return defaultPublishTarget;
    }
    if (outputSchema.location === "npm") {
        const token = (outputSchema.token || "${NPM_TOKEN}").trim();
        const useOidc = token === "<USE_OIDC>" || token === "OIDC";
        return PublishTarget.npm({
            packageName: outputSchema["package-name"],
            version: version ?? "0.0.0",
            tokenEnvironmentVariable: useOidc
                ? "<USE_OIDC>"
                : token.startsWith("${") && token.endsWith("}")
                  ? token.slice(2, -1).trim()
                  : ""
        });
    } else if (outputSchema.location === "maven") {
        return PublishTarget.maven({
            version: version ?? "0.0.0",
            coordinate: outputSchema.coordinate,
            usernameEnvironmentVariable: outputSchema.username || "MAVEN_USERNAME",
            passwordEnvironmentVariable: outputSchema.password || "MAVEN_PASSWORD",
            mavenUrlEnvironmentVariable: outputSchema.url || "MAVEN_PUBLISH_REGISTRY_URL"
        });
    } else if (outputSchema.location === "pypi") {
        return PublishTarget.pypi({
            version,
            packageName
        });
    } else {
        return defaultPublishTarget;
    }
}

/**
 * Type guard to check if a GitHub configuration is a self-hosted configuration
 */
function isGithubSelfhosted(
    github: generatorsYml.GithubConfigurationSchema | undefined
): github is generatorsYml.GithubSelfhostedSchema {
    if (github == null) {
        return false;
    }
    return "uri" in github && "token" in github;
}

const emptyReadmeConfig: FernIr.ReadmeConfig = {
    defaultEndpoint: undefined,
    bannerLink: undefined,
    introduction: undefined,
    apiReferenceLink: undefined,
    apiName: undefined,
    disabledFeatures: undefined,
    whiteLabel: undefined,
    customSections: undefined,
    features: undefined,
    exampleStyle: undefined
};

interface SelhostedGithubConfig extends generatorsYml.GithubSelfhostedSchema {
    previewMode: boolean;
}

function getSelfhostedGithubConfig(
    generatorInvocation: generatorsYml.GeneratorInvocation,
    previewMode: boolean
): SelhostedGithubConfig | undefined {
    if (generatorInvocation.raw?.github != null && isGithubSelfhosted(generatorInvocation.raw.github)) {
        return {
            ...generatorInvocation.raw.github,
            previewMode
        };
    }
    return undefined;
}

const REPLAY_FERNIGNORE_ENTRIES = [".fern/replay.lock", ".fern/replay.yml"];

async function ensureReplayFernignoreEntries(outputDir: AbsoluteFilePath): Promise<void> {
    const fernignorePath = join(outputDir, RelativeFilePath.of(".fernignore"));
    let content = "";
    try {
        content = await fs.readFile(fernignorePath, "utf-8");
    } catch {
        // .fernignore doesn't exist yet
    }
    const lines = content.split("\n");
    const toAdd = REPLAY_FERNIGNORE_ENTRIES.filter((entry) => !lines.some((line) => line.trim() === entry));
    if (toAdd.length > 0) {
        const suffix = content.length > 0 && !content.endsWith("\n") ? "\n" : "";
        await fs.writeFile(fernignorePath, content + suffix + toAdd.join("\n") + "\n", "utf-8");
    }
}

function convertReplayConfig(schema: generatorsYml.ReplayConfigSchema | undefined): ReplayConfig | undefined {
    if (schema == null || !schema.enabled) {
        return undefined;
    }
    return {
        enabled: true,
        on_conflict:
            schema["on-conflict"] != null
                ? {
                      ci: schema["on-conflict"].ci,
                      local: schema["on-conflict"].local
                  }
                : undefined
    };
}
