import { execSync } from "child_process";
import { simpleGit } from "simple-git";
import tmp from "tmp-promise";

import { ClonedRepository } from "./ClonedRepository.js";
import { parseRepository } from "./parseRepository.js";

/**
 * Sanitizes a clone URL by redacting any embedded tokens/credentials.
 */
function sanitizeCloneUrl(url: string): string {
    return url.replace(/\/\/[^@]+@/, "//[REDACTED]@");
}

/**
 * Checks if git is available on the system.
 * Returns true if git is found and executable, false otherwise.
 */
function isGitAvailable(): boolean {
    try {
        execSync("git --version", { encoding: "utf-8", stdio: "pipe" });
        return true;
    } catch {
        return false;
    }
}

/**
 * Gets diagnostic information about the git binary and environment.
 */
function getGitDiagnostics(): string {
    const diagnostics: string[] = [];

    try {
        const whichCommand = process.platform === "win32" ? "where git" : "which git";
        const gitPath = execSync(`${whichCommand} 2>/dev/null || echo 'not found'`, { encoding: "utf-8" }).trim();
        diagnostics.push(`git path: ${gitPath}`);
    } catch {
        diagnostics.push("git path: unable to determine");
    }

    try {
        const gitVersion = execSync("git --version 2>/dev/null || echo 'unknown'", { encoding: "utf-8" }).trim();
        diagnostics.push(`version: ${gitVersion}`);
    } catch {
        diagnostics.push("version: unknown");
    }

    try {
        const isContainer =
            execSync("test -f /.dockerenv && echo 'yes' || echo 'no'", { encoding: "utf-8" }).trim() === "yes";
        diagnostics.push(`in container: ${isContainer}`);
    } catch {
        diagnostics.push("in container: unknown");
    }

    diagnostics.push(`PATH: ${process.env.PATH ?? "unset"}`);

    return diagnostics.join(", ");
}

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
    const sanitizedUrl = sanitizeCloneUrl(cloneUrl);

    // Pre-flight check: verify git is available before attempting to clone
    if (!isGitAvailable()) {
        const diagnostics = getGitDiagnostics();
        throw new Error(
            `Git is not installed or not found in PATH. ` +
                `Self-hosted GitHub mode requires git to be installed on the host machine where the Fern CLI runs. ` +
                `Please install git and ensure it is available in your PATH. ` +
                `Repository: ${githubRepository}. ` +
                `Debug info: ${diagnostics}`
        );
    }

    const git = simpleGit(clonePath, {
        timeout:
            timeoutMs != null
                ? {
                      block: timeoutMs // Kill the process if no data is received for the specified time
                  }
                : undefined
    });

    const startTime = Date.now();
    try {
        await git.clone(cloneUrl, ".");
    } catch (error) {
        const elapsed = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Git binary not found
        if (errorMessage.includes("ENOENT") || errorMessage.includes("spawn git")) {
            const diagnostics = getGitDiagnostics();
            throw new Error(
                `Failed to clone repository: git command not found. ` +
                    `Self-hosted GitHub mode requires git to be installed on the host machine where the Fern CLI runs. ` +
                    `URL: ${sanitizedUrl}. ` +
                    `Elapsed: ${elapsed}ms. ` +
                    `Debug info: ${diagnostics}. ` +
                    `Original error: ${errorMessage}`
            );
        }

        // Authentication failure
        if (
            errorMessage.includes("Authentication failed") ||
            errorMessage.includes("could not read Username") ||
            errorMessage.includes("401") ||
            errorMessage.includes("403")
        ) {
            throw new Error(
                `Failed to clone repository: authentication failed. ` +
                    `Ensure your GitHub token is set and has access to the repository. ` +
                    `URL: ${sanitizedUrl}. ` +
                    `Elapsed: ${elapsed}ms. ` +
                    `Original error: ${errorMessage}`
            );
        }

        // Repository not found
        if (
            errorMessage.includes("Repository not found") ||
            errorMessage.includes("not found") ||
            errorMessage.includes("404")
        ) {
            throw new Error(
                `Failed to clone repository: repository not found. ` +
                    `Check that ${githubRepository} exists and your token has access. ` +
                    `URL: ${sanitizedUrl}. ` +
                    `Elapsed: ${elapsed}ms. ` +
                    `Original error: ${errorMessage}`
            );
        }

        // Network/timeout issues
        if (
            errorMessage.includes("Connection refused") ||
            errorMessage.includes("Connection timed out") ||
            errorMessage.includes("Could not resolve host") ||
            errorMessage.includes("unable to access")
        ) {
            throw new Error(
                `Failed to clone repository: network error. ` +
                    `Check network connectivity and proxy settings. ` +
                    `URL: ${sanitizedUrl}. ` +
                    `Elapsed: ${elapsed}ms. ` +
                    `Original error: ${errorMessage}`
            );
        }

        // Generic fallback with context
        throw new Error(
            `Failed to clone repository ${githubRepository}. ` +
                `URL: ${sanitizedUrl}. ` +
                `Elapsed: ${elapsed}ms. ` +
                `Original error: ${errorMessage}`
        );
    }

    return new ClonedRepository({
        clonePath,
        git
    });
}
