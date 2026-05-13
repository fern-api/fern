import { ClonedRepository } from "@fern-api/github";
import { execFileSync } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";
import tmp from "tmp-promise";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createReplayBranch } from "../pipeline/github/createReplayBranch";
import type { PipelineLogger } from "../pipeline/PipelineLogger";

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

function makeLogger(): { logger: PipelineLogger; warnings: string[] } {
    const warnings: string[] = [];
    const logger: PipelineLogger = {
        debug: () => undefined,
        info: () => undefined,
        warn: (msg) => {
            warnings.push(msg);
        },
        error: () => undefined
    };
    return { logger, warnings };
}

describe("createReplayBranch", () => {
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

    it("returns a tag commit SHA whose tree matches the current generation and whose parent is the previous generation", async () => {
        // Two real commits in the local clone — simulating the normal case where the prior
        // fern-bot branch is still alive (no squash + delete yet).
        const previousGenerationSha = commit(repoPath, "sdk.ts", "old generated", "previous generation");
        const currentGenerationSha = commit(repoPath, "sdk.ts", "new generated", "current generation");
        const currentTreeHash = gitExec(["rev-parse", `${currentGenerationSha}^{tree}`], repoPath);

        const repository = ClonedRepository.createAtPath(repoPath);
        const { logger } = makeLogger();

        const tagCommitSha = await createReplayBranch(
            repository,
            "fern-bot/test-branch",
            "Update SDK",
            { previousGenerationSha, currentGenerationSha },
            logger
        );

        expect(tagCommitSha).toBeTypeOf("string");
        const tagTree = gitExec(["rev-parse", `${tagCommitSha}^{tree}`], repoPath);
        const tagParent = gitExec(["rev-parse", `${tagCommitSha}^`], repoPath);
        expect(tagTree).toBe(currentTreeHash);
        expect(tagParent).toBe(previousGenerationSha);
        // Branch was still checked out from HEAD for the PR push path.
        const currentBranch = gitExec(["rev-parse", "--abbrev-ref", "HEAD"], repoPath);
        expect(currentBranch).toBe("fern-bot/test-branch");
    });

    it("returns undefined and does not throw when previousGenerationSha is unreachable", async () => {
        // HEAD is the current generation; create one real commit.
        const currentGenerationSha = commit(repoPath, "sdk.ts", "generated", "first generation");

        // previousGenerationSha mimics the auth0-python case: lockfile points at a SHA
        // whose source branch was squash-merged + deleted, so it's not in this clone's object DB.
        const unreachableSha = "b61c6fa84f61d6c77d9f4ab0fa6c2bf512c8680d";

        const repository = ClonedRepository.createAtPath(repoPath);
        const { logger, warnings } = makeLogger();

        const result = await createReplayBranch(
            repository,
            "fern-bot/test-branch",
            "Update SDK",
            { previousGenerationSha: unreachableSha, currentGenerationSha },
            logger
        );

        expect(result).toBeUndefined();
        // Branch should still be checked out from HEAD so the rest of GithubStep can push it.
        const currentBranch = gitExec(["rev-parse", "--abbrev-ref", "HEAD"], repoPath);
        expect(currentBranch).toBe("fern-bot/test-branch");
        // Operator visibility: warn so logs explain why the moving tag wasn't updated this run.
        expect(warnings.some((w) => w.includes(unreachableSha))).toBe(true);
    });
});
