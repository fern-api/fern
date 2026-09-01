import { execFileSync } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import tmp from "tmp-promise";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock @fern-api/cli-ai BEFORE importing AutoVersionStep, which dynamically imports
// the package inside loadBaml(). vi.mock is hoisted so the dynamic import resolves
// to the mocked module.
const mockAnalyzeSdkDiff = vi.fn();
const mockConsolidateChangelog = vi.fn();

vi.mock("@fern-api/cli-ai", () => ({
    loadBamlDependencies: vi.fn().mockResolvedValue({
        BamlClient: {
            withOptions: () => ({
                AnalyzeSdkDiff: mockAnalyzeSdkDiff,
                ConsolidateChangelog: mockConsolidateChangelog
            })
        },
        configureBamlClient: vi.fn(() => ({})),
        ClientRegistry: class ClientRegistry {}
    }),
    VersionBump: { MAJOR: "MAJOR", MINOR: "MINOR", PATCH: "PATCH", NO_CHANGE: "NO_CHANGE" }
}));

import type { PipelineLogger } from "../pipeline/PipelineLogger";
import { AutoVersionStep, isGenerationCommitMessage } from "../pipeline/steps/AutoVersionStep";
import type { AutoVersionStepConfig, PipelineContext } from "../pipeline/types";
import type { PreparedReplay } from "../replay/replay-run";

function gitExec(args: string[], cwd: string): string {
    return execFileSync("git", args, { cwd, encoding: "utf-8", stdio: "pipe" }).trim();
}

function makeLogger(): PipelineLogger & { warns: string[]; infos: string[] } {
    const warns: string[] = [];
    const infos: string[] = [];
    return {
        debug: () => undefined,
        info: (message: string) => {
            infos.push(message);
        },
        warn: (message: string) => {
            warns.push(message);
        },
        error: () => undefined,
        warns,
        infos
    };
}

function fakePreparedReplay(overrides: Partial<PreparedReplay>): PreparedReplay {
    return {
        _service: {} as unknown as PreparedReplay["_service"],
        _preparation: {} as unknown as PreparedReplay["_preparation"],
        outputDir: overrides.outputDir ?? "/tmp/fake",
        flow: overrides.flow ?? "normal-regeneration",
        previousGenerationSha: overrides.previousGenerationSha ?? null,
        currentGenerationSha: overrides.currentGenerationSha ?? "unused",
        autoBootstrapped: false,
        bootstrapAttempted: false
    };
}

function makeContext(prepared: PreparedReplay): PipelineContext {
    return {
        previousStepResults: {
            generationCommit: { executed: true, success: true, preparedReplay: prepared }
        }
    };
}

const baseConfig: AutoVersionStepConfig = {
    enabled: true,
    language: "typescript",
    ai: { provider: "anthropic", model: "claude-sonnet-4-6" }
};

const MAGIC_VERSION = "0.0.0-fern-placeholder";

function writeVersion(repoPath: string, version: string): void {
    writeFileSync(join(repoPath, "package.json"), JSON.stringify({ name: "test-sdk", version }, null, 2) + "\n");
}

/**
 * Builds the history a squash-merged release leaves behind:
 *
 *   [fern-generated] Previous SDK          1.2.0   ← replay.lock still records THIS
 *        │
 *   feat: 1.3.0 alignExpr (#15)            1.3.0   ← squash merge; marker only in the body
 *        │                                           adds src/align.ts (shipped in 1.3.0)
 *   [fern-generated] Current SDK           magic   ← this run; adds src/newFeature.ts
 *
 * Diffing from the recorded (stale) commit re-reports src/align.ts, which 1.3.0 already
 * shipped. Diffing from the squash commit reports only src/newFeature.ts.
 */
interface SquashMergedRelease {
    repoPath: string;
    staleSha: string;
    releaseSha: string;
    currentSha: string;
    cleanup: () => Promise<void>;
}

async function setupSquashMergedRelease(): Promise<SquashMergedRelease> {
    const tmpDir = await tmp.dir({ unsafeCleanup: true });
    const repoPath = tmpDir.path;

    gitExec(["init", "-b", "main"], repoPath);
    gitExec(["config", "user.name", "Test"], repoPath);
    gitExec(["config", "user.email", "test@example.com"], repoPath);
    gitExec(["config", "commit.gpgsign", "false"], repoPath);

    mkdirSync(join(repoPath, "src"), { recursive: true });
    writeVersion(repoPath, "1.2.0");
    writeFileSync(join(repoPath, "src/client.ts"), 'export const baseUrl = "https://api.example.com";\n');
    gitExec(["add", "."], repoPath);
    gitExec(["commit", "-m", "[fern-generated] Previous SDK"], repoPath);
    const staleSha = gitExec(["rev-parse", "HEAD"], repoPath);

    // The release, squash-merged: PR title as the subject, squashed subjects as body bullets.
    writeVersion(repoPath, "1.3.0");
    writeFileSync(join(repoPath, "src/align.ts"), "export function align(): string {\n    return 'aligned';\n}\n");
    gitExec(["add", "."], repoPath);
    gitExec(
        [
            "commit",
            "-m",
            "feat: 1.3.0 alignExpr (#15)\n\n* [fern-generated] Update SDK\n\n* [fern-autoversion] SDK regeneration\n\n---------\n\nCo-authored-by: fern-api <fern-api[bot]@users.noreply.github.com>"
        ],
        repoPath
    );
    const releaseSha = gitExec(["rev-parse", "HEAD"], repoPath);

    // This run's generation commit.
    writeVersion(repoPath, MAGIC_VERSION);
    writeFileSync(join(repoPath, "src/newFeature.ts"), "export function newFeature(): number {\n    return 42;\n}\n");
    gitExec(["add", "."], repoPath);
    gitExec(["commit", "-m", "[fern-generated] Current SDK (placeholder)"], repoPath);
    const currentSha = gitExec(["rev-parse", "HEAD"], repoPath);

    return { repoPath, staleSha, releaseSha, currentSha, cleanup: () => tmpDir.cleanup() };
}

describe("isGenerationCommitMessage", () => {
    it("matches a standalone generation commit subject", () => {
        expect(isGenerationCommitMessage("[fern-generated] Update SDK")).toBe(true);
    });

    it("matches a squash-merge body where the marker survives only as a bullet", () => {
        const message = "feat: 1.3.0 alignExpr (#15)\n\n* [fern-generated] Update SDK\n* [fern-autoversion] SDK regen";
        expect(isGenerationCommitMessage(message)).toBe(true);
    });

    it("matches a dash-bulleted squash body", () => {
        expect(isGenerationCommitMessage("feat: release\n\n- [fern-generated] Update SDK\n")).toBe(true);
    });

    it("does not match a commit that only mentions the marker mid-sentence", () => {
        expect(isGenerationCommitMessage("revert: undo the [fern-generated] commit from Friday")).toBe(false);
    });

    it("does not match other fern markers", () => {
        expect(isGenerationCommitMessage("[fern-autoversion] SDK regeneration")).toBe(false);
        expect(isGenerationCommitMessage("[fern-replay] advance lockfile")).toBe(false);
    });
});

describe("AutoVersionStep.execute() — stale-but-reachable baseline", () => {
    let repo: SquashMergedRelease;

    beforeEach(async () => {
        mockAnalyzeSdkDiff.mockReset();
        mockConsolidateChangelog.mockReset();
        repo = await setupSquashMergedRelease();
    });

    afterEach(async () => {
        await repo.cleanup();
    });

    it("re-anchors on the squash-merged release instead of the stale recorded SHA", async () => {
        // Regression: a squash-merged release never advances replay.lock's current_generation,
        // so it keeps pointing at the commit *before* the release. That commit stays on main
        // forever, so a reachability probe alone accepts it and every later regeneration
        // re-reports the whole release as new (wrong MAJOR bumps, duplicate changelog entries).
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: "MINOR",
            message: "feat: add newFeature helper",
            changelog_entry: "### Added\n- newFeature()",
            version_bump_reason: "New public API."
        });

        const logger = makeLogger();
        const step = new AutoVersionStep(repo.repoPath, logger, baseConfig);
        const result = await step.execute(
            makeContext(
                fakePreparedReplay({
                    outputDir: repo.repoPath,
                    previousGenerationSha: repo.staleSha,
                    currentGenerationSha: repo.currentSha
                })
            )
        );

        expect(result.success).toBe(true);
        // Baselined on the release (1.3.0), not the commit before it (1.2.0).
        expect(result.previousVersion).toBe("1.3.0");
        expect(result.version).toBe("1.4.0");

        // The diff handed to FAI must describe only this run's work.
        expect(mockAnalyzeSdkDiff).toHaveBeenCalledTimes(1);
        const analysedDiff = mockAnalyzeSdkDiff.mock.calls[0]?.[0] as string;
        expect(analysedDiff).toContain("newFeature");
        expect(analysedDiff).not.toContain("align");

        expect(logger.warns.some((warning) => warning.includes("is stale"))).toBe(true);
    });

    it("keeps the recorded SHA when the derived commit is not a descendant of it", async () => {
        // The recorded SHA can legitimately be newer than anything on the first-parent line —
        // e.g. it points at the previous run's generation commit, still reachable via the open
        // bot branch. Re-anchoring there would walk the baseline backwards, so a derived commit
        // only wins when it provably descends from the recorded one.
        gitExec(["checkout", "-q", "-b", "prev-bot-branch", repo.staleSha], repo.repoPath);
        writeVersion(repo.repoPath, "1.3.0");
        writeFileSync(join(repo.repoPath, "src/align.ts"), "export function align(): string {\n    return 'x';\n}\n");
        gitExec(["add", "."], repo.repoPath);
        gitExec(["commit", "-m", "[fern-generated] Previous run on the bot branch"], repo.repoPath);
        const sideBranchSha = gitExec(["rev-parse", "HEAD"], repo.repoPath);
        gitExec(["checkout", "-q", "main"], repo.repoPath);

        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: "MINOR",
            message: "feat: add newFeature helper",
            changelog_entry: "### Added\n- newFeature()",
            version_bump_reason: "New public API."
        });

        const logger = makeLogger();
        const step = new AutoVersionStep(repo.repoPath, logger, baseConfig);
        const result = await step.execute(
            makeContext(
                fakePreparedReplay({
                    outputDir: repo.repoPath,
                    previousGenerationSha: sideBranchSha,
                    currentGenerationSha: repo.currentSha
                })
            )
        );

        expect(result.success).toBe(true);
        expect(logger.warns.some((warning) => warning.includes("is stale"))).toBe(false);
        const analysedDiff = mockAnalyzeSdkDiff.mock.calls[0]?.[0] as string;
        expect(analysedDiff).toContain("newFeature");
        // The side branch wrote align.ts as `return 'x'` and main's release wrote
        // `return 'aligned'`, so this hunk appears only when the side-branch generation —
        // the recorded SHA — is the diff base.
        expect(analysedDiff).toContain("return 'x'");
    });

    it("re-anchors on a squash-merged release when the recorded SHA is unreachable", async () => {
        // The signed-commit push recreates commits under new SHAs, so after the release merges
        // the recorded SHA is gone entirely. The history walk must still find the release, whose
        // marker survives only in the squash body — previously it matched subjects only and
        // silently returned no baseline, producing a no-op release.
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: "MINOR",
            message: "feat: add newFeature helper",
            changelog_entry: "### Added\n- newFeature()",
            version_bump_reason: "New public API."
        });

        const logger = makeLogger();
        const step = new AutoVersionStep(repo.repoPath, logger, baseConfig);
        const result = await step.execute(
            makeContext(
                fakePreparedReplay({
                    outputDir: repo.repoPath,
                    previousGenerationSha: "0".repeat(40),
                    currentGenerationSha: repo.currentSha
                })
            )
        );

        expect(result.success).toBe(true);
        expect(result.previousVersion).toBe("1.3.0");
        expect(result.version).toBe("1.4.0");
        expect(logger.infos.some((info) => info.includes("re-anchored"))).toBe(true);
    });
});
