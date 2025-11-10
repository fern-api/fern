import { APIS_DIRECTORY, FERN_DIRECTORY } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { Octokit } from "@octokit/rest";
import { exec } from "child_process";
import { cp, mkdir, mkdtemp, readFile, rm, stat, writeFile } from "fs/promises";
import yaml from "js-yaml";
import os from "os";
import path from "path";
import { promisify } from "util";
import { RemoteVsLocalWorkspace } from "../../loadRemoteVsLocalWorkspaces";

const execAsync = promisify(exec);

export interface TestRemoteVsLocalOptions {
    workspace?: RemoteVsLocalWorkspace;
    fixture?: string;
    updateSnapshots: boolean;
    context: TaskContext;
}

export interface TestResult {
    workspace: string;
    fixture: string;
    passed: boolean;
    remoteDiff?: string;
    localDiff?: string;
    error?: string;
}

interface EphemeralRepo {
    owner: string;
    name: string;
    fullName: string;
}

export class TestRemoteVsLocalRunner {
    private octokit: Octokit;

    constructor() {
        const githubToken = process.env.GITHUB_TOKEN;
        if (!githubToken) {
            throw new Error("GITHUB_TOKEN environment variable is required");
        }
        this.octokit = new Octokit({ auth: githubToken });
    }

    async run(options: TestRemoteVsLocalOptions): Promise<TestResult[]> {
        const results: TestResult[] = [];
        const workspaces = options.workspace ? [options.workspace] : [];

        if (workspaces.length === 0) {
            options.context.logger.warn("No workspaces found with remoteVsLocalFixtures");
            return results;
        }

        for (const workspace of workspaces) {
            const fixtures = options.fixture
                ? [options.fixture]
                : workspace.workspaceConfig.remoteVsLocalFixtures || [];

            if (fixtures.length === 0) {
                options.context.logger.warn(`⚠️  Workspace ${workspace.workspaceName} has no remoteVsLocalFixtures`);
                continue;
            }

            options.context.logger.info(`\n🧪 Testing remote vs local generation for: ${workspace.workspaceName}`);
            options.context.logger.info(`📋 Opt-in fixtures: ${fixtures.join(", ")}`);

            for (const fixture of fixtures) {
                options.context.logger.info(`\n🔧 Testing fixture: ${fixture}`);

                try {
                    const result = await this.testFixture(workspace, fixture, options);
                    results.push(result);

                    if (result.passed) {
                        options.context.logger.info(`  ✅ No differences found!`);
                    } else {
                        options.context.logger.error(`  ❌ Differences detected!`);
                        if (result.remoteDiff) {
                            options.context.logger.error(`\n  Remote diff:\n${result.remoteDiff}`);
                        }
                        if (result.localDiff) {
                            options.context.logger.error(`\n  Local diff:\n${result.localDiff}`);
                        }
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    options.context.logger.error(`  ❌ Error: ${errorMessage}`);
                    results.push({
                        workspace: workspace.workspaceName,
                        fixture,
                        passed: false,
                        error: errorMessage
                    });
                }
            }
        }

        return results;
    }

    private async testFixture(
        workspace: RemoteVsLocalWorkspace,
        fixture: string,
        options: TestRemoteVsLocalOptions
    ): Promise<TestResult> {
        let repo: EphemeralRepo | null = null;
        let tempDirs: string[] = [];

        try {
            // 1. Create ephemeral GitHub repo
            options.context.logger.info(`  📦 Creating ephemeral repo...`);
            repo = await this.createEphemeralRepo(workspace.workspaceName, fixture);
            options.context.logger.info(`  ✅ Created: ${repo.fullName}`);

            // 2. Setup temp project with proper Fern structure
            options.context.logger.info(`  📁 Setting up temp project...`);
            const projectDir = await this.setupTempProject(workspace, fixture, repo, options.context);
            tempDirs.push(projectDir);

            // 3. Generate remote (via Fiddle)
            options.context.logger.info(`  🔄 Generating remote (via Fiddle)...`);
            const remoteBranch = await this.generateRemote(projectDir, options.context);
            options.context.logger.info(`  ✅ Remote complete: branch ${remoteBranch}`);

            // 4. Generate local (via Docker)
            options.context.logger.info(`  🔄 Generating local (via Docker)...`);
            const localBranch = await this.generateLocal(projectDir, options.context);
            options.context.logger.info(`  ✅ Local complete: branch ${localBranch}`);

            // 5. Download outputs from GitHub
            options.context.logger.info(`  📥 Downloading outputs...`);
            const [remoteOutput, localOutput] = await Promise.all([
                this.downloadBranch(repo, remoteBranch, options.context),
                this.downloadBranch(repo, localBranch, options.context)
            ]);
            tempDirs.push(remoteOutput, localOutput);

            // 6. Compare to snapshots or update them
            if (options.updateSnapshots) {
                options.context.logger.info(`  📝 Updating snapshots...`);
                await this.updateSnapshots(workspace, fixture, remoteOutput, localOutput);
                return {
                    workspace: workspace.workspaceName,
                    fixture,
                    passed: true
                };
            } else {
                options.context.logger.info(`  🔍 Comparing to snapshots...`);
                const [remoteDiff, localDiff] = await Promise.all([
                    this.compareToSnapshot(workspace, fixture, "remote", remoteOutput),
                    this.compareToSnapshot(workspace, fixture, "local", localOutput)
                ]);

                return {
                    workspace: workspace.workspaceName,
                    fixture,
                    passed: !remoteDiff && !localDiff,
                    remoteDiff,
                    localDiff
                };
            }
        } finally {
            // Cleanup
            if (repo) {
                try {
                    options.context.logger.info(`  🗑️  Cleaning up ephemeral repo...`);
                    await this.deleteEphemeralRepo(repo);
                } catch (error: any) {
                    // Silently ignore 403 errors - user token may not have delete permissions
                    // GitHub will auto-delete test repos after 24 hours anyway
                    if (!error.message?.includes("403") && !error.message?.includes("admin rights")) {
                        options.context.logger.warn(`  ⚠️  Failed to cleanup repo: ${error.message}`);
                    }
                }
            }
            for (const tempDir of tempDirs) {
                try {
                    await rm(tempDir, { recursive: true, force: true });
                } catch (error) {
                    // Ignore cleanup errors
                }
            }
        }
    }

    private async setupTempProject(
        workspace: RemoteVsLocalWorkspace,
        fixture: string,
        repo: EphemeralRepo,
        context: TaskContext
    ): Promise<string> {
        const tmpDir = await mkdtemp(path.join(os.tmpdir(), "fern-rvl-"));

        try {
            // Initialize Fern project
            context.logger.info(`    Running fern init...`);
            await execAsync("fern init --organization test", {
                cwd: tmpDir,
                env: { ...process.env }
            });

            // Copy API definition from test-definitions
            const repoRoot = await this.findRepoRoot();
            const sourceApiPath = path.join(repoRoot, "test-definitions", FERN_DIRECTORY, APIS_DIRECTORY, fixture);
            const targetApiPath = path.join(tmpDir, FERN_DIRECTORY, "api");

            context.logger.info(`    Copying API definition...`);
            await cp(sourceApiPath, targetApiPath, { recursive: true });

            // Create generators.yml with remote and local configurations
            context.logger.info(`    Creating generators.yml...`);
            const remoteImageParts = workspace.workspaceConfig.image.split(":");
            const remoteVersion = remoteImageParts.length > 1 ? (remoteImageParts[1] ?? "latest") : "latest";

            const localImageParts = workspace.workspaceConfig.test.docker.image.split(":");
            const localVersion = localImageParts.length > 1 ? (localImageParts[1] ?? "latest") : "latest";

            const generatorsConfig = {
                "default-group": "remote",
                groups: {
                    remote: {
                        generators: [
                            {
                                name: workspace.workspaceConfig.generatorType,
                                version: remoteVersion,
                                output: {
                                    location: "github",
                                    mode: "pull-request",
                                    "repo-url": repo.fullName
                                }
                            }
                        ]
                    },
                    local: {
                        generators: [
                            {
                                name: workspace.workspaceConfig.generatorType,
                                version: localVersion,
                                output: {
                                    location: "github",
                                    mode: "pull-request",
                                    "repo-url": repo.fullName
                                }
                            }
                        ]
                    }
                }
            };

            const generatorsYmlPath = path.join(tmpDir, FERN_DIRECTORY, "generators.yml");
            await writeFile(generatorsYmlPath, yaml.dump(generatorsConfig));

            // Run fern upgrade
            context.logger.info(`    Running fern upgrade...`);
            try {
                await execAsync("fern upgrade", {
                    cwd: tmpDir,
                    env: { ...process.env }
                });
            } catch (error) {
                // fern upgrade might not be necessary for all projects
                context.logger.warn(`    fern upgrade failed (may not be needed): ${error}`);
            }

            // Run fern generator upgrade
            context.logger.info(`    Running fern generator upgrade...`);
            try {
                await execAsync("fern generator upgrade", {
                    cwd: tmpDir,
                    env: { ...process.env }
                });
            } catch (error) {
                context.logger.warn(`    fern generator upgrade failed (may not be needed): ${error}`);
            }

            return tmpDir;
        } catch (error) {
            // Cleanup on failure
            await rm(tmpDir, { recursive: true, force: true });
            throw error;
        }
    }

    private async generateRemote(projectDir: string, context: TaskContext): Promise<string> {
        const { stdout, stderr } = await execAsync("fern generate --group remote", {
            cwd: projectDir,
            env: {
                ...process.env,
                FERN_TOKEN: process.env.FERN_TOKEN,
                GITHUB_TOKEN: process.env.GITHUB_TOKEN
            }
        }).catch((error) => {
            context.logger.error(`Remote generation failed:`);
            if (error.stdout) context.logger.error(`stdout: ${error.stdout}`);
            if (error.stderr) context.logger.error(`stderr: ${error.stderr}`);
            throw error;
        });

        // Parse branch name from output
        // Expected format: "Created pull request: https://github.com/owner/repo/pull/1"
        // or similar - need to extract branch from GitHub API
        const branchMatch = stdout.match(/branch[:\s]+([^\s]+)/i);
        if (branchMatch && branchMatch[1]) {
            return branchMatch[1];
        }

        // If we can't extract branch from output, we'll need to query GitHub for latest PR
        throw new Error("Could not extract branch name from generation output");
    }

    private async generateLocal(projectDir: string, context: TaskContext): Promise<string> {
        const { stdout, stderr } = await execAsync("fern generate --group local --local", {
            cwd: projectDir,
            env: {
                ...process.env,
                GITHUB_TOKEN: process.env.GITHUB_TOKEN
            }
        }).catch((error) => {
            context.logger.error(`Local generation failed:`);
            if (error.stdout) context.logger.error(`stdout: ${error.stdout}`);
            if (error.stderr) context.logger.error(`stderr: ${error.stderr}`);
            throw error;
        });

        // Parse branch name from output
        const branchMatch = stdout.match(/branch[:\s]+([^\s]+)/i);
        if (branchMatch && branchMatch[1]) {
            return branchMatch[1];
        }

        // If we can't extract branch from output, we'll need to query GitHub for latest PR
        throw new Error("Could not extract branch name from generation output");
    }

    private async createEphemeralRepo(workspace: string, fixture: string): Promise<EphemeralRepo> {
        const timestamp = Date.now();
        const repoName = `fern-test-rvl-${workspace}-${fixture}-${timestamp}`;

        const response = await this.octokit.repos.createForAuthenticatedUser({
            name: repoName,
            private: true,
            auto_init: false
        });

        return {
            owner: response.data.owner.login,
            name: response.data.name,
            fullName: response.data.full_name
        };
    }

    private async deleteEphemeralRepo(repo: EphemeralRepo): Promise<void> {
        await this.octokit.repos.delete({
            owner: repo.owner,
            repo: repo.name
        });
    }

    private async downloadBranch(repo: EphemeralRepo, branch: string, context: TaskContext): Promise<string> {
        const tmpDir = await mkdtemp(path.join(os.tmpdir(), "fern-download-"));

        try {
            // Clone the specific branch
            await execAsync(`git clone --branch ${branch} --single-branch https://github.com/${repo.fullName}.git .`, {
                cwd: tmpDir,
                env: {
                    ...process.env,
                    GIT_TERMINAL_PROMPT: "0"
                }
            });

            return tmpDir;
        } catch (error) {
            context.logger.error(`Failed to download branch ${branch}: ${error}`);
            throw error;
        }
    }

    private async compareToSnapshot(
        workspace: RemoteVsLocalWorkspace,
        fixture: string,
        type: "remote" | "local",
        downloadedPath: string
    ): Promise<string | undefined> {
        const repoRoot = await this.findRepoRoot();
        const snapshotPath = path.join(repoRoot, "seed-remote-local", workspace.workspaceName, type, fixture);

        try {
            // Check if snapshot exists
            await stat(snapshotPath);

            // Use git diff to compare
            const { stdout } = await execAsync(`git diff --no-index "${snapshotPath}" "${downloadedPath}"`, {
                cwd: repoRoot
            }).catch((error) => {
                // git diff returns exit code 1 when there are differences
                return { stdout: error.stdout || "" };
            });

            return stdout.trim() || undefined;
        } catch (error) {
            throw new Error(`Snapshot not found at ${snapshotPath}`);
        }
    }

    private async updateSnapshots(
        workspace: RemoteVsLocalWorkspace,
        fixture: string,
        remoteOutput: string,
        localOutput: string
    ): Promise<void> {
        const repoRoot = await this.findRepoRoot();
        const remoteSnapshotPath = path.join(repoRoot, "seed-remote-local", workspace.workspaceName, "remote", fixture);
        const localSnapshotPath = path.join(repoRoot, "seed-remote-local", workspace.workspaceName, "local", fixture);

        // Remove old snapshots
        await rm(remoteSnapshotPath, { recursive: true, force: true });
        await rm(localSnapshotPath, { recursive: true, force: true });

        // Copy new snapshots
        await cp(remoteOutput, remoteSnapshotPath, { recursive: true });
        await cp(localOutput, localSnapshotPath, { recursive: true });
    }

    private async findRepoRoot(): Promise<string> {
        let currentDir = process.cwd();
        while (currentDir !== "/") {
            try {
                await stat(path.join(currentDir, ".git"));
                return currentDir;
            } catch {
                currentDir = path.dirname(currentDir);
            }
        }
        throw new Error("Could not find git repository root");
    }
}
