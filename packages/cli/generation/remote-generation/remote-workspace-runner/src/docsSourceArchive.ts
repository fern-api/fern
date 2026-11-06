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

export type DocsSourceArchive =
    | {
          type: "ok";
          buffer: Buffer;
          fileCount: number;
          /** Listed files that could not be read, so were left out. */
          unreadable: string[];
      }
    | { type: "skipped"; reason: string };

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
        .filter((relativePath) => isInsideRoot(relativePath) && !isExcluded(relativePath))
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
    const unreadable: string[] = [];
    let totalBytes = 0;
    for (const relativePath of relativePaths) {
        let bytes: Buffer;
        try {
            bytes = await readFile(path.join(fernRoot, relativePath));
        } catch {
            // Tracked by git but deleted locally, a submodule, or not readable.
            unreadable.push(relativePath);
            continue;
        }
        const repoPath = `${SOURCE_ROOT}/${relativePath}`;
        const text = decodeText(bytes);
        const file: DocsSourceFile =
            text != null
                ? { path: repoPath, content: text }
                : { path: repoPath, content: bytes.toString("base64"), encoding: "base64" };
        // Count what is uploaded: base64 and JSON escaping make it larger than the files.
        totalBytes += Buffer.byteLength(JSON.stringify(file), "utf-8") + 1;
        if (totalBytes > DOCS_SOURCE_MAX_BYTES) {
            return { type: "skipped", reason: tooLarge() };
        }
        files.push(file);
    }
    const buffer = Buffer.from(JSON.stringify(files), "utf-8");
    if (buffer.length > DOCS_SOURCE_MAX_BYTES) {
        return { type: "skipped", reason: tooLarge() };
    }
    return { type: "ok", buffer, fileCount: files.length, unreadable };
}

export function isExcluded(relativePath: string): boolean {
    return relativePath
        .split("/")
        .some((segment) => EXCLUDED_NAMES.has(segment) || segment === ".env" || segment.startsWith(".env."));
}

function tooLarge(): string {
    return `the fern/ folder is larger than ${DOCS_SOURCE_MAX_BYTES / (1024 * 1024)} MB once packed`;
}

/** Git can list paths outside the folder (a submodule, `..`); only files inside it are read. */
function isInsideRoot(relativePath: string): boolean {
    return (
        relativePath !== "" &&
        !path.posix.isAbsolute(relativePath) &&
        !relativePath.split("/").some((segment) => segment === ".." || segment === "")
    );
}

const UTF8 = new TextDecoder("utf-8", { fatal: true });

/** The file as UTF-8 text, or undefined for a binary file. */
function decodeText(bytes: Buffer): string | undefined {
    if (bytes.includes(0)) {
        return undefined;
    }
    try {
        return UTF8.decode(bytes);
    } catch {
        return undefined;
    }
}

/** Tracked and untracked files git does not ignore, relative to `directory`; undefined outside a git repo. */
async function listWithGit(directory: string): Promise<string[] | undefined> {
    try {
        const { stdout } = await promisify(execFile)(
            "git",
            ["-c", "core.quotePath=false", "ls-files", "--cached", "--others", "--exclude-standard", "-z", "--", "."],
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
