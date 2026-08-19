import { cwd, resolve } from "@fern-api/fs-utils";
import {
    ClonedRepository,
    cloneRepository,
    expandFernignorePatterns,
    getGithubApiBaseUrl,
    parseRepository
} from "@fern-api/github";
import { Octokit } from "@octokit/rest";
import { readdir } from "fs/promises";

import type { FernGeneratorCli } from "../configuration/sdk/index.js";

export class GitHub {
    private githubConfig: FernGeneratorCli.GitHubConfig;

    constructor({
        githubConfig
    }: {
        githubConfig: FernGeneratorCli.GitHubConfig;
    }) {
        this.githubConfig = githubConfig;
    }

    public async push(): Promise<void> {
        try {
            const wd = cwd();

            const sourceDirectory = resolve(wd, this.githubConfig.sourceDirectory);

            const repository = await cloneRepository({
                githubRepository: this.githubConfig.uri,
                installationToken: this.githubConfig.token
            });

            const isEmptyRepo = await repository.isRemoteEmpty();

            let branch: string;
            if (isEmptyRepo) {
                branch = this.githubConfig.branch ?? "main";
                await repository.checkoutOrCreateLocal(branch);
            } else {
                branch = this.githubConfig.branch ?? (await repository.getDefaultBranch());
                await repository.checkout(branch);
                await repository.pull(branch);
            }

            const fernIgnoreFiles = await this.getFernignoreFiles(repository);
            const changelogFiles = await this.getChangelogFilesToPreserve(repository, sourceDirectory);
            await repository.overwriteLocalContents(sourceDirectory);
            await repository.add(".");
            await this.restoreFiles(repository, [...fernIgnoreFiles, ...changelogFiles]);
            await repository.commit("SDK Generation");

            if (isEmptyRepo) {
                await repository.pushUpstream(branch);
            } else {
                await repository.push();
            }
        } catch (error) {
            // TODO: migrate this to use @fern-api/logger
            console.error("Error during GitHub push:", error);
            throw error;
        }
    }

    public async pr(): Promise<void> {
        try {
            const wd = cwd();
            const sourceDirectory = resolve(wd, this.githubConfig.sourceDirectory);

            const repository = await cloneRepository({
                githubRepository: this.githubConfig.uri,
                installationToken: this.githubConfig.token
            });

            const isEmptyRepo = await repository.isRemoteEmpty();

            let baseBranch: string;
            if (isEmptyRepo) {
                baseBranch = this.githubConfig.branch ?? "main";
                await repository.checkoutOrCreateLocal(baseBranch);
                await repository.commit("Initial commit");
                await repository.pushUpstream(baseBranch);
            } else {
                baseBranch = this.githubConfig.branch ?? (await repository.getDefaultBranch());
                await repository.checkout(baseBranch);
                await repository.pull(baseBranch);
            }

            const now = new Date();
            const formattedDate = now.toISOString().replace("T", "_").replace(/:/g, "-").replace(/\..+/, "");
            const prBranch = `fern-bot/${formattedDate}`;
            await repository.checkout(prBranch);

            const fernIgnoreFiles = await this.getFernignoreFiles(repository);
            const changelogFiles = await this.getChangelogFilesToPreserve(repository, sourceDirectory);
            await repository.overwriteLocalContents(sourceDirectory);
            await repository.add(".");
            await this.restoreFiles(repository, [...fernIgnoreFiles, ...changelogFiles]);
            await repository.commit("SDK Generation");
            await repository.push();

            const apiBaseUrl = getGithubApiBaseUrl(this.githubConfig.uri);
            const octokit = new Octokit({
                auth: this.githubConfig.token,
                ...(apiBaseUrl != null ? { baseUrl: apiBaseUrl } : {})
            });
            // Use octokit directly to create the pull request
            const parsedRepo = parseRepository(this.githubConfig.uri);
            const { owner, repo } = parsedRepo;
            const head = `${owner}:${prBranch}`;
            try {
                await octokit.pulls.create({
                    owner,
                    repo,
                    title: "SDK Generation",
                    body: "Automated SDK generation by Fern",
                    head,
                    base: baseBranch,
                    draft: false
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (e: any) {
                if (typeof e?.message === "string" && e.message.includes("A pull request already exists for")) {
                    // PR already exists, do nothing or log as needed
                    console.error(`A pull request already exists for ${head}`);
                } else {
                    throw e;
                }
            }
        } catch (error) {
            // TODO: migrate this to use @fern-api/logger
            console.error("Error during GitHub PR flow:", error);
            throw error;
        }
    }

    public async release(): Promise<void> {
        console.log("TODO: Implement release");
    }

    private async getFernignoreFiles(repository: ClonedRepository): Promise<string[]> {
        const fernignore = await repository.getFernignore();
        if (fernignore === undefined) {
            return [];
        }
        const tracked = await repository.listTrackedFiles();
        return expandFernignorePatterns(fernignore, tracked);
    }

    /**
     * Returns tracked changelog files (e.g. `changelog.md`) that should be restored after
     * `overwriteLocalContents`, so existing changelog entries are never wiped when the
     * generated output doesn't include a changelog of its own.
     */
    private async getChangelogFilesToPreserve(
        repository: ClonedRepository,
        sourceDirectory: string
    ): Promise<string[]> {
        const tracked = await repository.listTrackedFiles();
        const trackedChangelogs = tracked.filter((file) => file.toLowerCase() === "changelog.md");
        if (trackedChangelogs.length === 0) {
            return [];
        }
        try {
            const sourceFiles = await readdir(sourceDirectory);
            const sourceHasChangelog = sourceFiles.some((file) => file.toLowerCase() === "changelog.md");
            return sourceHasChangelog ? [] : trackedChangelogs;
        } catch {
            return trackedChangelogs;
        }
    }

    private async restoreFiles(repository: ClonedRepository, files: string[]): Promise<void> {
        if (files.length === 0) {
            return;
        }
        await repository.restoreFiles({ files, staged: true });
        await repository.restoreFiles({ files: files });
    }
}
