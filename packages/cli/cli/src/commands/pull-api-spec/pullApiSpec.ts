import { loggingExeca } from "@fern-api/logging-execa";
import { Project } from "@fern-api/project-loader";
import { CliContext } from "../../cli-context/CliContext.js";
import { updateApiSpec } from "../upgrade/updateApiSpec.js";

export interface PullApiSpecOptions {
    /** GitHub token with contents:write and pull-requests:write */
    token: string;
    /** Branch to create/update */
    branch: string;
    /** If true, push directly without opening a PR */
    autoMerge: boolean;
    /** Working directory (repo root) */
    cwd: string;
}

export async function pullApiSpecWithOrchestration({
    options,
    cliContext,
    project,
    indent
}: {
    options: PullApiSpecOptions;
    cliContext: CliContext;
    project: Project;
    indent: number;
}): Promise<void> {
    // 1. Parse owner/repo from GITHUB_REPOSITORY env var
    const githubRepository = process.env.GITHUB_REPOSITORY;
    if (!githubRepository) {
        cliContext.failAndThrow("GITHUB_REPOSITORY environment variable is not set");
    }
    const [owner, repo] = parseRepository(githubRepository as string, cliContext);

    // 2. Set up Octokit
    const { Octokit } = await import("@octokit/rest");
    const octokit = new Octokit({ auth: options.token });

    // 3. Verify repo access
    cliContext.logger.info(`Verifying access to ${owner}/${repo}...`);
    try {
        await octokit.rest.repos.get({ owner, repo });
    } catch (e) {
        cliContext.failAndThrow(
            `Failed to verify access to ${owner}/${repo}: ${e instanceof Error ? e.message : String(e)}`
        );
    }

    // 4. Git config
    cliContext.logger.info("Configuring git user...");
    await loggingExeca(cliContext.logger, "git", ["config", "user.name", "github-actions"], {
        cwd: options.cwd
    });
    await loggingExeca(cliContext.logger, "git", ["config", "user.email", "github-actions@github.com"], {
        cwd: options.cwd
    });

    // 5. Branch setup — check configured branch first, then legacy fallback
    const LEGACY_BRANCH = "fern/sync-openapi";
    const activeBranch = await resolveActiveBranch(owner, repo, options.branch, LEGACY_BRANCH, octokit, cliContext);
    await setupBranch({ activeBranch, options, cliContext, owner, repo, octokit });

    // 6. Run updateApiSpec
    cliContext.logger.info("Fetching latest API spec...");
    await updateApiSpec({ cliContext, project, indent });

    // 7. Check for changes
    const { stdout: statusOut } = await loggingExeca(cliContext.logger, "git", ["status", "--porcelain"], {
        cwd: options.cwd
    });
    if (!statusOut.trim()) {
        cliContext.logger.info("No changes detected. Nothing to do.");
        return;
    }

    // 8. Commit
    cliContext.logger.info("Committing changes...");
    await loggingExeca(cliContext.logger, "git", ["add", "."], { cwd: options.cwd });
    await loggingExeca(cliContext.logger, "git", ["commit", "-m", "chore: pull api spec"], {
        cwd: options.cwd
    });

    // 9. Push with fallback
    const pushed = await pushWithFallback({ activeBranch, options, cliContext, owner, repo, octokit });
    if (!pushed) {
        return;
    }

    // 10. If autoMerge, we're done
    if (options.autoMerge) {
        cliContext.logger.info("auto-merge enabled — changes pushed directly to branch.");
        return;
    }

    // 11. Create or update PR
    const existingPr = await prExists(owner, repo, activeBranch, octokit);
    if (existingPr != null) {
        cliContext.logger.info(`Updating existing PR #${existingPr}...`);
        await octokit.rest.pulls.update({
            owner,
            repo,
            pull_number: existingPr,
            body: `Update API spec from configured origin.\nUpdated: ${new Date().toISOString()}`
        });
    } else {
        cliContext.logger.info("Creating PR...");
        const pr = await octokit.rest.pulls.create({
            owner,
            repo,
            title: "chore: pull api spec",
            head: activeBranch,
            base: "main",
            body: "Update API spec from the configured origin."
        });
        cliContext.logger.info(`PR created: ${pr.data.html_url}`);
    }
}

function parseRepository(repository: string, cliContext: CliContext): [string, string] {
    const parts = repository.split("/");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
        cliContext.failAndThrow(`Invalid repository format: "${repository}". Expected "owner/repo".`);
    }
    return parts as [string, string];
}

async function setupBranch({
    activeBranch,
    options,
    cliContext,
    owner,
    repo,
    octokit
}: {
    activeBranch: string;
    options: PullApiSpecOptions;
    cliContext: CliContext;
    owner: string;
    repo: string;
    octokit: InstanceType<typeof import("@octokit/rest").Octokit>;
}): Promise<void> {
    const doesExist = await branchExists(owner, repo, activeBranch, octokit);
    if (doesExist) {
        cliContext.logger.info(`Branch '${activeBranch}' exists — fetching and checking out...`);
        await loggingExeca(cliContext.logger, "git", ["fetch", "origin"], { cwd: options.cwd });
        await loggingExeca(cliContext.logger, "git", ["checkout", activeBranch], { cwd: options.cwd });
        await loggingExeca(cliContext.logger, "git", ["pull", "origin", activeBranch], { cwd: options.cwd });
    } else {
        cliContext.logger.info(`Branch '${activeBranch}' does not exist — creating...`);
        await loggingExeca(cliContext.logger, "git", ["checkout", "-b", activeBranch], { cwd: options.cwd });
    }
}

async function pushWithFallback({
    activeBranch,
    options,
    cliContext,
    owner,
    repo,
    octokit
}: {
    activeBranch: string;
    options: PullApiSpecOptions;
    cliContext: CliContext;
    owner: string;
    repo: string;
    octokit: InstanceType<typeof import("@octokit/rest").Octokit>;
}): Promise<boolean> {
    cliContext.logger.info(`Pushing to ${activeBranch}...`);

    // Try regular push first
    try {
        await loggingExeca(cliContext.logger, "git", ["push", "origin", activeBranch], { cwd: options.cwd });
        return true;
    } catch {
        cliContext.logger.info("Regular push failed, attempting pull --rebase...");
    }

    // Try pull --rebase then push
    let rebaseFailed = false;
    let errorMsg: string | null = null;
    let abortErrorMsg: string | null = null;

    try {
        await loggingExeca(cliContext.logger, "git", ["pull", "--rebase", "origin", activeBranch], {
            cwd: options.cwd
        });
        try {
            await loggingExeca(cliContext.logger, "git", ["push", "origin", activeBranch], { cwd: options.cwd });
            return true;
        } catch (e) {
            errorMsg = e instanceof Error ? e.message : String(e);
            // Push after rebase failed — no rebase in progress, don't abort
        }
    } catch (e) {
        rebaseFailed = true;
        errorMsg = e instanceof Error ? e.message : String(e);
        try {
            await loggingExeca(cliContext.logger, "git", ["rebase", "--abort"], { cwd: options.cwd });
        } catch (abortErr) {
            abortErrorMsg = abortErr instanceof Error ? abortErr.message : String(abortErr);
        }
    }

    // Comment on existing PR if any
    const existingPr = await prExists(owner, repo, activeBranch, octokit);
    if (existingPr != null) {
        const failureReason = rebaseFailed ? "merge conflicts" : "a push rejection after successful rebase";
        let body =
            `⚠️ **Sync failed**: The automated spec pull could not be completed due to ${failureReason}.\n\n` +
            `Please resolve the conflicts manually and push to the \`${activeBranch}\` branch.\n\n` +
            `**Error:**\n\`\`\`\n${errorMsg}\n\`\`\``;
        if (abortErrorMsg != null) {
            body += `\n\n**Rebase abort error:**\n\`\`\`\n${abortErrorMsg}\n\`\`\``;
        }
        await octokit.rest.issues.createComment({ owner, repo, issue_number: existingPr, body });
        cliContext.failAndThrow(
            `Failed to push changes to '${activeBranch}'. A comment has been left on PR #${existingPr}.`
        );
    } else {
        cliContext.failAndThrow(
            `Failed to push changes to '${activeBranch}' and no existing PR was found. Error: ${errorMsg}`
        );
    }
    return false;
}

async function resolveActiveBranch(
    owner: string,
    repo: string,
    branch: string,
    legacyBranch: string,
    octokit: InstanceType<typeof import("@octokit/rest").Octokit>,
    cliContext: CliContext
): Promise<string> {
    if (await branchExists(owner, repo, branch, octokit)) {
        return branch;
    }
    if (branch !== legacyBranch && (await branchExists(owner, repo, legacyBranch, octokit))) {
        cliContext.logger.info(`Branch '${branch}' not found — using legacy branch '${legacyBranch}'.`);
        return legacyBranch;
    }
    return branch;
}

async function branchExists(
    owner: string,
    repo: string,
    branch: string,
    octokit: InstanceType<typeof import("@octokit/rest").Octokit>
): Promise<boolean> {
    try {
        await octokit.rest.git.getRef({ owner, repo, ref: `heads/${branch}` });
        return true;
    } catch {
        return false;
    }
}

async function prExists(
    owner: string,
    repo: string,
    branch: string,
    octokit: InstanceType<typeof import("@octokit/rest").Octokit>
): Promise<number | null> {
    const { data } = await octokit.rest.pulls.list({
        owner,
        repo,
        head: `${owner}:${branch}`,
        state: "open"
    });
    return data.length > 0 ? (data[0]?.number ?? null) : null;
}
