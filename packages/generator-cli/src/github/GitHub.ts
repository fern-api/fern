import { cwd, resolve } from "@fern-api/fs-utils";
import { cloneRepository, parseRepository } from "@fern-api/github";
import type { ClonedRepository } from "@fern-api/github/src/ClonedRepository";
import { Octokit } from "@octokit/rest";

import type { FernGeneratorCli } from "../configuration/sdk";

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
            await repository.overwriteLocalContents(sourceDirectory);
            await repository.add(".");
            await this.restoreFiles(repository, fernIgnoreFiles);
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
            await repository.overwriteLocalContents(sourceDirectory);
            await repository.add(".");
            await this.restoreFiles(repository, fernIgnoreFiles);
            await repository.commit("SDK Generation");
            await repository.push();

            const octokit = new Octokit({
                auth: this.githubConfig.token
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
        const fernignoreLines = fernignore.split("\n");
        const fernignoreFiles: string[] = [];
        for (const line of fernignoreLines) {
            const trimmedLine = line.trim();
            if (
                !trimmedLine.startsWith("#") &&
                trimmedLine.length > 0 &&
                (await repository.fileExists({ relativeFilePath: trimmedLine }))
            ) {
                fernignoreFiles.push(trimmedLine);
            }
        }
        return fernignoreFiles;
    }

    private async restoreFiles(repository: ClonedRepository, files: string[]): Promise<void> {
        if (files.length === 0) {
            return;
        }
        await repository.restoreFiles({ files, staged: true });
        await repository.restoreFiles({ files: files });
    }
}
