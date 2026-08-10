import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { execFileSync } from "child_process";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join as pathJoin } from "path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { materializeGitRef } from "../git-versions/materializeGitRef.js";
import { resolveRefContentRoot } from "../git-versions/resolveRefContentRoot.js";

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

async function write(repo: string, relativePath: string, contents: string): Promise<void> {
    const absolute = pathJoin(repo, relativePath);
    await mkdir(pathJoin(absolute, ".."), { recursive: true });
    await writeFile(absolute, contents);
}

async function commitAll(repo: string, message: string): Promise<string> {
    git(repo, "add", "-A");
    git(repo, "commit", "-m", message);
    return git(repo, "rev-parse", "HEAD");
}

function fernFolder(repoRoot: string): AbsoluteFilePath {
    return join(AbsoluteFilePath.of(repoRoot), RelativeFilePath.of("fern"));
}

const DOCS_WITH_VERSION_PATH = "instances: []\nversions:\n  - display-name: old\n    path: ./versions/v2.yml\n";
const VERSION_FILE = "navigation:\n  - section: V2\n    contents:\n      - page: P2\n        path: ./pages/v2.mdx\n";
const DOCS_WITH_TOP_NAV =
    "instances: []\nnavigation:\n  - section: V1\n    contents:\n      - page: P1\n        path: ./pages/v1.mdx\n";
const DOCS_WITH_NEITHER = "instances: []\n";

/**
 * A single origin repository holding the historical refs that a real docs
 * project would declare (a patchable branch, a frozen lightweight tag, an
 * annotated tag, a content-less ref, plus known SHAs), and the "normal clone"
 * shape (`origin/*` tracking refs + tags, no local historical heads) that the
 * publish path actually resolves against.
 */
describe("git-ref versioning matrix", () => {
    let workdir: string;
    let origin: string;
    let clone: string;
    let branchSha: string;
    let lightTagSha: string;
    let annotatedTagSha: string;
    let mainSha: string;

    beforeAll(async () => {
        workdir = await mkdtemp(pathJoin(tmpdir(), "git-ref-matrix-"));
        origin = pathJoin(workdir, "origin");
        await mkdir(origin, { recursive: true });
        git(origin, "init", "-b", "main");

        await write(origin, "fern/docs.yml", "instances: []\n");
        mainSha = await commitAll(origin, "base main");

        // patchable branch → content root via versions[0].path
        git(origin, "checkout", "-b", "demo/release-2.0");
        await write(origin, "fern/docs.yml", DOCS_WITH_VERSION_PATH);
        await write(origin, "fern/versions/v2.yml", VERSION_FILE);
        await write(origin, "fern/pages/v2.mdx", "# v2\n");
        branchSha = await commitAll(origin, "branch 2.0 content");

        // frozen lightweight tag → content root via top-level navigation
        git(origin, "checkout", "main");
        git(origin, "checkout", "-b", "tmp-v1");
        await write(origin, "fern/docs.yml", DOCS_WITH_TOP_NAV);
        await write(origin, "fern/pages/v1.mdx", "# v1\n");
        lightTagSha = await commitAll(origin, "v1 content");
        git(origin, "tag", "demo-v1.0.0");

        // annotated tag → same shape, different commit
        await write(origin, "fern/pages/v1.mdx", "# v1.5\n");
        annotatedTagSha = await commitAll(origin, "v1.5 content");
        git(origin, "tag", "-a", "demo-v1.5.0", "-m", "annotated 1.5");

        // content-less ref
        await write(origin, "fern/docs.yml", DOCS_WITH_NEITHER);
        await commitAll(origin, "no content root");
        git(origin, "tag", "demo-nocontent");

        git(origin, "checkout", "main");

        // a normal `git clone`: origin/* tracking refs + tags, no local historical heads
        clone = pathJoin(workdir, "clone");
        git(workdir, "clone", origin, clone);
        git(clone, "checkout", "main");
    });

    afterAll(async () => {
        await rm(workdir, { recursive: true, force: true });
    });

    // ---- ref resolution ------------------------------------------------------

    it("[tag] resolves a lightweight tag", async () => {
        const m = await materializeGitRef({ ref: "demo-v1.0.0", absolutePathToFernFolder: fernFolder(clone), context });
        expect(m.sha).toBe(lightTagSha);
    });

    it("[annotated tag] resolves to the pointed-at commit", async () => {
        const m = await materializeGitRef({ ref: "demo-v1.5.0", absolutePathToFernFolder: fernFolder(clone), context });
        expect(m.sha).toBe(annotatedTagSha);
    });

    it("[remote-only branch] resolves via origin/<ref>", async () => {
        const m = await materializeGitRef({
            ref: "demo/release-2.0",
            absolutePathToFernFolder: fernFolder(clone),
            context
        });
        expect(m.sha).toBe(branchSha);
    });

    it("[local branch] resolves a locally-present branch head", async () => {
        git(clone, "branch", "-f", "local-2.0", branchSha);
        const m = await materializeGitRef({ ref: "local-2.0", absolutePathToFernFolder: fernFolder(clone), context });
        expect(m.sha).toBe(branchSha);
    });

    it("[full SHA] resolves a 40-char commit SHA", async () => {
        const m = await materializeGitRef({ ref: branchSha, absolutePathToFernFolder: fernFolder(clone), context });
        expect(m.sha).toBe(branchSha);
    });

    it("[short SHA] resolves an abbreviated commit SHA", async () => {
        const m = await materializeGitRef({
            ref: branchSha.slice(0, 10),
            absolutePathToFernFolder: fernFolder(clone),
            context
        });
        expect(m.sha).toBe(branchSha);
    });

    it("[nonexistent ref] throws the actionable CI-oriented error", async () => {
        await expect(
            materializeGitRef({ ref: "demo/does-not-exist", absolutePathToFernFolder: fernFolder(clone), context })
        ).rejects.toThrow("Failed to resolve git ref 'demo/does-not-exist'");
    });

    it("[ref starting with '-'] is not misread as a git flag", async () => {
        // The value is passed after `--end-of-options`, so it must produce the
        // ordinary unresolved-ref error rather than a git usage/flag error.
        await expect(
            materializeGitRef({ ref: "--all", absolutePathToFernFolder: fernFolder(clone), context })
        ).rejects.toThrow("Failed to resolve git ref '--all'");
    });

    // ---- shallow / tagless fetch backfill ------------------------------------

    it("[shallow clone] backfills history to resolve a tag", async () => {
        const shallow = pathJoin(workdir, "shallow");
        git(workdir, "clone", "--depth", "1", "--no-tags", "file://" + origin, shallow);
        git(shallow, "checkout", "main");
        expect(git(shallow, "rev-parse", "--is-shallow-repository")).toBe("true");
        const m = await materializeGitRef({
            ref: "demo-v1.0.0",
            absolutePathToFernFolder: fernFolder(shallow),
            context
        });
        expect(m.sha).toBe(lightTagSha);
    });

    it("[tagless checkout] backfills tags to resolve a tag", async () => {
        const notags = pathJoin(workdir, "notags");
        git(workdir, "clone", "--no-tags", "file://" + origin, notags);
        git(notags, "checkout", "main");
        const m = await materializeGitRef({
            ref: "demo-v1.5.0",
            absolutePathToFernFolder: fernFolder(notags),
            context
        });
        expect(m.sha).toBe(annotatedTagSha);
    });

    // ---- mutability ----------------------------------------------------------

    it("[mutable branch] picks up the new remote tip, not a stale local copy", async () => {
        const mut = pathJoin(workdir, "mutable");
        git(workdir, "clone", "file://" + origin, mut);
        git(mut, "checkout", "main");

        const first = await materializeGitRef({
            ref: "demo/release-2.0",
            absolutePathToFernFolder: fernFolder(mut),
            context
        });
        expect(first.sha).toBe(branchSha);

        // advance the branch on the origin after the first build
        git(origin, "checkout", "demo/release-2.0");
        await write(origin, "fern/pages/v2.mdx", "# v2 patched\n");
        const advancedSha = await commitAll(origin, "patch 2.0");
        git(origin, "checkout", "main");

        const second = await materializeGitRef({
            ref: "demo/release-2.0",
            absolutePathToFernFolder: fernFolder(mut),
            context
        });
        expect(second.sha).toBe(advancedSha);
        expect(second.sha).not.toBe(first.sha);
    });

    // ---- caching -------------------------------------------------------------

    it("[caching] the same SHA is materialized only once per process", async () => {
        const a = await materializeGitRef({ ref: "demo-v1.0.0", absolutePathToFernFolder: fernFolder(clone), context });
        const worktreesAfterFirst = git(clone, "worktree", "list").split("\n").length;
        const b = await materializeGitRef({ ref: "demo-v1.0.0", absolutePathToFernFolder: fernFolder(clone), context });
        const worktreesAfterSecond = git(clone, "worktree", "list").split("\n").length;
        expect(b.absolutePathToRepoRoot).toBe(a.absolutePathToRepoRoot);
        expect(worktreesAfterSecond).toBe(worktreesAfterFirst);
    });

    // ---- environment ---------------------------------------------------------

    it("[not a git repo] throws a clear config error", async () => {
        const notGit = pathJoin(workdir, "not-git");
        await mkdir(pathJoin(notGit, "fern"), { recursive: true });
        await expect(
            materializeGitRef({ ref: "demo-v1.0.0", absolutePathToFernFolder: fernFolder(notGit), context })
        ).rejects.toThrow("not inside a git repository");
    });

    it("[offline branch] falls back to the local branch head when there is no remote", async () => {
        const offline = pathJoin(workdir, "offline");
        git(workdir, "clone", "file://" + origin, offline);
        git(offline, "checkout", "main");
        git(offline, "branch", "-f", "offline-2.0", branchSha);
        git(offline, "remote", "remove", "origin");
        const m = await materializeGitRef({
            ref: "offline-2.0",
            absolutePathToFernFolder: fernFolder(offline),
            context
        });
        expect(m.sha).toBe(branchSha);
    });

    it("[git absent] throws a clear error when git is not on PATH", async () => {
        const savedPath = process.env.PATH;
        process.env.PATH = pathJoin(workdir, "empty-bin");
        try {
            await expect(
                materializeGitRef({ ref: "demo-v1.0.0", absolutePathToFernFolder: fernFolder(clone), context })
            ).rejects.toThrow("Git is not installed or not found in PATH");
        } finally {
            process.env.PATH = savedPath;
        }
    });

    // ---- content root --------------------------------------------------------

    it("[content root: versions[0].path] selects the ref's default version file", async () => {
        const m = await materializeGitRef({
            ref: "demo/release-2.0",
            absolutePathToFernFolder: fernFolder(clone),
            context
        });
        const root = await resolveRefContentRoot({ materialized: m, context });
        expect(root.absoluteFilepathToConfig.endsWith("versions/v2.yml")).toBe(true);
        expect(root.navigation).toBeDefined();
    });

    it("[content root: top-level navigation] selects docs.yml navigation", async () => {
        const m = await materializeGitRef({ ref: "demo-v1.0.0", absolutePathToFernFolder: fernFolder(clone), context });
        const root = await resolveRefContentRoot({ materialized: m, context });
        expect(root.absoluteFilepathToConfig.endsWith("docs.yml")).toBe(true);
        expect(root.navigation).toBeDefined();
    });

    it("[content root: neither] throws an actionable error naming the ref", async () => {
        const m = await materializeGitRef({
            ref: "demo-nocontent",
            absolutePathToFernFolder: fernFolder(clone),
            context
        });
        await expect(resolveRefContentRoot({ materialized: m, context })).rejects.toThrow(
            "Could not determine the content root for git ref 'demo-nocontent'"
        );
    });
});

/**
 * The highest-risk real-world case: the fern folder sits at a different path
 * now than it did at an older ref. `materializeGitRef` computes the fern folder
 * path relative to the *current* repo root and re-joins it onto the materialized
 * worktree, so a moved folder points at a path that does not exist at the ref.
 */
describe("git-ref versioning: fern folder moved between commits", () => {
    let workdir: string;
    let origin: string;
    let clone: string;

    beforeAll(async () => {
        workdir = await mkdtemp(pathJoin(tmpdir(), "git-ref-moved-"));
        origin = pathJoin(workdir, "origin");
        await mkdir(origin, { recursive: true });
        git(origin, "init", "-b", "main");

        // old layout: fern folder lived under config/fern
        await write(origin, "config/fern/docs.yml", DOCS_WITH_TOP_NAV);
        await write(origin, "config/fern/pages/v1.mdx", "# v1\n");
        await commitAll(origin, "old layout");
        git(origin, "tag", "demo-oldlayout");

        // new layout: fern folder moved to repo root
        git(origin, "rm", "-r", "config/fern");
        await write(origin, "fern/docs.yml", "instances: []\n");
        await commitAll(origin, "moved fern to root");

        clone = pathJoin(workdir, "clone");
        git(workdir, "clone", "file://" + origin, clone);
        git(clone, "checkout", "main");
    });

    afterAll(async () => {
        await rm(workdir, { recursive: true, force: true });
    });

    it("fails with an actionable error naming the ref and the missing fern folder", async () => {
        // The worktree is checked out at the old SHA, but the fern folder path is
        // derived from the *current* layout, so it points at a nonexistent dir.
        // materializeGitRef must detect this and fail clearly rather than letting a
        // downstream ENOENT on docs.yml leak a temp path with no context.
        await expect(
            materializeGitRef({ ref: "demo-oldlayout", absolutePathToFernFolder: fernFolder(clone), context })
        ).rejects.toThrow("does not contain a fern folder at 'fern'");
    });
});
