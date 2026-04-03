import { createHash } from "crypto";
import fs from "fs";
import path from "path";

/**
 * Detects if the current working directory is inside a git worktree and returns
 * a short deterministic suffix derived from the worktree path. In a worktree,
 * `.git` is a **file** (containing `gitdir: <path>`) rather than a directory.
 *
 * Returns `undefined` when running from the main repo checkout (`.git` is a directory)
 * or when `.git` cannot be found.
 */
export function getWorktreeSuffix(): string | undefined {
    const gitPath = findDotGit(process.cwd());
    if (gitPath == null) {
        return undefined;
    }

    let stat: fs.Stats;
    try {
        stat = fs.statSync(gitPath);
    } catch {
        // stat may fail for dangling symlinks or permission errors; safe to ignore
        return undefined;
    }

    // In a normal checkout .git is a directory — no suffix needed
    if (stat.isDirectory()) {
        return undefined;
    }

    // In a worktree .git is a file; derive suffix from the worktree root directory
    const worktreeRoot = path.dirname(gitPath);
    const hash = createHash("sha256").update(worktreeRoot).digest("hex").slice(0, 8);
    return `wt-${hash}`;
}

/**
 * Walks up from `startDir` looking for a `.git` entry (file or directory).
 * Returns the absolute path to it, or `undefined` if the filesystem root is reached.
 */
function findDotGit(startDir: string): string | undefined {
    let dir = path.resolve(startDir);
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const candidate = path.join(dir, ".git");
        if (fs.existsSync(candidate)) {
            return candidate;
        }
        const parent = path.dirname(dir);
        if (parent === dir) {
            return undefined;
        }
        dir = parent;
    }
}
