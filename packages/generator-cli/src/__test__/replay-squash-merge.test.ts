import { FERN_BOT_EMAIL, FERN_BOT_NAME, LockfileManager } from "@fern-api/replay";
import { execFileSync } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import tmp from "tmp-promise";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { replayRun } from "../replay/replay-run";

function gitExec(args: string[], cwd: string): string {
    return execFileSync("git", args, { cwd, encoding: "utf-8", stdio: "pipe" }).trim();
}

function initRepo(repoPath: string): void {
    gitExec(["init", "--initial-branch=main"], repoPath);
    gitExec(["config", "user.name", "Test User"], repoPath);
    gitExec(["config", "user.email", "test@example.com"], repoPath);
    gitExec(["config", "commit.gpgsign", "false"], repoPath);
}

function commitAs(repoPath: string, name: string, email: string, message: string): string {
    gitExec(["add", "."], repoPath);
    gitExec(["-c", `user.name=${name}`, "-c", `user.email=${email}`, "commit", "-m", message], repoPath);
    return gitExec(["rev-parse", "HEAD"], repoPath);
}

/**
 * Squash-merge regression — customer-facing scenario.
 *
 * A fern-bot regeneration PR is squash-merged into main and its source branch
 * deleted. The lockfile's `current_generation` now points at a `[fern-generated]`
 * commit that is no longer reachable from HEAD — the squash flattened the bot's
 * branch into a single new commit S with the post-replay tree.
 *
 * Before the consumer-side cleanup, this run path went through a precondition
 * gauntlet in `replayPrepare` that resolved the `fern-generation-base` tag,
 * compared tree distances, and explicitly invoked `syncFromDivergentMerge` to
 * patch up the lockfile. That gauntlet has been deleted; recovery is now handled
 * inside `@fern-api/replay` via the derived scan boundary in
 * `findPreviousGenerationFromHistory`, which walks `git log HEAD --first-parent`
 * and re-anchors on the most recent reachable `[fern-generated]` commit.
 *
 * This test pins the contract at the consumer-pipeline level: after the
 * squash-merge has orphaned the lockfile's recorded SHA, `replayRun` must not
 * crash and must produce a sensible result for the next regen.
 */
describe("replayRun — squash-merge regression", { tags: ["slow"] }, () => {
    let repoPath: string;
    let cleanup: () => Promise<void>;

    beforeAll(async () => {
        const tmpDir = await tmp.dir({ unsafeCleanup: true });
        repoPath = tmpDir.path;
        cleanup = tmpDir.cleanup;

        initRepo(repoPath);

        // Initial commit by the user.
        writeFileSync(join(repoPath, "README.md"), "# SDK\n");
        commitAs(repoPath, "Test User", "test@example.com", "initial commit");

        // First fern-bot generation: G_old. This is the commit the lockfile records as
        // `current_generation` after the PR is opened. In the real squash-merge
        // scenario, G_old lives only on the bot's PR branch and disappears from the
        // local clone after the branch is deleted.
        mkdirSync(join(repoPath, "src"), { recursive: true });
        writeFileSync(join(repoPath, "src/client.ts"), 'export const baseUrl = "https://api.example.com";\n');
        const gOldSha = commitAs(repoPath, FERN_BOT_NAME, FERN_BOT_EMAIL, "[fern-generated] Initial SDK generation");

        // Lockfile pointing at G_old. Commit it on top so the working tree at HEAD
        // contains both the lockfile and the generated source.
        const lockManager = new LockfileManager(repoPath);
        lockManager.initialize({
            commit_sha: gOldSha,
            tree_hash: gitExec(["rev-parse", `${gOldSha}^{tree}`], repoPath),
            timestamp: new Date().toISOString(),
            cli_version: "0.1.0-test",
            generator_versions: { "test-generator": "1.0.0" }
        });
        commitAs(repoPath, FERN_BOT_NAME, FERN_BOT_EMAIL, "[fern-replay] Initialize lockfile");

        // Customer edits the generated file directly on main. This is the
        // customization the squash-merge ultimately preserves.
        writeFileSync(
            join(repoPath, "src/client.ts"),
            'export const baseUrl = "https://api.example.com";\nexport const customHeader = "X-Customer-Tag";\n'
        );
        commitAs(repoPath, "Test User", "test@example.com", "Add custom header constant");

        // Capture the current tree — this is what the squash-merge would put on main
        // as the single new `[fern-generated]` commit S. We then rewrite history to
        // orphan G_old, mirroring "PR squash-merged + source branch deleted".
        const postCustomizationTree = gitExec(["rev-parse", "HEAD^{tree}"], repoPath);
        const preGenerationCommit = gitExec(["rev-parse", "HEAD~3"], repoPath); // the initial user commit

        // Build the squashed [fern-generated] commit S, parented on the initial user
        // commit. The intermediate G_old and the lockfile/customer commits are no
        // longer reachable from S — the bot's PR branch is gone.
        const squashedSha = gitExec(
            [
                "-c",
                `user.name=${FERN_BOT_NAME}`,
                "-c",
                `user.email=${FERN_BOT_EMAIL}`,
                "commit-tree",
                postCustomizationTree,
                "-p",
                preGenerationCommit,
                "-m",
                "[fern-generated] Squashed regen PR"
            ],
            repoPath
        );
        gitExec(["update-ref", "refs/heads/main", squashedSha], repoPath);
        gitExec(["reset", "--hard", "main"], repoPath);

        // Sanity check: G_old is unreachable from HEAD now.
        const gOldReachable = (() => {
            try {
                execFileSync("git", ["merge-base", "--is-ancestor", gOldSha, "HEAD"], {
                    cwd: repoPath,
                    stdio: "pipe"
                });
                return true;
            } catch {
                return false;
            }
        })();
        expect(gOldReachable).toBe(false);

        // The lockfile in the working tree still records G_old as current_generation
        // — that's the orphaned reference the deleted gauntlet used to "fix".
        const lockOnDisk = lockManager.read();
        expect(lockOnDisk.current_generation).toBe(gOldSha);
    });

    afterAll(async () => {
        await cleanup();
    });

    it("does not crash when the lockfile's current_generation is unreachable", async () => {
        const result = await replayRun({ outputDir: repoPath, stageOnly: true });

        // The result reflects a real replay run: report is non-null and the apply
        // succeeded. If the missing gauntlet had broken the flow, we would see a
        // null report and a failureReason here.
        expect(result.failureReason).toBeUndefined();
        expect(result.report).not.toBeNull();
    });

    it("preserves the customer's customization on disk after the orphaning", async () => {
        // The post-squash tree contained the customer's customHeader constant; a
        // subsequent regen must not strip it. The exact replay flow depends on what
        // the upstream engine's derived scan boundary finds, but the customer's line
        // MUST still be present after the run.
        const fileContents = execFileSync("cat", [join(repoPath, "src/client.ts")], { encoding: "utf-8" });
        expect(fileContents).toContain("X-Customer-Tag");
    });
});
