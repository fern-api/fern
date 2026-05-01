import { execFileSync } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";
import tmp from "tmp-promise";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isTagMergedIntoHead } from "../replay/replay-run";

function gitExec(args: string[], cwd: string): string {
    return execFileSync("git", args, { cwd, encoding: "utf-8", stdio: "pipe" }).trim();
}

function initRepo(repoPath: string): void {
    gitExec(["init", "--initial-branch=main"], repoPath);
    gitExec(["config", "user.name", "Test User"], repoPath);
    gitExec(["config", "user.email", "test@example.com"], repoPath);
    gitExec(["config", "commit.gpgsign", "false"], repoPath);
}

function commit(repoPath: string, file: string, contents: string, message: string): string {
    writeFileSync(join(repoPath, file), contents);
    gitExec(["add", file], repoPath);
    gitExec(["commit", "-m", message], repoPath);
    return gitExec(["rev-parse", "HEAD"], repoPath);
}

describe("isTagMergedIntoHead", () => {
    let cleanup: () => Promise<void>;
    let repoPath: string;

    beforeEach(async () => {
        const tmpDir = await tmp.dir({ unsafeCleanup: true });
        repoPath = tmpDir.path;
        cleanup = tmpDir.cleanup;
        initRepo(repoPath);
    });

    afterEach(async () => {
        await cleanup();
    });

    it("returns true when the tag commit is an ancestor of HEAD (fast-forward merge)", () => {
        const firstSha = commit(repoPath, "a.txt", "one", "first");
        commit(repoPath, "b.txt", "two", "second");
        commit(repoPath, "c.txt", "three", "third");

        expect(isTagMergedIntoHead(repoPath, firstSha)).toBe(true);
    });

    it("returns true when the tag commit is on a dead branch but its tree matches a HEAD commit (squash merge)", () => {
        // initial state on main
        commit(repoPath, "a.txt", "one", "first");

        // feature branch with a specific tree
        gitExec(["checkout", "-b", "feature"], repoPath);
        const featureSha = commit(repoPath, "feature.txt", "feature-content", "feature work");
        const featureTree = gitExec(["rev-parse", `${featureSha}^{tree}`], repoPath);

        // simulate squash-merge: back on main, create a new commit with the same tree as feature.
        // commit-tree takes the tree directly — no working-tree/index manipulation needed.
        gitExec(["checkout", "main"], repoPath);
        const squashedSha = gitExec(
            ["commit-tree", featureTree, "-p", "HEAD", "-m", "squash merge of feature"],
            repoPath
        );
        gitExec(["update-ref", "HEAD", squashedSha], repoPath);
        gitExec(["reset", "--hard", "HEAD"], repoPath);

        // the original feature commit is NOT an ancestor of HEAD (squash flattened it),
        // but its tree matches the squashed commit's tree
        expect(isTagMergedIntoHead(repoPath, featureSha)).toBe(true);
    });

    it("returns false when the tag commit is orphaned (tree never merged into HEAD)", () => {
        const baseSha = commit(repoPath, "a.txt", "one", "first");
        commit(repoPath, "b.txt", "two", "second-on-main");

        // Build a synthetic orphan commit that mimics what createReplayBranch does:
        // a tree that was never merged, parented on the old base. This is the Frameio
        // reproduction.
        writeFileSync(join(repoPath, "orphan.txt"), "forward-projected");
        gitExec(["add", "orphan.txt"], repoPath);
        const tmpTree = gitExec(["write-tree"], repoPath);
        // revert the working tree so main's state is restored
        gitExec(["reset", "--hard", "HEAD"], repoPath);
        const orphanSha = gitExec(["commit-tree", tmpTree, "-p", baseSha, "-m", "orphan"], repoPath);

        expect(isTagMergedIntoHead(repoPath, orphanSha)).toBe(false);
    });

    it("returns false when the tag SHA does not exist", () => {
        commit(repoPath, "a.txt", "one", "first");
        expect(isTagMergedIntoHead(repoPath, "0000000000000000000000000000000000000000")).toBe(false);
    });
});
