import { AbsoluteFilePath, join, RelativeFilePath, relative } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { CliError, TaskContext } from "@fern-api/task-context";
import tmp from "tmp-promise";

/**
 * The materialized state of the repository at a resolved git ref. The whole
 * repository (not just the fern folder) is checked out, because docs configs
 * routinely reference paths outside of `fern/`.
 */
export interface MaterializedGitRef {
    /** The ref exactly as declared in docs.yml (e.g. `v2.2.0` or `release/2.3`). */
    ref: string;
    /** The commit SHA that `ref` resolved to. */
    sha: string;
    /** Absolute path to the root of the materialized working tree at `sha`. */
    absolutePathToRepoRoot: AbsoluteFilePath;
    /** Absolute path to the fern folder within the materialized working tree at `sha`. */
    absolutePathToFernFolder: AbsoluteFilePath;
}

/**
 * Materialized checkouts are cached by resolved SHA for the lifetime of the
 * process so that a ref used by more than one version entry is not checked out
 * repeatedly during a single publish.
 */
const materializedRefsBySha = new Map<string, MaterializedGitRef>();

function shaCacheKey(repoRoot: string, sha: string): string {
    return `${repoRoot}::${sha}`;
}

async function runGit({
    args,
    cwd,
    context
}: {
    args: string[];
    cwd: string;
    context: TaskContext;
}): Promise<{ exitCode: number; stdout: string; stderr: string }> {
    const result = await loggingExeca(context.logger, "git", args, {
        cwd,
        doNotPipeOutput: true,
        reject: false
    });
    return { exitCode: result.exitCode, stdout: result.stdout.trim(), stderr: result.stderr.trim() };
}

async function getRepositoryRoot({
    absolutePathToFernFolder,
    context
}: {
    absolutePathToFernFolder: AbsoluteFilePath;
    context: TaskContext;
}): Promise<string> {
    const result = await runGit({
        args: ["rev-parse", "--show-toplevel"],
        cwd: absolutePathToFernFolder,
        context
    });
    if (result.exitCode !== 0 || result.stdout.length === 0) {
        throw new CliError({
            message:
                `Cannot resolve git-ref-backed docs versions because ${absolutePathToFernFolder} is not inside a git repository. ` +
                "Git-ref versions require the docs project to be committed to git.",
            code: CliError.Code.ConfigError
        });
    }
    return result.stdout;
}

async function getDefaultRemote({
    repoRoot,
    context
}: {
    repoRoot: string;
    context: TaskContext;
}): Promise<string | undefined> {
    const result = await runGit({ args: ["remote"], cwd: repoRoot, context });
    if (result.exitCode !== 0 || result.stdout.length === 0) {
        return undefined;
    }
    const remotes = result.stdout.split("\n").map((line) => line.trim());
    return remotes.includes("origin") ? "origin" : remotes[0];
}

async function tryResolveSha({
    repoRoot,
    ref,
    context
}: {
    repoRoot: string;
    ref: string;
    context: TaskContext;
}): Promise<string | undefined> {
    // `<ref>^{commit}` forces resolution to a commit object, so annotated tags
    // resolve to the commit they point at rather than the tag object.
    const result = await runGit({
        // `--` terminates option parsing so a ref beginning with `-` cannot be read as a git flag.
        args: ["rev-parse", "--verify", "--quiet", "--", `${ref}^{commit}`],
        cwd: repoRoot,
        context
    });
    if (result.exitCode !== 0 || result.stdout.length === 0) {
        return undefined;
    }
    return result.stdout;
}

/**
 * Attempts to fetch the history/tags needed to resolve `ref`. CI checkouts are
 * frequently shallow and tagless (`actions/checkout` defaults to depth 1 with
 * no tags), so we try to backfill what is missing before giving up.
 */
async function attemptFetch({
    repoRoot,
    ref,
    context
}: {
    repoRoot: string;
    ref: string;
    context: TaskContext;
}): Promise<void> {
    const remote = await getDefaultRemote({ repoRoot, context });
    if (remote == null) {
        return;
    }

    const isShallowResult = await runGit({ args: ["rev-parse", "--is-shallow-repository"], cwd: repoRoot, context });
    const isShallow = isShallowResult.stdout === "true";

    // Fetch the specific ref (works for both branches and tags) and its tags.
    // `--` terminates option parsing so a ref beginning with `-` cannot be read as a git flag.
    await runGit({
        args: ["fetch", ...(isShallow ? ["--unshallow"] : []), "--tags", remote, "--", ref],
        cwd: repoRoot,
        context
    });
    // If fetching the ref by name failed (e.g. it is a bare SHA), a plain
    // tag-inclusive fetch may still surface it.
    if ((await tryResolveSha({ repoRoot, ref, context })) == null) {
        await runGit({ args: ["fetch", "--tags", remote], cwd: repoRoot, context });
    }
}

async function resolveRefToSha({
    repoRoot,
    ref,
    context
}: {
    repoRoot: string;
    ref: string;
    context: TaskContext;
}): Promise<string> {
    const existing = await tryResolveSha({ repoRoot, ref, context });
    if (existing != null) {
        return existing;
    }

    await attemptFetch({ repoRoot, ref, context });

    const afterFetch = await tryResolveSha({ repoRoot, ref, context });
    if (afterFetch != null) {
        return afterFetch;
    }

    throw new CliError({
        message:
            `Failed to resolve git ref '${ref}' for a docs version. ` +
            "The ref was not found locally and could not be fetched. " +
            "If you are running in CI, ensure the checkout includes the ref's history and tags " +
            "(for example, set `fetch-depth: 0` and `fetch-tags: true` on actions/checkout).",
        code: CliError.Code.ConfigError
    });
}

/**
 * Resolves a git ref (tag, branch, or commit SHA) declared on a docs version
 * entry to a commit SHA and materializes the whole repository at that SHA in a
 * temporary directory, separate from the working tree.
 */
export async function materializeGitRef({
    ref,
    absolutePathToFernFolder,
    context
}: {
    ref: string;
    absolutePathToFernFolder: AbsoluteFilePath;
    context: TaskContext;
}): Promise<MaterializedGitRef> {
    const repoRoot = await getRepositoryRoot({ absolutePathToFernFolder, context });
    const sha = await resolveRefToSha({ repoRoot, ref, context });

    // The fern folder occupies the same path relative to the repo root at any ref.
    const fernFolderRelativeToRepoRoot = relative(AbsoluteFilePath.of(repoRoot), absolutePathToFernFolder);

    const cacheKey = shaCacheKey(repoRoot, sha);
    const cached = materializedRefsBySha.get(cacheKey);
    if (cached != null) {
        return { ...cached, ref };
    }

    // Drop stale worktree registrations from prior runs whose temp dirs were cleaned up.
    await runGit({ args: ["worktree", "prune"], cwd: repoRoot, context });

    const tmpDir = await tmp.dir({ unsafeCleanup: true });
    const worktreePath = AbsoluteFilePath.of(tmpDir.path);
    const addResult = await runGit({
        args: ["worktree", "add", "--detach", "--force", worktreePath, sha],
        cwd: repoRoot,
        context
    });
    if (addResult.exitCode !== 0) {
        throw new CliError({
            message: `Failed to materialize git ref '${ref}' (${sha}): ${addResult.stderr || addResult.stdout}`,
            code: CliError.Code.ConfigError
        });
    }

    const materialized: MaterializedGitRef = {
        ref,
        sha,
        absolutePathToRepoRoot: worktreePath,
        absolutePathToFernFolder: join(worktreePath, RelativeFilePath.of(fernFolderRelativeToRepoRoot))
    };
    materializedRefsBySha.set(cacheKey, materialized);
    return materialized;
}
