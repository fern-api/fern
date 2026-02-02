import { execSync } from "child_process";
import simpleGit from "simple-git";
import tmp from "tmp-promise";

import { ClonedRepository } from "./ClonedRepository";
import { parseRepository } from "./parseRepository";

/**
 * Clones the repository to the local file system.
 * @param githubRepository a string that can be parsed into a RepositoryReference (e.g. 'owner/repo')
 */
export async function cloneRepository({
    githubRepository,
    installationToken,
    targetDirectory,
    timeoutMs
}: {
    githubRepository: string;
    installationToken: string | undefined;
    targetDirectory?: string;
    timeoutMs?: number;
}): Promise<ClonedRepository> {
    const repositoryReference = parseRepository(githubRepository);
    const cloneUrl =
        installationToken != null
            ? repositoryReference.getAuthedCloneUrl(installationToken)
            : repositoryReference.cloneUrl;
    const clonePath = targetDirectory ?? (await tmp.dir()).path;

    const git = simpleGit(clonePath, {
        timeout:
            timeoutMs != null
                ? {
                      block: timeoutMs // Kill the process if no data is received for the specified time
                  }
                : undefined
    });

    try {
        await git.clone(cloneUrl, ".");
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("ENOENT") || errorMessage.includes("spawn git")) {
            let gitInfo = "git binary not found";
            try {
                const gitPath = execSync("which git 2>/dev/null || echo 'not found'", { encoding: "utf-8" }).trim();
                const gitVersion = execSync("git --version 2>/dev/null || echo 'unknown'", {
                    encoding: "utf-8"
                }).trim();
                gitInfo = `git path: ${gitPath}, version: ${gitVersion}`;
            } catch {
                gitInfo = "git binary not available in PATH";
            }
            throw new Error(
                `Failed to clone repository: git command not found. ` +
                    `This typically means git is not installed in the container. ` +
                    `Debug info: ${gitInfo}. ` +
                    `Original error: ${errorMessage}`
            );
        }
        throw error;
    }

    return new ClonedRepository({
        clonePath,
        git
    });
}
