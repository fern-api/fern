import { parseRepository } from "@fern-api/github";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const PRIVATE_REPO_ERROR_PATTERNS = [
    "Repository not found",
    "Authentication failed",
    "could not read Username",
    "terminal prompts disabled"
];

/**
 * `--preview` replaces every `${VAR}` in generators.yml with an empty value, so a self-hosted
 * `github.token` that references an environment variable is empty and the generator can only
 * clone public repositories. Returns an error message if that applies and the repository is not
 * readable without credentials.
 */
export async function getPreviewPrivateRepoError({
    uri,
    token,
    previewMode,
    isPubliclyReadable = isRepoPubliclyReadable
}: {
    uri: string;
    token: string;
    previewMode: boolean;
    isPubliclyReadable?: (uri: string) => Promise<boolean>;
}): Promise<string | undefined> {
    if (!previewMode || token.trim() !== "") {
        return undefined;
    }
    if (await isPubliclyReadable(uri)) {
        return undefined;
    }
    return `--preview and --local can't run with a private repo (${uri}), remove --preview and generate to a local folder`;
}

/**
 * Runs `git ls-remote` without credentials. Network and other unexpected failures count as
 * readable so that the regular clone step reports them.
 */
async function isRepoPubliclyReadable(uri: string): Promise<boolean> {
    try {
        await execFileAsync("git", ["-c", "credential.helper=", "ls-remote", parseRepository(uri).cloneUrl, "HEAD"], {
            env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_ASKPASS: "" },
            timeout: 30_000
        });
        return true;
    } catch (error) {
        return !isPrivateRepoError(error);
    }
}

export function isPrivateRepoError(error: unknown): boolean {
    const stderr =
        error != null && typeof error === "object" && "stderr" in error ? String(error.stderr) : String(error);
    return PRIVATE_REPO_ERROR_PATTERNS.some((pattern) => stderr.includes(pattern));
}
