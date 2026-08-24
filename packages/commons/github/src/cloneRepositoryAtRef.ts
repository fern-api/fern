import { extractErrorMessage, isCommitSha, isGitAvailable } from "@fern-api/core-utils";
import path from "path";
import { simpleGit } from "simple-git";
import tmp from "tmp-promise";

tmp.setGracefulCleanup();

/**
 * Shallow-clones `repositoryUrl` at `ref` (a branch, tag, or commit SHA; the
 * default branch when omitted) into a temporary directory and returns its path.
 * Symlinks are not materialized so a checkout cannot point outside itself.
 */
export async function cloneRepositoryAtRef({
    repositoryUrl,
    ref
}: {
    repositoryUrl: string;
    ref: string | undefined;
}): Promise<string> {
    if (!isGitAvailable()) {
        throw new Error(
            "Git is not installed or not found in PATH. " +
                "Cloning a git source requires git to be available. " +
                "Please install git and ensure it is in your PATH."
        );
    }

    const tmpDir = await tmp.dir({ unsafeCleanup: true });
    const cloneArgs = ["--depth", "1", "--config", "core.symlinks=false"];

    try {
        if (ref != null && isCommitSha(ref)) {
            // Commit SHAs cannot be used with --branch; fetch the specific commit instead.
            await simpleGit().clone(repositoryUrl, tmpDir.path, [...cloneArgs, "--no-checkout"]);
            const repoGit = simpleGit(tmpDir.path);
            await repoGit.fetch("origin", ref, { "--depth": "1" });
            await repoGit.checkout(ref);
        } else {
            await simpleGit().clone(
                repositoryUrl,
                tmpDir.path,
                ref != null ? [...cloneArgs, "--branch", ref] : cloneArgs
            );
        }
    } catch (error) {
        const errorMessage = extractErrorMessage(error);
        if (
            errorMessage.includes("Authentication failed") ||
            errorMessage.includes("could not read Username") ||
            errorMessage.includes("401") ||
            errorMessage.includes("403")
        ) {
            throw new Error(
                `Failed to clone ${repositoryUrl}: authentication failed. ` +
                    `Ensure your git credentials are configured for that repository. ` +
                    `The CLI uses your system's git credential configuration (credential helpers, SSH keys, GIT_ASKPASS). ` +
                    `Original error: ${errorMessage}`
            );
        }
        if (errorMessage.toLowerCase().includes("repository not found") || errorMessage.includes("404")) {
            throw new Error(
                `Failed to clone ${repositoryUrl}: repository not found. ` +
                    `Check that it exists and your credentials have access. ` +
                    `Original error: ${errorMessage}`
            );
        }
        throw new Error(
            `Failed to clone ${repositoryUrl}${ref != null ? ` at ref '${ref}'` : ""}. ` +
                `Original error: ${errorMessage}`
        );
    }

    return tmpDir.path;
}

/**
 * Resolves `subpath` against a cloned repository root, rejecting paths that
 * escape the clone.
 */
export function resolveRepositorySubpath({
    repositoryRoot,
    subpath,
    description
}: {
    repositoryRoot: string;
    subpath: string;
    description: string;
}): string {
    const resolved = path.resolve(repositoryRoot, subpath);
    if (resolved !== repositoryRoot && !resolved.startsWith(repositoryRoot + path.sep)) {
        throw new Error(
            `Invalid ${description} '${subpath}': ` +
                `path must be relative to the repository root and cannot traverse outside it.`
        );
    }
    return resolved;
}
