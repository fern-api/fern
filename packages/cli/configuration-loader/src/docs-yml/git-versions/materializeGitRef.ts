import { isCommitSha, isGitAvailable } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath, relative } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { CliError, TaskContext } from "@fern-api/task-context";
import tmp from "tmp-promise";

// Remove the materialized worktree temp dirs when the process exits. The dirs are cached
// for the lifetime of the publish (a ref may back several versions), so they cannot be
// cleaned eagerly; without this they accumulate across runs. The start-of-run
// `git worktree prune` then reaps the now-missing worktree registrations on the next run.
tmp.setGracefulCleanup();

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

async function worktreeContainsGitLfsPointers({
    worktreePath,
    ref,
    sha,
    context
}: {
    worktreePath: AbsoluteFilePath;
    ref: string;
    sha: string;
    context: TaskContext;
}): Promise<boolean> {
    const result = await runGit({
        args: ["grep", "-l", "-I", "-e", "^version https://git-lfs.github.com/spec/v1$", "--", "."],
        cwd: worktreePath,
        context
    });
    if (result.exitCode === 0) {
        return true;
    }
    if (result.exitCode === 1) {
        return false;
    }

    throw new CliError({
        message: `Failed to inspect git ref '${ref}' (${sha}) for Git LFS pointers: ${result.stderr || result.stdout}`,
        code: CliError.Code.ConfigError
    });
}

async function materializeGitLfsFiles({
    worktreePath,
    ref,
    sha,
    context
}: {
    worktreePath: AbsoluteFilePath;
    ref: string;
    sha: string;
    context: TaskContext;
}): Promise<void> {
    if (!(await worktreeContainsGitLfsPointers({ worktreePath, ref, sha, context }))) {
        return;
    }

    const remote = await getDefaultRemote({ repoRoot: worktreePath, context });
    const pullResult = await runGit({
        args: remote != null ? ["lfs", "pull", "--include=*", "--exclude=", remote] : ["lfs", "checkout"],
        cwd: worktreePath,
        context
    });
    if (pullResult.exitCode !== 0) {
        const output = pullResult.stderr || pullResult.stdout;
        const gitLfsUnavailable = output.includes("'lfs' is not a git command");
        throw new CliError({
            message: gitLfsUnavailable
                ? `Git LFS is required to materialize files for git ref '${ref}' (${sha}). Install Git LFS and retry.`
                : `Failed to materialize Git LFS files for git ref '${ref}' (${sha}): ${output}`,
            code: CliError.Code.ConfigError
        });
    }

    if (await worktreeContainsGitLfsPointers({ worktreePath, ref, sha, context })) {
        throw new CliError({
            message:
                `Git LFS files for git ref '${ref}' (${sha}) could not be materialized. ` +
                "Ensure the required LFS objects are available from the configured git remote.",
            code: CliError.Code.ConfigError
        });
    }
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
        // `--end-of-options` terminates option parsing so a ref beginning with `-` cannot be read as
        // a git flag. (Unlike `--`, it does not make git treat the following argument as a pathspec.)
        args: ["rev-parse", "--verify", "--quiet", "--end-of-options", `${ref}^{commit}`],
        cwd: repoRoot,
        context
    });
    if (result.exitCode !== 0 || result.stdout.length === 0) {
        return undefined;
    }
    return result.stdout;
}

/**
 * The candidate rev expressions to try when resolving a declared ref to a
 * commit, in priority order. A declared ref like `release/2.3` may exist only
 * as a remote-tracking branch (`origin/release/2.3`) after a normal clone —
 * git's bare-name resolution does not fall through to `refs/remotes/<remote>/*`,
 * so we try the remote-qualified form explicitly.
 */
function resolutionCandidates({ ref, remote }: { ref: string; remote: string | undefined }): string[] {
    return remote != null ? [ref, `${remote}/${ref}`] : [ref];
}

async function tryResolveCandidates({
    repoRoot,
    candidates,
    context
}: {
    repoRoot: string;
    candidates: string[];
    context: TaskContext;
}): Promise<string | undefined> {
    for (const candidate of candidates) {
        const sha = await tryResolveSha({ repoRoot, ref: candidate, context });
        if (sha != null) {
            return sha;
        }
    }
    return undefined;
}

/**
 * Attempts to fetch the history/tags needed to resolve `ref` and returns the
 * resolved commit SHA if successful. CI checkouts are frequently shallow and
 * tagless (`actions/checkout` defaults to depth 1 with no tags), and refs are
 * often absent entirely, so we backfill what is missing before giving up.
 */
async function attemptFetch({
    repoRoot,
    ref,
    remote,
    context
}: {
    repoRoot: string;
    ref: string;
    remote: string | undefined;
    context: TaskContext;
}): Promise<string | undefined> {
    if (remote == null) {
        return undefined;
    }

    const isShallowResult = await runGit({ args: ["rev-parse", "--is-shallow-repository"], cwd: repoRoot, context });
    const isShallow = isShallowResult.stdout === "true";

    // Targeted fetch of the specific ref (works for branches and tags). A
    // refspec-less fetch of an explicit ref updates FETCH_HEAD only (not
    // `refs/remotes/*`), so we resolve FETCH_HEAD directly rather than relying
    // on the bare ref name becoming resolvable. `--tags` is intentionally NOT
    // passed here so FETCH_HEAD holds a single, unambiguous entry.
    // `--end-of-options` terminates option parsing so a ref beginning with `-` cannot be read as a git flag.
    const targeted = await runGit({
        args: ["fetch", ...(isShallow ? ["--unshallow"] : []), remote, "--end-of-options", ref],
        cwd: repoRoot,
        context
    });
    if (targeted.exitCode === 0) {
        const sha = await tryResolveSha({ repoRoot, ref: "FETCH_HEAD", context });
        if (sha != null) {
            return sha;
        }
    }

    // The ref may be a bare SHA (which servers often refuse to fetch by name) or
    // a tag not yet present. A tag-inclusive fetch that uses the remote's
    // configured refspec surfaces tags and remote-tracking branches.
    await runGit({ args: ["fetch", "--tags", remote], cwd: repoRoot, context });
    return await tryResolveCandidates({ repoRoot, candidates: resolutionCandidates({ ref, remote }), context });
}

/**
 * Whether a declared ref is immutable (its commit never changes). Commit SHAs and
 * tags are immutable; branches move as commits are pushed. A tag that is not yet
 * present locally is treated as mutable — the only cost of that misclassification is
 * an eager fetch, and the fetch still resolves the (unchanging) tag correctly.
 */
async function refIsImmutable({
    repoRoot,
    ref,
    context
}: {
    repoRoot: string;
    ref: string;
    context: TaskContext;
}): Promise<boolean> {
    if (isCommitSha(ref)) {
        return true;
    }
    const asTag = await tryResolveSha({ repoRoot, ref: `refs/tags/${ref}`, context });
    return asTag != null;
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
    const remote = await getDefaultRemote({ repoRoot, context });

    // Resolve against everything already present locally: a local branch/tag/SHA
    // (`ref`) or an already-fetched remote-tracking branch (`<remote>/<ref>`).
    const resolveLocal = (): Promise<string | undefined> =>
        tryResolveCandidates({ repoRoot, candidates: resolutionCandidates({ ref, remote }), context });

    if (await refIsImmutable({ repoRoot, ref, context })) {
        // Immutable ref (tag or commit SHA): the commit never changes, so resolve from
        // what is already present and only touch the network if it is missing locally.
        const existing = await resolveLocal();
        if (existing != null) {
            return existing;
        }
        const afterFetch = await attemptFetch({ repoRoot, ref, remote, context });
        if (afterFetch != null) {
            return afterFetch;
        }
    } else {
        // Mutable ref (branch): fetch first so we build the branch's latest commit on
        // the remote rather than a stale local copy. Fall back to local when offline
        // or when there is no remote to fetch from.
        const afterFetch = await attemptFetch({ repoRoot, ref, remote, context });
        if (afterFetch != null) {
            return afterFetch;
        }
        const existing = await resolveLocal();
        if (existing != null) {
            return existing;
        }
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
    if (!isGitAvailable()) {
        throw new CliError({
            message:
                "Git is not installed or not found in PATH. " +
                "Git-ref-backed docs versions require git to be available.",
            code: CliError.Code.ConfigError
        });
    }

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

    const absolutePathToFernFolderAtRef = join(worktreePath, RelativeFilePath.of(fernFolderRelativeToRepoRoot));
    // The fern folder is assumed to occupy the same path relative to the repo root at any ref.
    // When it does not (the folder was moved or renamed since the ref), that assumption yields a
    // path that does not exist in the materialized tree; fail here with an actionable message
    // instead of letting a downstream `ENOENT` on docs.yml leak a temp path with no context.
    if (!(await doesPathExist(absolutePathToFernFolderAtRef, "directory"))) {
        throw new CliError({
            message:
                `Git ref '${ref}' (${sha}) does not contain a fern folder at '${fernFolderRelativeToRepoRoot}'. ` +
                "The fern folder appears to have moved or been renamed since that ref. " +
                "Git-ref-backed docs versions require the fern folder to occupy the same path at the ref as it does now.",
            code: CliError.Code.ConfigError
        });
    }

    await materializeGitLfsFiles({ worktreePath, ref, sha, context });

    const materialized: MaterializedGitRef = {
        ref,
        sha,
        absolutePathToRepoRoot: worktreePath,
        absolutePathToFernFolder: absolutePathToFernFolderAtRef
    };
    materializedRefsBySha.set(cacheKey, materialized);
    return materialized;
}
