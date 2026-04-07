import * as fs from "node:fs";
import * as path from "node:path";
import { loggingExeca } from "@fern-api/logging-execa";
import { glob } from "glob";
import yaml from "js-yaml";
import { minimatch } from "minimatch";
import { CliContext } from "../../cli-context/CliContext.js";

interface SourceMapping {
    from: string;
    to: string;
    exclude?: string[];
}

export interface SyncOpenapiOptions {
    /** Target repository in "owner/repo" format */
    repository: string;
    /** YAML or JSON string of SourceMapping[] */
    sources: string;
    token: string;
    branch: string;
    autoMerge: boolean;
    /** Working directory (source repo root) */
    cwd: string;
}

export async function syncOpenapi({
    options,
    cliContext
}: {
    options: SyncOpenapiOptions;
    cliContext: CliContext;
}): Promise<void> {
    const mappings = parseMappings(options.sources);

    const { Octokit } = await import("@octokit/rest");
    const octokit = new Octokit({ auth: options.token });

    const [owner, repo] = parseRepository(options.repository, cliContext);

    cliContext.logger.info(`Verifying access to ${options.repository}...`);
    try {
        await octokit.rest.repos.get({ owner, repo });
    } catch (e) {
        cliContext.failAndThrow(
            `Failed to verify access to ${options.repository}: ${e instanceof Error ? e.message : String(e)}`
        );
    }

    const repoUrl = `https://x-access-token:${options.token}@github.com/${options.repository}.git`;
    const repoDir = path.resolve(options.cwd, "temp-fern-sync-openapi");

    cliContext.logger.info(`Cloning ${options.repository}...`);
    fs.mkdirSync(repoDir, { recursive: true });

    await loggingExeca(cliContext.logger, "git", ["clone", repoUrl, repoDir]);
    await loggingExeca(cliContext.logger, "git", ["config", "user.name", "github-actions"], {
        cwd: repoDir
    });
    await loggingExeca(cliContext.logger, "git", ["config", "user.email", "github-actions@github.com"], {
        cwd: repoDir
    });

    // Set up branch
    const doesExist = await branchExists(owner, repo, options.branch, octokit);
    if (doesExist) {
        await loggingExeca(cliContext.logger, "git", ["fetch", "origin"], { cwd: repoDir });
        await loggingExeca(cliContext.logger, "git", ["checkout", options.branch], { cwd: repoDir });
        await loggingExeca(cliContext.logger, "git", ["pull", "origin", options.branch], {
            cwd: repoDir
        });
    } else {
        await loggingExeca(cliContext.logger, "git", ["checkout", "-b", options.branch], {
            cwd: repoDir
        });
    }

    // Copy files
    cliContext.logger.info("Processing source mappings...");
    for (const mapping of mappings) {
        const sourcePath = path.join(options.cwd, mapping.from);
        const destPath = path.join(repoDir, mapping.to);

        if (!fs.existsSync(sourcePath)) {
            cliContext.failAndThrow(`Source path not found: ${mapping.from}`);
        }

        const stat = fs.statSync(sourcePath);
        if (stat.isDirectory()) {
            cliContext.logger.info(`Syncing directory ${mapping.from} → ${mapping.to}`);
            await syncDirectory(sourcePath, destPath, mapping.exclude);
        } else {
            cliContext.logger.info(`Syncing file ${mapping.from} → ${mapping.to}`);
            syncFile(sourcePath, destPath);
        }
    }

    // Check for changes
    const { stdout: diffOut } = await loggingExeca(cliContext.logger, "git", ["status", "--porcelain"], {
        cwd: repoDir
    });
    if (!diffOut.trim()) {
        cliContext.logger.info("No changes detected. Nothing to do.");
        fs.rmSync(repoDir, { recursive: true, force: true });
        return;
    }

    // Commit
    await loggingExeca(cliContext.logger, "git", ["add", "."], { cwd: repoDir });
    await loggingExeca(cliContext.logger, "git", ["commit", "-m", "chore: sync OpenAPI specs"], {
        cwd: repoDir
    });

    // Skip push if content is identical to remote (avoids spurious PR updates)
    if (!options.autoMerge && !(await hasDifferenceWithRemote(options.branch, repoDir, cliContext))) {
        cliContext.logger.info("No differences with remote branch. Skipping push.");
        fs.rmSync(repoDir, { recursive: true, force: true });
        return;
    }

    // Push
    cliContext.logger.info(`Pushing to ${options.branch}...`);
    await loggingExeca(cliContext.logger, "git", ["push", "--force", "origin", options.branch], {
        cwd: repoDir
    });

    if (options.autoMerge) {
        cliContext.logger.info("auto-merge enabled — changes pushed directly to branch.");
        fs.rmSync(repoDir, { recursive: true, force: true });
        return;
    }

    // Create or update PR
    const existingPr = await prExists(owner, repo, options.branch, octokit);
    if (existingPr != null) {
        cliContext.logger.info(`Updating existing PR #${existingPr}...`);
        await octokit.rest.pulls.update({
            owner,
            repo,
            pull_number: existingPr,
            body: `Update OpenAPI specifications.\nUpdated: ${new Date().toISOString()}`
        });
    } else {
        cliContext.logger.info("Creating PR...");
        const pr = await octokit.rest.pulls.create({
            owner,
            repo,
            title: "chore: sync OpenAPI specs",
            head: options.branch,
            base: "main",
            body: "Update OpenAPI specifications based on changes in the source repository."
        });
        cliContext.logger.info(`PR created: ${pr.data.html_url}`);
    }

    fs.rmSync(repoDir, { recursive: true, force: true });
}

function parseRepository(repository: string, cliContext: CliContext): [string, string] {
    const parts = repository.split("/");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
        cliContext.failAndThrow(`Invalid repository format: "${repository}". Expected "owner/repo".`);
    }
    return parts as [string, string];
}

function parseMappings(input: string): SourceMapping[] {
    let mappings: unknown;
    try {
        mappings = yaml.load(input);
    } catch {
        mappings = JSON.parse(input);
    }
    if (!Array.isArray(mappings) || mappings.length === 0) {
        throw new Error("'sources' must be a non-empty array of {from, to} mappings");
    }
    for (const [i, m] of (mappings as SourceMapping[]).entries()) {
        if (!m.from || !m.to) {
            throw new Error(`Mapping at index ${i} is missing 'from' or 'to'`);
        }
    }
    return mappings as SourceMapping[];
}

async function syncDirectory(src: string, dest: string, exclude?: string[]): Promise<void> {
    fs.mkdirSync(dest, { recursive: true });
    const files = await glob("**/*", { cwd: src, nodir: true, absolute: false });
    for (const file of files) {
        if (exclude?.some((p) => minimatch(file, p))) {
            continue;
        }
        syncFile(path.join(src, file), path.join(dest, file));
    }
}

function syncFile(src: string, dest: string): void {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
}

async function hasDifferenceWithRemote(branch: string, cwd: string, cliContext: CliContext): Promise<boolean> {
    try {
        await loggingExeca(cliContext.logger, "git", ["fetch", "origin", branch], { cwd });
        const { stdout } = await loggingExeca(cliContext.logger, "git", ["diff", "HEAD", `origin/${branch}`], { cwd });
        return !!stdout.trim();
    } catch {
        cliContext.logger.info("Could not fetch remote branch, assuming first push to new branch.");
        return true;
    }
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
