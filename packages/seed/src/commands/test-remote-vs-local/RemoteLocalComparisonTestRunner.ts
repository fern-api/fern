import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { exec } from "child_process";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { promisify } from "util";
import { ComparisonReport, ComparisonResult, ComparisonRules, FileComparator } from "./comparison";

const execAsync = promisify(exec);

export interface RemoteLocalComparisonConfig {
    workspacePath: AbsoluteFilePath;
    remoteGroup: string;
    localGroup: string;
    githubRepo: string;
    comparisonRules?: ComparisonRules;
}

export class RemoteLocalComparisonTestRunner {
    private config: RemoteLocalComparisonConfig;
    private taskContext: TaskContext;

    constructor(config: RemoteLocalComparisonConfig, taskContext: TaskContext) {
        this.config = config;
        this.taskContext = taskContext;
    }

    public async run(): Promise<ComparisonResult> {
        this.taskContext.logger.info("Starting remote vs local generation comparison...");

        const remoteBranch = await this.runRemoteGeneration();
        this.taskContext.logger.info(`Remote generation completed. Branch: ${remoteBranch}`);

        const localBranch = await this.runLocalGeneration();
        this.taskContext.logger.info(`Local generation completed. Branch: ${localBranch}`);

        const comparisonResult = await this.compareOutputs(remoteBranch, localBranch);
        this.taskContext.logger.info("Comparison completed.");

        return comparisonResult;
    }

    private async runRemoteGeneration(): Promise<string> {
        this.taskContext.logger.info("Running remote generation...");

        const { stdout } = await execAsync(`fern generate --group ${this.config.remoteGroup} --log-level debug`, {
            cwd: this.config.workspacePath,
            env: {
                ...process.env,
                FERN_TOKEN: process.env.FERN_TOKEN,
                GITHUB_TOKEN: process.env.GITHUB_TOKEN
            }
        });

        const branchMatch = stdout.match(/branch[:\s]+([^\s\n]+)/i);
        if (!branchMatch || !branchMatch[1]) {
            throw new Error("Failed to extract branch name from remote generation output");
        }

        return branchMatch[1];
    }

    private async runLocalGeneration(): Promise<string> {
        this.taskContext.logger.info("Running local generation...");

        const { stdout } = await execAsync(
            `fern generate --group ${this.config.localGroup} --local --log-level debug`,
            {
                cwd: this.config.workspacePath,
                env: {
                    ...process.env,
                    FERN_TOKEN: process.env.FERN_TOKEN,
                    GITHUB_TOKEN: process.env.GITHUB_TOKEN
                }
            }
        );

        const branchMatch = stdout.match(/branch[:\s]+([^\s\n]+)/i);
        if (!branchMatch || !branchMatch[1]) {
            throw new Error("Failed to extract branch name from local generation output");
        }

        return branchMatch[1];
    }

    private async compareOutputs(remoteBranch: string, localBranch: string): Promise<ComparisonResult> {
        this.taskContext.logger.info("Cloning repository and comparing outputs...");

        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "fern-comparison-"));

        try {
            await execAsync(`git clone https://github.com/${this.config.githubRepo} ${tempDir}`, {
                env: {
                    ...process.env,
                    GITHUB_TOKEN: process.env.GITHUB_TOKEN
                }
            });

            await execAsync(`git fetch origin ${remoteBranch}:${remoteBranch}`, { cwd: tempDir });
            await execAsync(`git fetch origin ${localBranch}:${localBranch}`, { cwd: tempDir });

            const remoteDir = path.join(tempDir, "remote-output");
            const localDir = path.join(tempDir, "local-output");

            await fs.mkdir(remoteDir, { recursive: true });
            await fs.mkdir(localDir, { recursive: true });

            await execAsync(`git checkout ${remoteBranch}`, { cwd: tempDir });
            await execAsync(`cp -r . ${remoteDir}/`, { cwd: tempDir });

            await execAsync(`git checkout ${localBranch}`, { cwd: tempDir });
            await execAsync(`cp -r . ${localDir}/`, { cwd: tempDir });

            const comparator = new FileComparator(this.config.comparisonRules ?? {});
            const differences = await comparator.compareDirectories(
                AbsoluteFilePath.of(remoteDir),
                AbsoluteFilePath.of(localDir)
            );

            const totalFiles = (await this.countFiles(remoteDir)) + (await this.countFiles(localDir));
            const result = ComparisonReport.generate(differences, totalFiles);

            return result;
        } finally {
            await fs.rm(tempDir, { recursive: true, force: true });
        }
    }

    private async countFiles(dir: string): Promise<number> {
        let count = 0;
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.name === ".git") {
                continue;
            }

            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                count += await this.countFiles(fullPath);
            } else {
                count++;
            }
        }

        return count;
    }
}
