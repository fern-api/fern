import { execFileSync } from "child_process";
import path from "path";

/**
 * Where a `fern generate` ran, sent with each sdk-gen-api build so the dashboard can say who
 * generated a version, from which CI run, and keep the SDK's Fern repository current. It
 * describes the build and is never written into generated files nor part of its idempotency key.
 */
export interface FernSdkGenApiProvenance {
    git?: {
        host?: string;
        owner: string;
        repo: string;
        branch?: string;
        commit?: string;
        dirty?: boolean;
        fernDirectory?: string;
        generatorsYmlPath?: string;
    };
    ci?: { source: string; runUrl?: string };
    invokedBy?: string;
}

const GIT_TIMEOUT_MS = 2_000;
const MAX_FIELD_LENGTH = 255;

/** `git@github.com:acme/fern-config.git`, `https://github.com/acme/fern-config(.git)`, `ssh://git@host/acme/x`. */
export function parseGitRemoteUrl(url: string): { host: string; owner: string; repo: string } | undefined {
    const trimmed = url.trim();
    const scp = trimmed.match(/^[\w.-]+@([\w.-]+):([^/]+)\/(.+?)(?:\.git)?\/?$/);
    if (scp != null) {
        return { host: scp[1] ?? "", owner: scp[2] ?? "", repo: scp[3] ?? "" };
    }
    try {
        const parsed = new URL(trimmed);
        const [owner, ...rest] = parsed.pathname.replace(/^\/+/, "").replace(/\/+$/, "").split("/");
        const repo = rest.join("/").replace(/\.git$/, "");
        if (!owner || !repo) {
            return undefined;
        }
        return { host: parsed.hostname, owner, repo };
    } catch {
        // Not a URL: a remote this cannot read (a local path, say) names no repository.
        return undefined;
    }
}

/** The CI system a run is in, its run link, and its actor, from the environment the CI sets. */
export function detectSdkGenApiCi(
    env: NodeJS.ProcessEnv
): { source: string; runUrl?: string; actor?: string } | undefined {
    if (env.GITHUB_ACTIONS === "true") {
        const runUrl =
            env.GITHUB_SERVER_URL && env.GITHUB_REPOSITORY && env.GITHUB_RUN_ID
                ? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`
                : undefined;
        return withOptional({ source: "github" }, { runUrl, actor: env.GITHUB_ACTOR });
    }
    if (env.GITLAB_CI === "true") {
        return withOptional({ source: "gitlab" }, { runUrl: env.CI_PIPELINE_URL, actor: env.GITLAB_USER_LOGIN });
    }
    if (env.CIRCLECI === "true") {
        return withOptional({ source: "circleci" }, { runUrl: env.CIRCLE_BUILD_URL, actor: env.CIRCLE_USERNAME });
    }
    if (env.BUILDKITE === "true") {
        return withOptional(
            { source: "buildkite" },
            { runUrl: env.BUILDKITE_BUILD_URL, actor: env.BUILDKITE_BUILD_CREATOR }
        );
    }
    if (env.JENKINS_URL != null) {
        return withOptional({ source: "jenkins" }, { runUrl: env.BUILD_URL });
    }
    if (env.CI === "true" || env.CI === "1") {
        return { source: "other" };
    }
    return undefined;
}

let cached: { key: string; value: FernSdkGenApiProvenance | undefined } | undefined;

/**
 * Reads the provenance of this run once per Fern project: the Git repository holding it (origin's
 * host, owner and name, the branch, the commit, whether the tree had changes), where its `fern/`
 * folder and generators.yml sit in it, and the CI run with its actor. Best-effort and quiet:
 * outside a Git repository, or when git is missing, it says what it can.
 */
export function detectSdkGenApiProvenance({
    absolutePathToFernDirectory,
    absolutePathToGeneratorsYml,
    env = process.env
}: {
    absolutePathToFernDirectory: string;
    absolutePathToGeneratorsYml?: string;
    env?: NodeJS.ProcessEnv;
}): FernSdkGenApiProvenance | undefined {
    const key = `${absolutePathToFernDirectory}\u0000${absolutePathToGeneratorsYml ?? ""}`;
    if (cached?.key === key) {
        return cached.value;
    }
    const ci = detectSdkGenApiCi(env);
    const git = readGitSafely(absolutePathToFernDirectory, absolutePathToGeneratorsYml, env);
    const value: FernSdkGenApiProvenance | undefined =
        git == null && ci == null
            ? undefined
            : {
                  ...(git != null ? { git } : {}),
                  ...(ci != null ? { ci: withOptional({ source: ci.source }, { runUrl: ci.runUrl }) } : {}),
                  ...(ci?.actor != null ? { invokedBy: bounded(ci.actor) } : {})
              };
    cached = { key, value };
    return value;
}

/** `readGit`, never throwing: provenance must not fail a generation. */
function readGitSafely(
    absolutePathToFernDirectory: string | undefined,
    absolutePathToGeneratorsYml: string | undefined,
    env: NodeJS.ProcessEnv
): FernSdkGenApiProvenance["git"] | undefined {
    if (typeof absolutePathToFernDirectory !== "string" || absolutePathToFernDirectory.length === 0) {
        return undefined;
    }
    try {
        return readGit(absolutePathToFernDirectory, absolutePathToGeneratorsYml, env);
    } catch (error) {
        // A path or git output this cannot read: say nothing of the repository rather than fail.
        void error;
        return undefined;
    }
}

function readGit(
    absolutePathToFernDirectory: string,
    absolutePathToGeneratorsYml: string | undefined,
    env: NodeJS.ProcessEnv
): FernSdkGenApiProvenance["git"] | undefined {
    const root = git(absolutePathToFernDirectory, ["rev-parse", "--show-toplevel"]);
    const remote = git(absolutePathToFernDirectory, ["remote", "get-url", "origin"]);
    const parsed = remote != null ? parseGitRemoteUrl(remote) : undefined;
    if (root == null || parsed == null) {
        return undefined;
    }
    // A detached HEAD in CI names no branch; the CI says which ref it checked out.
    const head = git(absolutePathToFernDirectory, ["rev-parse", "--abbrev-ref", "HEAD"]);
    const branch = head != null && head !== "HEAD" ? head : env.GITHUB_HEAD_REF || env.GITHUB_REF_NAME || undefined;
    const commit = git(absolutePathToFernDirectory, ["rev-parse", "HEAD"]);
    const status = git(absolutePathToFernDirectory, ["status", "--porcelain"]);
    return withOptional(
        { host: parsed.host, owner: bounded(parsed.owner), repo: bounded(parsed.repo) },
        {
            branch: branch != null ? bounded(branch) : undefined,
            commit: commit != null && /^[0-9a-f]{7,64}$/i.test(commit) ? commit : undefined,
            dirty: status != null ? status.length > 0 : undefined,
            fernDirectory: relativePath(root, absolutePathToFernDirectory),
            generatorsYmlPath:
                typeof absolutePathToGeneratorsYml === "string"
                    ? relativePath(root, absolutePathToGeneratorsYml)
                    : undefined
        }
    );
}

function git(cwd: string, args: string[]): string | undefined {
    try {
        const output = execFileSync("git", args, {
            cwd,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
            timeout: GIT_TIMEOUT_MS
        }).trim();
        return output.length > 0 || args[0] === "status" ? output : undefined;
    } catch {
        // Outside a Git repository, without git, or past the timeout: provenance is best-effort.
        return undefined;
    }
}

function relativePath(root: string, absolutePath: string): string | undefined {
    const relative = path.relative(root, absolutePath).split(path.sep).join("/");
    return relative.startsWith("..") ? undefined : relative.length > 0 ? relative : ".";
}

function bounded(value: string): string {
    return value.slice(0, MAX_FIELD_LENGTH);
}

/** `base` with each of `optional`'s fields that has a value; an empty string counts as none. */
function withOptional<T extends object, U extends Record<string, string | boolean | undefined>>(
    base: T,
    optional: U
): T & Partial<U> {
    const defined: Partial<U> = {};
    for (const name of Object.keys(optional) as Array<keyof U>) {
        const value = optional[name];
        if (value !== undefined && value !== "") {
            defined[name] = value;
        }
    }
    return { ...base, ...defined };
}

/** For tests: forget the provenance read for this process. */
export function resetSdkGenApiProvenanceCache(): void {
    cached = undefined;
}
