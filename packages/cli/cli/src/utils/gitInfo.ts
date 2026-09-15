import { assertNever } from "@fern-api/core-utils";
import { execFile } from "child_process";
import { promisify } from "util";

import { CISource } from "./environment.js";

const execFileAsync = promisify(execFile);

/** Provenance is best-effort: a slow or hung git must never hold up a deploy. */
const GIT_TIMEOUT_MS = 2000;

const COMMIT_SHA_REGEX = /^[0-9a-f]{40,64}$/;

export interface GitInfo {
    repoUrl: string;
    /** Omitted on a detached HEAD. */
    branch?: string;
    commitSha?: string;
}

/**
 * Detects the git repository, branch, and commit a deploy is made from, for
 * provenance. In CI the values come from the CI provider (via `ciSource`);
 * otherwise from the local checkout at `cwd`. `repoUrl` is always an http(s)
 * URL with no credentials. Returns undefined when nothing usable is found.
 * Never throws.
 */
export async function detectGitInfo({
    ciSource,
    cwd
}: {
    ciSource: CISource | undefined;
    cwd: string;
}): Promise<GitInfo | undefined> {
    if (ciSource != null) {
        const fromCI = gitInfoFromCISource(ciSource);
        if (fromCI != null) {
            return fromCI;
        }
    }
    return detectLocalGitInfo(cwd);
}

function gitInfoFromCISource(ciSource: CISource): GitInfo | undefined {
    const repoUrl = ciRepoUrl(ciSource);
    if (repoUrl == null) {
        return undefined;
    }
    return {
        repoUrl,
        ...(ciSource.branch != null && ciSource.branch.length > 0 ? { branch: ciSource.branch } : {}),
        ...(ciSource.commitSha != null && ciSource.commitSha.length > 0 ? { commitSha: ciSource.commitSha } : {})
    };
}

function ciRepoUrl(ciSource: CISource): string | undefined {
    const repo = ciSource.repo;
    if (repo == null || repo.length === 0) {
        return undefined;
    }
    switch (ciSource.type) {
        case "github":
            return joinServerUrl(process.env.GITHUB_SERVER_URL ?? "https://github.com", repo);
        case "gitlab":
            return joinServerUrl(process.env.CI_SERVER_URL ?? "https://gitlab.com", repo);
        case "bitbucket":
            return joinServerUrl("https://bitbucket.org", repo);
        default:
            assertNever(ciSource.type);
    }
}

function joinServerUrl(serverUrl: string, repo: string): string | undefined {
    return normalizeRemoteUrl(`${serverUrl.replace(/\/+$/, "")}/${repo.replace(/^\/+/, "")}`);
}

async function detectLocalGitInfo(cwd: string): Promise<GitInfo | undefined> {
    const remote = await runGit(["remote", "get-url", "origin"], cwd);
    if (remote == null) {
        return undefined;
    }
    const repoUrl = normalizeRemoteUrl(remote);
    if (repoUrl == null) {
        return undefined;
    }
    const [branch, commitSha] = await Promise.all([
        runGit(["rev-parse", "--abbrev-ref", "HEAD"], cwd),
        runGit(["rev-parse", "HEAD"], cwd)
    ]);
    return {
        repoUrl,
        // `HEAD` is what --abbrev-ref prints on a detached HEAD.
        ...(branch != null && branch !== "HEAD" ? { branch } : {}),
        ...(commitSha != null && COMMIT_SHA_REGEX.test(commitSha) ? { commitSha } : {})
    };
}

async function runGit(args: string[], cwd: string): Promise<string | undefined> {
    try {
        const { stdout } = await execFileAsync("git", args, {
            cwd,
            timeout: GIT_TIMEOUT_MS,
            encoding: "utf8",
            windowsHide: true
        });
        const value = stdout.trim();
        return value.length > 0 ? value : undefined;
    } catch {
        // No git binary, not a repository, no `origin` remote, or a timeout:
        // provenance is optional, so the deploy goes ahead without it.
        return undefined;
    }
}

/**
 * Turns a git remote into a credential-free `https://` repository URL:
 * `git@host:org/repo.git` and `ssh://git@host/org/repo.git` become
 * `https://host/org/repo`; `https://user:token@host/org/repo.git` loses the
 * userinfo and the `.git` suffix. Anything that is not http(s) or ssh (for
 * example `file://` or a bare path) yields undefined.
 */
export function normalizeRemoteUrl(remote: string): string | undefined {
    const trimmed = remote.trim();
    if (trimmed.length === 0) {
        return undefined;
    }

    if (!trimmed.includes("://")) {
        // scp-like syntax: [user@]host:path
        const scpMatch = /^(?:[^@\s]+@)?([^:\s/]+):([^\s]+)$/.exec(trimmed);
        if (scpMatch == null) {
            return undefined;
        }
        const [, host, repoPath] = scpMatch;
        if (host == null || repoPath == null) {
            return undefined;
        }
        // A one-letter "host" is a Windows drive letter (C:\repo), not a remote.
        if (/^[A-Za-z]$/.test(host) || repoPath.includes("\\")) {
            return undefined;
        }
        return buildHttpsUrl({ host, repoPath });
    }

    let parsed: URL;
    try {
        parsed = new URL(trimmed);
    } catch {
        return undefined;
    }
    switch (parsed.protocol) {
        case "http:":
        case "https:": {
            if (parsed.hostname.length === 0) {
                return undefined;
            }
            parsed.username = "";
            parsed.password = "";
            parsed.search = "";
            parsed.hash = "";
            return stripRepoSuffixes(parsed.toString());
        }
        case "ssh:":
        case "git+ssh:":
        case "ssh+git:": {
            if (parsed.hostname.length === 0) {
                return undefined;
            }
            return buildHttpsUrl({ host: parsed.hostname, repoPath: parsed.pathname });
        }
        default:
            return undefined;
    }
}

function buildHttpsUrl({ host, repoPath }: { host: string; repoPath: string }): string | undefined {
    const cleanPath = stripRepoSuffixes(repoPath.replace(/^\/+/, ""));
    if (cleanPath.length === 0) {
        return undefined;
    }
    return `https://${host}/${cleanPath}`;
}

function stripRepoSuffixes(value: string): string {
    return value.replace(/\/+$/, "").replace(/\.git$/, "");
}
