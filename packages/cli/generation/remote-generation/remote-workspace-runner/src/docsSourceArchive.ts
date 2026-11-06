import { toPosixPath } from "@fern-api/fs-utils";
import { execFile } from "child_process";
import { access, readdir, readFile } from "fs/promises";
import path from "path";
import { promisify } from "util";

/** Larger folders are not uploaded: the source only has to carry a docs project, not its build output. */
export const DOCS_SOURCE_MAX_BYTES = 20 * 1024 * 1024;
export const DOCS_SOURCE_MAX_FILES = 5_000;

const EXCLUDED_NAMES = new Set([".git", "node_modules", ".guest-session", ".DS_Store"]);
const FERN_CONFIG_FILENAME = "fern.config.json";
const SOURCE_ROOT = "fern";

/** One file of the uploaded `fern/` folder, in the shape the dashboard writes to GitHub. */
export interface DocsSourceFile {
    /** Repo-relative, always under `fern/`. */
    path: string;
    content: string;
    /** Set for binary files; text files are UTF-8. */
    encoding?: "base64";
}

export type DocsSourceArchive = { type: "ok"; buffer: Buffer; fileCount: number } | { type: "skipped"; reason: string };

/**
 * The `fern/` folder the docs workspace lives in: the nearest folder at or above `docsDirectory`
 * that holds `fern.config.json`, or `docsDirectory` itself.
 */
export async function findFernRoot(docsDirectory: string): Promise<string> {
    let current = docsDirectory;
    for (let depth = 0; depth < 4; depth++) {
        if (await exists(path.join(current, FERN_CONFIG_FILENAME))) {
            return current;
        }
        const parent = path.dirname(current);
        if (parent === current) {
            break;
        }
        current = parent;
    }
    return docsDirectory;
}

/**
 * Packs the `fern/` folder as a JSON `DocsSourceFile[]`, so a guest site can later be written to a
 * GitHub repo exactly as it was published. Leaves out what git ignores, secrets-prone `.env*` files,
 * the guest session pointer and dependency folders.
 */
export async function buildDocsSourceArchive({ fernRoot }: { fernRoot: string }): Promise<DocsSourceArchive> {
    const relativePaths = ((await listWithGit(fernRoot)) ?? (await listByWalking(fernRoot)))
        .map((relativePath) => toPosixPath(relativePath))
        .filter((relativePath) => !isExcluded(relativePath))
        .sort();
    if (relativePaths.length === 0) {
        return { type: "skipped", reason: "the fern/ folder has no files" };
    }
    if (relativePaths.length > DOCS_SOURCE_MAX_FILES) {
        return {
            type: "skipped",
            reason: `the fern/ folder has more than ${DOCS_SOURCE_MAX_FILES.toLocaleString()} files`
        };
    }

    const files: DocsSourceFile[] = [];
    let totalBytes = 0;
    for (const relativePath of relativePaths) {
        let bytes: Buffer;
        try {
            bytes = await readFile(path.join(fernRoot, relativePath));
        } catch {
            // Tracked by git but deleted locally, or a directory git lists as a submodule.
            continue;
        }
        totalBytes += bytes.length;
        if (totalBytes > DOCS_SOURCE_MAX_BYTES) {
            return {
                type: "skipped",
                reason: `the fern/ folder is larger than ${DOCS_SOURCE_MAX_BYTES / (1024 * 1024)} MB`
            };
        }
        const repoPath = `${SOURCE_ROOT}/${relativePath}`;
        files.push(
            isText(bytes)
                ? { path: repoPath, content: bytes.toString("utf-8") }
                : { path: repoPath, content: bytes.toString("base64"), encoding: "base64" }
        );
    }
    return { type: "ok", buffer: Buffer.from(JSON.stringify(files), "utf-8"), fileCount: files.length };
}

export function isExcluded(relativePath: string): boolean {
    return relativePath
        .split("/")
        .some((segment) => EXCLUDED_NAMES.has(segment) || segment === ".env" || segment.startsWith(".env."));
}

function isText(bytes: Buffer): boolean {
    return !bytes.includes(0) && Buffer.from(bytes.toString("utf-8"), "utf-8").equals(bytes);
}

/** Tracked and untracked files git does not ignore, relative to `directory`; undefined outside a git repo. */
async function listWithGit(directory: string): Promise<string[] | undefined> {
    try {
        const { stdout } = await promisify(execFile)(
            "git",
            ["ls-files", "--cached", "--others", "--exclude-standard", "-z", "--", "."],
            { cwd: directory, maxBuffer: 64 * 1024 * 1024 }
        );
        return [...new Set(stdout.split("\0").filter((entry) => entry !== ""))];
    } catch {
        return undefined;
    }
}

async function listByWalking(directory: string, prefix = ""): Promise<string[]> {
    const entries = await readdir(path.join(directory, prefix), { withFileTypes: true });
    const paths: string[] = [];
    for (const entry of entries) {
        if (EXCLUDED_NAMES.has(entry.name)) {
            continue;
        }
        const relativePath = prefix === "" ? entry.name : path.join(prefix, entry.name);
        if (entry.isDirectory()) {
            paths.push(...(await listByWalking(directory, relativePath)));
        } else if (entry.isFile()) {
            paths.push(relativePath);
        }
    }
    return paths;
}

async function exists(filePath: string): Promise<boolean> {
    return access(filePath).then(
        () => true,
        () => false
    );
}
