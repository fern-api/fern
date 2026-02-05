import type { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { cp } from "fs/promises";
import tmp from "tmp-promise";
import {
    ERROR_FAILED_TO_CLONE,
    ERROR_FAILED_TO_GET_BRANCH,
    GIT_BRANCH_FLAG,
    GIT_CLONE_COMMAND,
    GIT_DEPTH_FLAG,
    GIT_DEPTH_VALUE,
    GITHUB_BASE_URL,
    GITHUB_BRANCH_URL_REGEX
} from "./constants";

export async function copyGithubOutputToOutputDirectory(
    repository: string,
    logs: string,
    outputDirectory: string,
    logger: Logger,
    githubToken?: string
): Promise<void> {
    logger.debug(`Attempting to extract GitHub branch from logs`);
    logger.debug(`Logs length: ${logs.length} characters`);

    // Log a sample of the logs to see what we're working with
    const logLines = logs.split("\n");
    const relevantLines = logLines.filter(
        (line) => line.includes("Pushed branch") || line.includes("github.com") || line.includes("fern-bot")
    );
    if (relevantLines.length > 0) {
        logger.debug(`Found ${relevantLines.length} potentially relevant log lines:`);
        relevantLines.slice(0, 5).forEach((line) => {
            logger.debug(`  ${line}`);
        });
    } else {
        logger.debug(`No lines containing 'Pushed branch', 'github.com', or 'fern-bot' found in logs`);
    }

    const remoteBranch = getRemoteBranchFromLogs(logs);

    if (!remoteBranch) {
        throw new Error(`${ERROR_FAILED_TO_GET_BRANCH}: Could not extract branch name from logs`);
    }

    logger.info(`✓ Found branch in logs: ${remoteBranch}`);
    const branchToClone = remoteBranch;
    const tmpDir = await tmp.dir();

    logger.debug(`Cloning ${repository}@${branchToClone} to temporary directory`);
    await cloneRepository(repository, branchToClone, tmpDir.path, logger, githubToken);

    logger.debug(`Copying cloned repository to ${outputDirectory}`);
    await cp(tmpDir.path, outputDirectory, { recursive: true });

    logger.info(`Successfully copied GitHub output from branch: ${branchToClone}`);
}

function getRemoteBranchFromLogs(logs: string): string | undefined {
    // Example log lines:
    // - INFO  2025-11-15T23:49:44.180Z [api]: fernapi/fern-typescript-sdk Pushed branch: https://github.com/fern-api/lattice-sdk-javascript/tree/fern-bot/2025-11-15T23-49Z
    // - INFO  2025-11-17T03:15:23.574Z [api]: fernapi/fern-typescript-sdk Pushed branch: https://github.com/fern-api/empty/tree/fern-bot/2025-11-17_03-15-22
    // Look for any GitHub URL with /tree/<branch> pattern and extract the branch name

    const urlMatch = logs.match(GITHUB_BRANCH_URL_REGEX);
    if (urlMatch?.[1]) {
        return urlMatch[1];
    }

    return undefined;
}

async function cloneRepository(
    repository: string,
    branch: string,
    targetDirectory: string,
    logger: Logger,
    githubToken?: string
): Promise<void> {
    logger.debug(`Cloning ${repository}@${branch} to ${targetDirectory}`);

    // Use authenticated URL if token is provided (for private repos)
    const cloneUrl = githubToken
        ? `${GITHUB_BASE_URL.replace("https://", `https://${githubToken}@`)}/${repository}.git`
        : `${GITHUB_BASE_URL}/${repository}.git`;

    // Log the clone URL (redacting token for security)
    const logUrl = githubToken ? `${GITHUB_BASE_URL}/${repository}.git (with auth token)` : cloneUrl;
    logger.debug(`Clone URL: ${logUrl}`);
    logger.debug(
        `Clone command: git ${GIT_CLONE_COMMAND} ${GIT_BRANCH_FLAG} ${branch} ${GIT_DEPTH_FLAG} ${GIT_DEPTH_VALUE} [url] ${targetDirectory}`
    );

    const result = await loggingExeca(
        logger,
        "git",
        [GIT_CLONE_COMMAND, GIT_BRANCH_FLAG, branch, GIT_DEPTH_FLAG, GIT_DEPTH_VALUE, cloneUrl, targetDirectory],
        { reject: false }
    );

    if (result.exitCode !== 0) {
        const errorOutput = result.stderr || result.stdout || "No error output captured";
        logger.error(`${ERROR_FAILED_TO_CLONE} (exit code ${result.exitCode})`);
        logger.error(`  Repository: ${repository}`);
        logger.error(`  Branch: ${branch}`);
        logger.error(`  Target: ${targetDirectory}`);
        logger.error(`  Error output: ${errorOutput}`);
        throw new Error(`${ERROR_FAILED_TO_CLONE}: ${errorOutput}`);
    }

    logger.debug(`Successfully cloned repository`);
}
