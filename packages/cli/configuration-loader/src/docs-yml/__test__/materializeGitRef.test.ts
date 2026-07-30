import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { execFileSync } from "child_process";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join as pathJoin } from "path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { materializeGitRef } from "../git-versions/materializeGitRef.js";

const context = createMockTaskContext();

function git(cwd: string, ...args: string[]): string {
    return execFileSync("git", args, {
        cwd,
        encoding: "utf-8",
        env: {
            ...process.env,
            GIT_AUTHOR_NAME: "test",
            GIT_AUTHOR_EMAIL: "test@example.com",
            GIT_COMMITTER_NAME: "test",
            GIT_COMMITTER_EMAIL: "test@example.com"
        }
    }).trim();
}

async function commitFile(repo: string, relativePath: string, contents: string, message: string): Promise<string> {
    const absolute = pathJoin(repo, relativePath);
    await mkdir(pathJoin(absolute, ".."), { recursive: true });
    await writeFile(absolute, contents);
    git(repo, "add", "-A");
    git(repo, "commit", "-m", message);
    return git(repo, "rev-parse", "HEAD");
}

/**
 * Exercises the real git resolution path against a clone whose historical refs
 * exist only as remote-tracking branches / tags — the shape a normal `git clone`
 * produces. This guards against the regression where a bare ref name
 * (`release/2.3`) failed to resolve because git does not fall through to
 * `refs/remotes/<remote>/release/2.3`.
 */
describe("materializeGitRef", () => {
    let workdir: string;
    let clone: string;
    let branchSha: string;
    let tagSha: string;

    beforeAll(async () => {
        workdir = await mkdtemp(pathJoin(tmpdir(), "materialize-git-ref-"));
        const origin = pathJoin(workdir, "origin");
        await mkdir(origin, { recursive: true });
        git(origin, "init", "-b", "main");

        // main / default version content
        await commitFile(origin, "fern/docs.yml", "instances: []\n", "base");

        // historical branch, checked out then left behind on main
        git(origin, "checkout", "-b", "release/2.3");
        branchSha = await commitFile(origin, "fern/versions/v2-3.yml", "navigation: []\n", "2.3 content");

        // historical tag
        git(origin, "checkout", "main");
        tagSha = git(origin, "rev-parse", "HEAD");
        git(origin, "tag", "v2.2.0");

        // a normal clone: local `main` head plus `origin/*` tracking refs and tags,
        // but no local `release/2.3` head.
        clone = pathJoin(workdir, "clone");
        git(workdir, "clone", origin, clone);
        git(clone, "checkout", "main");
    });

    afterAll(async () => {
        await rm(workdir, { recursive: true, force: true });
    });

    it("resolves a ref present only as a remote-tracking branch", async () => {
        const materialized = await materializeGitRef({
            ref: "release/2.3",
            absolutePathToFernFolder: join(AbsoluteFilePath.of(clone), RelativeFilePath.of("fern")),
            context
        });
        expect(materialized.sha).toBe(branchSha);
        expect(materialized.ref).toBe("release/2.3");
    });

    it("resolves a tag", async () => {
        const materialized = await materializeGitRef({
            ref: "v2.2.0",
            absolutePathToFernFolder: join(AbsoluteFilePath.of(clone), RelativeFilePath.of("fern")),
            context
        });
        expect(materialized.sha).toBe(tagSha);
    });

    it("throws an actionable error when the ref cannot be resolved", async () => {
        await expect(
            materializeGitRef({
                ref: "release/9.9",
                absolutePathToFernFolder: join(AbsoluteFilePath.of(clone), RelativeFilePath.of("fern")),
                context
            })
        ).rejects.toThrow("Failed to resolve git ref 'release/9.9'");
    });
});
