import { FERN_BOT_EMAIL, FERN_BOT_NAME } from "@fern-api/replay";
import { execFileSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
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
 * Legacy lockfile backward compatibility.
 *
 * Customer repos in the wild have `.fern/replay.lock` files written by older
 * versions of `@fern-api/replay` that recorded `base_branch_head` on every
 * generation record. The 0.16.0 type definitions no longer declare that field,
 * but the JSON on disk still has it. JavaScript happily loads extra fields;
 * TypeScript no longer surfaces them to the consumer.
 *
 * This test pins the consumer-side contract: an existing lockfile with
 * `base_branch_head` populated MUST load and run without crashing. Mirrors
 * fern-replay's own `__tests__/integration/legacy-lockfile-backward-compat.test.ts`
 * at the pipeline layer so we catch any regression where the consumer adds a
 * strict-schema check or a parser that rejects unknown fields.
 */
describe("replayRun — legacy lockfile compatibility", { tags: ["slow"] }, () => {
    let repoPath: string;
    let cleanup: () => Promise<void>;

    beforeAll(async () => {
        const tmpDir = await tmp.dir({ unsafeCleanup: true });
        repoPath = tmpDir.path;
        cleanup = tmpDir.cleanup;

        initRepo(repoPath);

        writeFileSync(join(repoPath, "README.md"), "# SDK\n");
        const initialSha = commitAs(repoPath, "Test User", "test@example.com", "initial commit");

        mkdirSync(join(repoPath, "src"), { recursive: true });
        writeFileSync(join(repoPath, "src/client.ts"), 'export const baseUrl = "https://api.example.com";\n');
        const generationSha = commitAs(
            repoPath,
            FERN_BOT_NAME,
            FERN_BOT_EMAIL,
            "[fern-generated] Initial SDK generation"
        );

        // Hand-craft a lockfile that includes the legacy `base_branch_head` field on
        // its generation record. This is the shape older `@fern-api/replay` versions
        // wrote. We bypass `LockfileManager.initialize()` because that API no longer
        // accepts the field — but the JSON on disk in customer repos still contains
        // it.
        const legacyLockfile = {
            version: "1.0",
            current_generation: generationSha,
            generations: [
                {
                    commit_sha: generationSha,
                    tree_hash: gitExec(["rev-parse", `${generationSha}^{tree}`], repoPath),
                    timestamp: new Date().toISOString(),
                    cli_version: "0.1.0-test",
                    generator_versions: { "test-generator": "1.0.0" },
                    // Legacy field — present in lockfiles written before fern-replay@0.16.
                    base_branch_head: initialSha
                }
            ],
            patches: [] as unknown[]
        };
        mkdirSync(join(repoPath, ".fern"), { recursive: true });
        writeFileSync(join(repoPath, ".fern", "replay.lock"), `${JSON.stringify(legacyLockfile, null, 2)}\n`);
        commitAs(repoPath, FERN_BOT_NAME, FERN_BOT_EMAIL, "[fern-replay] Initialize legacy lockfile");
    });

    afterAll(async () => {
        await cleanup();
    });

    it("loads and runs a lockfile that still carries base_branch_head on generation records", async () => {
        const result = await replayRun({ outputDir: repoPath, stageOnly: true });

        expect(result.failureReason).toBeUndefined();
        expect(result.report).not.toBeNull();
    });

    it("preserves the legacy base_branch_head on the original record after the engine rewrites the lockfile", () => {
        // The engine round-trips unknown fields on existing generation records
        // rather than stripping them. New records it adds itself do not get a
        // base_branch_head (the field is no longer written by 0.16+), but the
        // legacy record from the customer's pre-upgrade lockfile is preserved
        // verbatim. This is the strong backward-compat guarantee: customer
        // lockfiles do not lose data on the first regen post-upgrade.
        //
        // The assertions below pin three things in order, so a future engine
        // change that short-circuits the lockfile rewrite, drops unknown fields,
        // or accidentally copies `base_branch_head` onto new records will all
        // fail noisily rather than slipping through as a vacuous pass:
        //   1. The lockfile WAS rewritten (>= 2 generation records) — proves the
        //      "no-patches" terminal path didn't bypass the serializer.
        //   2. The ORIGINAL record (index 0) still carries base_branch_head.
        //   3. The NEW record (index 1) does NOT carry base_branch_head.
        const lockfilePath = join(repoPath, ".fern", "replay.lock");
        expect(existsSync(lockfilePath)).toBe(true);
        const lockOnDisk = readFileSync(lockfilePath, "utf-8");

        // The lockfile is YAML, written by the engine's own serializer. Rather
        // than pull in a YAML parser, pin the three invariants with counting
        // assertions over the raw bytes — robust to formatter changes, still
        // tight enough to fail noisily on regression.

        // (1) Lockfile WAS rewritten: at least two generation records exist.
        // The original record was committed by beforeAll(); a second record
        // gets written only if the engine actually went through the serializer.
        const generationRecordCount = (lockOnDisk.match(/^\s*-\s+commit_sha:/gm) ?? []).length;
        expect(generationRecordCount).toBeGreaterThanOrEqual(2);

        // (2) The legacy field is preserved on the original record.
        expect(lockOnDisk).toContain("base_branch_head");

        // (3) The new record does NOT carry base_branch_head — the engine writes
        // it onto exactly the record(s) that already had it, not new ones.
        // Counting occurrences pins this: if the engine ever started writing the
        // field on new records, the count would be >= 2.
        const baseBranchHeadCount = (lockOnDisk.match(/base_branch_head/g) ?? []).length;
        expect(baseBranchHeadCount).toBe(1);
    });
});
