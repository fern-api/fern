import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";
import { CliError } from "../../../../errors/CliError.js";

const execFileAsync = promisify(execFile);

let cachedRepoRoot: string | undefined;

/**
 * Returns the file content from git HEAD for the given absolute path.
 * Throws a CliError if the file is not tracked by git.
 */
export async function getFileFromGitHead(absolutePath: AbsoluteFilePath): Promise<string> {
    try {
        const repoRoot = await getRepoRoot(absolutePath);
        const relativePath = path.relative(repoRoot, absolutePath);

        const { stdout } = await execFileAsync("git", ["show", `HEAD:${relativePath}`], {
            cwd: repoRoot,
            encoding: "utf8",
            maxBuffer: 50 * 1024 * 1024
        });
        return stdout;
    } catch {
        throw new CliError({
            message: `Failed to get file from git HEAD: ${absolutePath}. Is the file tracked by git and has at least one commit?`
        });
    }
}

async function getRepoRoot(nearPath: AbsoluteFilePath): Promise<string> {
    if (cachedRepoRoot != null) {
        return cachedRepoRoot;
    }
    const { stdout } = await execFileAsync("git", ["rev-parse", "--show-toplevel"], {
        cwd: path.dirname(nearPath),
        encoding: "utf8"
    });
    cachedRepoRoot = stdout.trim();
    return cachedRepoRoot;
}
