import { execFile } from "child_process";
import { chmod, mkdtemp, rm, writeFile } from "fs/promises";
import { devNull, tmpdir } from "os";
import path from "path";
import { promisify } from "util";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { detectGitInfo, normalizeRemoteUrl } from "../gitInfo.js";

const execFileAsync = promisify(execFile);

const isWindows = process.platform === "win32";

const tempDirs: string[] = [];

async function makeTempDir(prefix: string): Promise<string> {
    const dir = await mkdtemp(path.join(tmpdir(), prefix));
    tempDirs.push(dir);
    return dir;
}

async function git(cwd: string, ...args: string[]): Promise<string> {
    const { stdout } = await execFileAsync("git", args, { cwd, encoding: "utf8" });
    return stdout.trim();
}

/** A fresh repository on `main` with one commit and the given `origin`. */
async function createRepo(remote: string): Promise<{ dir: string; commitSha: string }> {
    const dir = await makeTempDir("fern-git-info-repo-");
    await git(dir, "init", "--quiet");
    await git(dir, "symbolic-ref", "HEAD", "refs/heads/main");
    await git(dir, "remote", "add", "origin", remote);
    await git(
        dir,
        "-c",
        "user.name=Fern Test",
        "-c",
        "user.email=test@example.com",
        "-c",
        "commit.gpgsign=false",
        "commit",
        "--quiet",
        "--allow-empty",
        "-m",
        "init"
    );
    return { dir, commitSha: await git(dir, "rev-parse", "HEAD") };
}

/** A directory whose only `git` is the given shell script; used as the whole PATH. */
async function createFakeGit(script: string): Promise<string> {
    const binDir = await makeTempDir("fern-git-info-bin-");
    const gitPath = path.join(binDir, "git");
    await writeFile(gitPath, `#!/bin/sh\n${script}\n`);
    await chmod(gitPath, 0o755);
    return binDir;
}

describe("detectGitInfo", () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        originalEnv = { ...process.env };
        // The machine's ~/.gitconfig (url.insteadOf rewrites, defaultBranch) must not leak in.
        process.env.GIT_CONFIG_GLOBAL = devNull;
        process.env.GIT_CONFIG_NOSYSTEM = "1";
        delete process.env.GITHUB_SERVER_URL;
        delete process.env.CI_SERVER_URL;
    });

    afterEach(async () => {
        process.env = originalEnv;
        await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
    });

    describe("from the local checkout", () => {
        it("normalizes an SSH remote to https and reports the branch and commit", async () => {
            const { dir, commitSha } = await createRepo("git@github.com:acme/api.git");

            await expect(detectGitInfo({ ciSource: undefined, cwd: dir })).resolves.toEqual({
                repoUrl: "https://github.com/acme/api",
                branch: "main",
                commitSha
            });
        });

        it("strips credentials and the .git suffix from an https remote", async () => {
            const { dir, commitSha } = await createRepo("https://alice:s3cret-token@github.com/acme/api.git");

            const result = await detectGitInfo({ ciSource: undefined, cwd: dir });

            expect(result).toEqual({ repoUrl: "https://github.com/acme/api", branch: "main", commitSha });
            expect(JSON.stringify(result)).not.toContain("s3cret-token");
        });

        it("omits the branch on a detached HEAD", async () => {
            const { dir, commitSha } = await createRepo("git@github.com:acme/api.git");
            await git(dir, "checkout", "--quiet", "--detach");

            const result = await detectGitInfo({ ciSource: undefined, cwd: dir });

            expect(result).toEqual({ repoUrl: "https://github.com/acme/api", commitSha });
            expect(result).not.toHaveProperty("branch");
        });

        it("returns undefined for a remote that is not http(s) or ssh", async () => {
            const { dir } = await createRepo("/srv/git/api.git");

            await expect(detectGitInfo({ ciSource: undefined, cwd: dir })).resolves.toBeUndefined();
        });

        it("returns undefined outside a repository", async () => {
            const dir = await makeTempDir("fern-git-info-plain-");

            await expect(detectGitInfo({ ciSource: undefined, cwd: dir })).resolves.toBeUndefined();
        });

        it.skipIf(isWindows)("returns undefined when git is not installed", async () => {
            const { dir } = await createRepo("git@github.com:acme/api.git");
            process.env.PATH = await makeTempDir("fern-git-info-empty-path-");

            await expect(detectGitInfo({ ciSource: undefined, cwd: dir })).resolves.toBeUndefined();
        });

        it.skipIf(isWindows)(
            "returns undefined when git hangs past the timeout",
            async () => {
                const { dir } = await createRepo("git@github.com:acme/api.git");
                process.env.PATH = `${await createFakeGit("sleep 30")}${path.delimiter}${process.env.PATH ?? ""}`;

                const startedAt = Date.now();
                await expect(detectGitInfo({ ciSource: undefined, cwd: dir })).resolves.toBeUndefined();
                const elapsed = Date.now() - startedAt;
                // Proves the 2s timeout fired (the script would otherwise run for 30s).
                expect(elapsed).toBeGreaterThanOrEqual(1_000);
                expect(elapsed).toBeLessThan(10_000);
            },
            15_000
        );

        it.skipIf(isWindows)("returns undefined when git exits with an error", async () => {
            const { dir } = await createRepo("git@github.com:acme/api.git");
            process.env.PATH = `${await createFakeGit("echo 'fatal: broken' >&2; exit 128")}${path.delimiter}${process.env.PATH ?? ""}`;

            await expect(detectGitInfo({ ciSource: undefined, cwd: dir })).resolves.toBeUndefined();
        });
    });

    describe("from CI", () => {
        it("uses the GitHub Enterprise server URL", async () => {
            process.env.GITHUB_SERVER_URL = "https://ghe.example.com/";
            const dir = await makeTempDir("fern-git-info-ci-");

            await expect(
                detectGitInfo({
                    ciSource: { type: "github", repo: "acme/api", branch: "release", commitSha: "c".repeat(40) },
                    cwd: dir
                })
            ).resolves.toEqual({
                repoUrl: "https://ghe.example.com/acme/api",
                branch: "release",
                commitSha: "c".repeat(40)
            });
        });

        it("defaults to github.com, gitlab.com, and bitbucket.org", async () => {
            const dir = await makeTempDir("fern-git-info-ci-");

            await expect(detectGitInfo({ ciSource: { type: "github", repo: "acme/api" }, cwd: dir })).resolves.toEqual({
                repoUrl: "https://github.com/acme/api"
            });
            await expect(
                detectGitInfo({ ciSource: { type: "gitlab", repo: "group/sub/api" }, cwd: dir })
            ).resolves.toEqual({ repoUrl: "https://gitlab.com/group/sub/api" });
            await expect(
                detectGitInfo({ ciSource: { type: "bitbucket", repo: "acme/api" }, cwd: dir })
            ).resolves.toEqual({ repoUrl: "https://bitbucket.org/acme/api" });
        });

        it("uses a self-hosted GitLab server URL", async () => {
            process.env.CI_SERVER_URL = "https://gitlab.example.com";
            const dir = await makeTempDir("fern-git-info-ci-");

            await expect(
                detectGitInfo({ ciSource: { type: "gitlab", repo: "acme/api", branch: "main" }, cwd: dir })
            ).resolves.toEqual({ repoUrl: "https://gitlab.example.com/acme/api", branch: "main" });
        });

        it("falls back to the local checkout when CI reports no repository", async () => {
            const { dir, commitSha } = await createRepo("git@github.com:acme/api.git");

            await expect(detectGitInfo({ ciSource: { type: "github" }, cwd: dir })).resolves.toEqual({
                repoUrl: "https://github.com/acme/api",
                branch: "main",
                commitSha
            });
        });
    });
});

describe("normalizeRemoteUrl", () => {
    it.each([
        ["git@github.com:acme/api.git", "https://github.com/acme/api"],
        ["git@github.com:acme/api", "https://github.com/acme/api"],
        ["deploy@gitserver:tools/api.git", "https://gitserver/tools/api"],
        ["ssh://git@github.com/acme/api.git", "https://github.com/acme/api"],
        ["ssh://git@ssh.github.com:443/acme/api.git", "https://ssh.github.com/acme/api"],
        ["git+ssh://git@gitlab.com/group/sub/api.git", "https://gitlab.com/group/sub/api"],
        ["https://github.com/acme/api", "https://github.com/acme/api"],
        ["https://github.com/acme/api.git/", "https://github.com/acme/api"],
        ["https://alice:token@github.com/acme/api.git", "https://github.com/acme/api"],
        ["https://x-access-token:ghs_abc@github.com/acme/api", "https://github.com/acme/api"],
        ["https://ghe.example.com:8443/acme/api.git", "https://ghe.example.com:8443/acme/api"],
        ["http://gitea.local/acme/api.git", "http://gitea.local/acme/api"],
        ["  git@github.com:acme/api.git\n", "https://github.com/acme/api"]
    ])("normalizes %s", (remote, expected) => {
        expect(normalizeRemoteUrl(remote)).toBe(expected);
    });

    it.each([
        [""],
        ["/srv/git/api.git"],
        ["../api"],
        ["C:\\repos\\api"],
        ["file:///srv/git/api.git"],
        ["git://github.com/acme/api.git"],
        ["https://"],
        ["not a url"]
    ])("rejects %s", (remote) => {
        expect(normalizeRemoteUrl(remote)).toBeUndefined();
    });
});
