import { cp, lstat, readdir, readFile, rm } from "fs/promises";
import path, { resolve } from "path";
import { type SimpleGit, simpleGit } from "simple-git";

import { FERNIGNORE, GIT_DIR, GITIGNORE, README_FILEPATH } from "./constants";

const DEFAULT_IGNORED_FILES = [FERNIGNORE, GITIGNORE, GIT_DIR];

// ClonedRepository is a repository that has been successfully cloned to the local file system
// and is ready to be used.
export class ClonedRepository {
    private clonePath: string;
    private git: SimpleGit;

    constructor({ clonePath, git }: { clonePath: string; git: SimpleGit }) {
        this.clonePath = clonePath;
        this.git = git;
    }

    public static createAtPath(clonePath: string): ClonedRepository {
        return new ClonedRepository({
            clonePath,
            git: simpleGit(clonePath)
        });
    }

    public async getDefaultBranch(): Promise<string> {
        await this.git.cwd(this.clonePath);
        const remoteInfo = await this.git.remote(["show", "origin"]);
        if (remoteInfo == null) {
            throw new Error("Could not determine default branch");
        }
        const match = remoteInfo.match(/HEAD branch: (.+)/);
        if (!match?.[1]) {
            throw new Error("Could not determine default branch");
        }
        return match[1].trim();
    }

    public async getCurrentBranch(): Promise<string> {
        await this.git.cwd(this.clonePath);
        const branch = await this.git.branchLocal();
        return branch.current;
    }

    public async getReadme(): Promise<string | undefined> {
        return await this.readFile({ relativeFilePath: README_FILEPATH });
    }

    public async getFernignore(): Promise<string | undefined> {
        return await this.readFile({ relativeFilePath: FERNIGNORE });
    }

    public async add(files: string | string[]): Promise<void> {
        await this.git.cwd(this.clonePath);
        await this.git.add(files);
    }

    public async fileExists({ relativeFilePath }: { relativeFilePath: string }): Promise<boolean> {
        return await doesPathExist(path.join(this.clonePath, relativeFilePath));
    }

    public async restoreFiles({ files, staged }: { files: string | string[]; staged?: boolean }): Promise<void> {
        await this.git.cwd(this.clonePath);
        const args = ["restore", "--source=HEAD"];
        if (staged) {
            args.push("--staged");
        }
        await this.git.raw([...args, ...(Array.isArray(files) ? files : [files])]);
    }

    public async commit(message?: string): Promise<void> {
        await this.git.cwd(this.clonePath);
        await this.git.commit(message ?? `Automated commit`, undefined, {
            "--allow-empty": null
        });
    }

    public async checkout(branch: string): Promise<void> {
        await this.git.cwd(this.clonePath);
        try {
            // Try regular checkout first
            await this.git.checkout(branch);
        } catch (_error) {
            // If checkout fails, create a new branch
            await this.git.checkoutLocalBranch(branch);
            // Push the new branch to remote
            await this.git.push("origin", branch, { "--set-upstream": null });
        }
    }

    public async pull(branch: string): Promise<void> {
        await this.git.cwd(this.clonePath);
        await this.git.pull("origin", branch);
    }

    public async push(): Promise<void> {
        await this.git.cwd(this.clonePath);
        await this.git.push();
    }

    public async isRemoteEmpty(): Promise<boolean> {
        await this.git.cwd(this.clonePath);
        try {
            const result = await this.git.raw(["ls-remote", "--heads", "origin"]);
            return result.trim().length === 0;
        } catch (_error) {
            return true;
        }
    }

    public async checkoutOrCreateLocal(branch: string): Promise<void> {
        await this.git.cwd(this.clonePath);
        try {
            await this.git.checkout(branch);
        } catch (_error) {
            await this.git.checkoutLocalBranch(branch);
        }
    }

    public async pushUpstream(branch: string): Promise<void> {
        await this.git.cwd(this.clonePath);
        await this.git.push("origin", branch, { "--set-upstream": null });
    }

    public async overwriteLocalContents(sourceDirectoryPath: string): Promise<void> {
        const [sourceContents, destContents] = await Promise.all([
            readdir(sourceDirectoryPath),
            readdir(this.clonePath)
        ]);

        await Promise.all(
            destContents
                .filter((content) => !DEFAULT_IGNORED_FILES.includes(content))
                .map(async (content) => {
                    await rm(resolve(this.clonePath, content), {
                        recursive: true,
                        force: true
                    });
                })
        );

        await Promise.all(
            sourceContents
                .filter((content) => !DEFAULT_IGNORED_FILES.includes(content))
                .map(async (content) => {
                    const path = resolve(sourceDirectoryPath, content);
                    await cp(path, resolve(this.clonePath, content), { recursive: true });
                })
        );
    }

    private async readFile({ relativeFilePath }: { relativeFilePath: string }): Promise<string | undefined> {
        const absoluteFilePath = path.join(this.clonePath, relativeFilePath);
        if (!(await doesPathExist(absoluteFilePath))) {
            return undefined;
        }
        return await readFile(absoluteFilePath, "utf-8");
    }
}

async function doesPathExist(filepath: string): Promise<boolean> {
    try {
        await lstat(filepath);
        return true;
    } catch {
        return false;
    }
}
