import { execFileSync } from "child_process";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import tmp from "tmp-promise";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock @fern-api/cli-ai BEFORE importing AutoVersionStep, which dynamically imports
// the package inside loadBaml(). vi.mock is hoisted so the dynamic import resolves
// to the mocked module.
const mockAnalyzeSdkDiff = vi.fn();
const mockConsolidateChangelog = vi.fn();
const mockConfigureBamlClient = vi.fn(() => ({}));

vi.mock("@fern-api/cli-ai", () => ({
    loadBamlDependencies: vi.fn().mockResolvedValue({
        BamlClient: {
            withOptions: () => ({
                AnalyzeSdkDiff: mockAnalyzeSdkDiff,
                ConsolidateChangelog: mockConsolidateChangelog
            })
        },
        configureBamlClient: mockConfigureBamlClient,
        ClientRegistry: class ClientRegistry {}
    }),
    VersionBump: { MAJOR: "MAJOR", MINOR: "MINOR", PATCH: "PATCH", NO_CHANGE: "NO_CHANGE" }
}));

import type { PipelineLogger } from "../pipeline/PipelineLogger";
import { AutoVersionStep } from "../pipeline/steps/AutoVersionStep";
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
        info: (msg: string) => {
            infos.push(msg);
        },
        warn: (msg: string) => {
            warns.push(msg);
        },
        error: () => undefined,
        warns,
        infos
    };
}

/**
 * Creates a git repo with two `[fern-generated]`-style commits:
 *   previousSha → has `previousVersion` baked into package.json
 *   currentSha  → has the magic placeholder + optional new feature file
 *
 * The diff between them contains both the version-line regression (which
 * extractPreviousVersion scans for) and any feature diff (which FAI analyses).
 */
interface TwoGenerations {
    repoPath: string;
    previousSha: string;
    currentSha: string;
    cleanup: () => Promise<void>;
}

async function setupTwoGenerations(
    opts: {
        previousVersion?: string;
        magicVersion?: string;
        /** Optional new file added in the current generation, to fabricate a non-version-only diff. */
        featureFile?: { path: string; content: string };
        /** Optional bytes of filler content to inflate the diff for chunking tests. */
        fillerKB?: number;
    } = {}
): Promise<TwoGenerations> {
    const previousVersion = opts.previousVersion ?? "1.0.0";
    const magicVersion = opts.magicVersion ?? "0.0.0-fern-placeholder";

    const tmpDir = await tmp.dir({ unsafeCleanup: true });
    const repoPath = tmpDir.path;

    gitExec(["init", "-b", "main"], repoPath);
    gitExec(["config", "user.name", "Test"], repoPath);
    gitExec(["config", "user.email", "test@example.com"], repoPath);
    gitExec(["config", "commit.gpgsign", "false"], repoPath);

    // Previous [fern-generated]: real version baked into package.json
    mkdirSync(join(repoPath, "src"), { recursive: true });
    writeFileSync(
        join(repoPath, "package.json"),
        JSON.stringify({ name: "test-sdk", version: previousVersion }, null, 2) + "\n"
    );
    writeFileSync(
        join(repoPath, "src/client.ts"),
        'export class Client {\n  baseUrl = "https://api.example.com";\n}\n'
    );
    gitExec(["add", "."], repoPath);
    gitExec(["commit", "-m", "[fern-generated] Previous SDK"], repoPath);
    const previousSha = gitExec(["rev-parse", "HEAD"], repoPath);

    // Current [fern-generated]: placeholder + optional feature
    writeFileSync(
        join(repoPath, "package.json"),
        JSON.stringify({ name: "test-sdk", version: magicVersion }, null, 2) + "\n"
    );
    if (opts.featureFile) {
        const featurePath = join(repoPath, opts.featureFile.path);
        mkdirSync(join(featurePath, ".."), { recursive: true });
        writeFileSync(featurePath, opts.featureFile.content);
    }
    if (opts.fillerKB && opts.fillerKB > 0) {
        const filler = "// filler line keeps cleanDiffForAI happy\n".repeat(opts.fillerKB * 20);
        writeFileSync(join(repoPath, "src/filler.ts"), filler);
    }
    gitExec(["add", "."], repoPath);
    gitExec(["commit", "-m", "[fern-generated] Current SDK (placeholder)"], repoPath);
    const currentSha = gitExec(["rev-parse", "HEAD"], repoPath);

    return { repoPath, previousSha, currentSha, cleanup: () => tmpDir.cleanup() };
}

/**
 * A bare-bones PreparedReplay stand-in. AutoVersionStep reads `flow`,
 * `previousGenerationSha`, and `currentGenerationSha` only; `_service` and
 * `_preparation` are never dereferenced inside execute().
 */
function fakePreparedReplay(overrides: Partial<PreparedReplay>): PreparedReplay {
    return {
        _service: {} as unknown as PreparedReplay["_service"],
        _preparation: {} as unknown as PreparedReplay["_preparation"],
        outputDir: overrides.outputDir ?? "/tmp/fake",
        flow: overrides.flow ?? "normal-regeneration",
        previousGenerationSha: overrides.previousGenerationSha ?? null,
        currentGenerationSha: overrides.currentGenerationSha ?? "unused",
        autoBootstrapped: overrides.autoBootstrapped ?? false,
        bootstrapAttempted: overrides.bootstrapAttempted ?? false
    };
}

function makeContext(prepared: PreparedReplay | null | undefined): PipelineContext {
    return {
        previousStepResults: {
            generationCommit:
                prepared === undefined
                    ? undefined
                    : {
                          executed: true,
                          success: true,
                          preparedReplay: prepared
                      }
        }
    };
}

const baseConfig: AutoVersionStepConfig = {
    enabled: true,
    language: "typescript",
    ai: { provider: "anthropic", model: "claude-sonnet-4-6" }
};

describe("AutoVersionStep.execute() — short-circuits", () => {
    beforeEach(() => {
        mockAnalyzeSdkDiff.mockReset();
        mockConsolidateChangelog.mockReset();
    });

    it("enters non-replay mode when generationCommit is absent from context", async () => {
        const step = new AutoVersionStep("/tmp/fake", makeLogger(), baseConfig);
        // Without a real git repo, gitDiffHead() throws — verifies non-replay path is entered.
        await expect(step.execute(makeContext(undefined))).rejects.toThrow();
        expect(mockAnalyzeSdkDiff).not.toHaveBeenCalled();
    });

    it("enters non-replay mode when preparedReplay is null (no lockfile)", async () => {
        const step = new AutoVersionStep("/tmp/fake", makeLogger(), baseConfig);
        // Without a real git repo, gitDiffHead() throws — verifies non-replay path is entered.
        await expect(step.execute(makeContext(null))).rejects.toThrow();
        expect(mockAnalyzeSdkDiff).not.toHaveBeenCalled();
    });

    it("short-circuits when replay flow is skip-application", async () => {
        const step = new AutoVersionStep("/tmp/fake", makeLogger(), baseConfig);
        const prepared = fakePreparedReplay({ flow: "skip-application", previousGenerationSha: "abc" });
        const result = await step.execute(makeContext(prepared));
        expect(result).toEqual({ executed: true, success: true });
        expect(mockAnalyzeSdkDiff).not.toHaveBeenCalled();
    });
});

describe("AutoVersionStep.execute() — normal MINOR flow", () => {
    let repo: TwoGenerations;

    beforeEach(async () => {
        mockAnalyzeSdkDiff.mockReset();
        mockConsolidateChangelog.mockReset();
        repo = await setupTwoGenerations({
            previousVersion: "1.0.0",
            featureFile: {
                path: "src/newFeature.ts",
                content: "export function newFeature(): number {\n    return 42;\n}\n"
            }
        });
    });

    afterEach(async () => {
        await repo.cleanup();
    });

    it("bumps MINOR, rewrites placeholder, prepends changelog.md, commits [fern-autoversion]", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: "MINOR",
            message: "feat: add newFeature helper",
            changelog_entry: "### Added\n- `newFeature()` helper that returns 42.",
            version_bump_reason: "New public API surface added."
        });

        const step = new AutoVersionStep(repo.repoPath, makeLogger(), baseConfig);
        const prepared = fakePreparedReplay({
            outputDir: repo.repoPath,
            previousGenerationSha: repo.previousSha,
            currentGenerationSha: repo.currentSha
        });

        const result = await step.execute(makeContext(prepared));

        expect(result.success).toBe(true);
        expect(result.version).toBe("1.1.0");
        expect(result.previousVersion).toBe("1.0.0");
        expect(result.versionBump).toBe("MINOR");
        expect(result.changelogEntry).toContain("newFeature");
        expect(result.commitSha).toMatch(/^[0-9a-f]{40}$/);

        const head = gitExec(["log", "-1", "--format=%s%n%n%b"], repo.repoPath);
        expect(head).toContain("[fern-autoversion]");
        expect(head).toContain("feat: add newFeature helper");

        const pkg = JSON.parse(readFileSync(join(repo.repoPath, "package.json"), "utf-8")) as {
            version: string;
        };
        expect(pkg.version).toBe("1.1.0");

        const changelog = readFileSync(join(repo.repoPath, "changelog.md"), "utf-8");
        expect(changelog).toContain("## [1.1.0]");
        expect(changelog).toContain("newFeature");
        expect(changelog.startsWith("# Changelog")).toBe(true);

        expect(mockAnalyzeSdkDiff).toHaveBeenCalledTimes(1);
        expect(mockConsolidateChangelog).not.toHaveBeenCalled();
    });

    it("falls back to PATCH with a neutral commit message when FAI throws", async () => {
        mockAnalyzeSdkDiff.mockRejectedValue(new Error("FAI network timeout"));

        const step = new AutoVersionStep(repo.repoPath, makeLogger(), baseConfig);
        const prepared = fakePreparedReplay({
            outputDir: repo.repoPath,
            previousGenerationSha: repo.previousSha,
            currentGenerationSha: repo.currentSha
        });

        const result = await step.execute(makeContext(prepared));

        expect(result.success).toBe(true);
        expect(result.version).toBe("1.0.1");
        expect(result.versionBump).toBe("PATCH");
        expect(result.commitMessage).toContain("SDK regeneration");
        expect(result.commitMessage).toContain("🌿 Generated with Fern");

        const pkg = JSON.parse(readFileSync(join(repo.repoPath, "package.json"), "utf-8")) as {
            version: string;
        };
        expect(pkg.version).toBe("1.0.1");
    });

    it("on NO_CHANGE, rewrites the placeholder to previousVersion and commits [fern-autoversion]", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: "NO_CHANGE",
            message: "",
            changelog_entry: "",
            version_bump_reason: ""
        });

        const step = new AutoVersionStep(repo.repoPath, makeLogger(), baseConfig);
        const prepared = fakePreparedReplay({
            outputDir: repo.repoPath,
            previousGenerationSha: repo.previousSha,
            currentGenerationSha: repo.currentSha
        });

        const result = await step.execute(makeContext(prepared));

        expect(result.success).toBe(true);
        expect(result.versionBump).toBe("NO_CHANGE");
        expect(result.version).toBe("1.0.0");
        expect(result.previousVersion).toBe("1.0.0");
        expect(result.commitSha).toMatch(/^[0-9a-f]{40}$/);
        expect(result.commitMessage).toContain("SDK regeneration");

        const pkg = JSON.parse(readFileSync(join(repo.repoPath, "package.json"), "utf-8")) as {
            version: string;
        };
        expect(pkg.version).toBe("1.0.0");

        const head = gitExec(["log", "-1", "--format=%B"], repo.repoPath);
        expect(head).toContain("[fern-autoversion]");
    });

    it("recovers when previousGenerationSha is unreachable by deriving the baseline from history", async () => {
        // Regression: generator-cli's signed-commit push recreates the [fern-generated]
        // commit with a new remote SHA, so the SHA recorded in replay.lock
        // (previousGenerationSha) no longer exists in the next clone. AutoVersionStep must
        // not crash on the unreachable SHA — it should re-anchor on the most recent reachable
        // [fern-generated] commit and still compute the correct bump.
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: "MINOR",
            message: "feat: add newFeature helper",
            changelog_entry: "### Added\n- newFeature()",
            version_bump_reason: "New public API."
        });

        const step = new AutoVersionStep(repo.repoPath, makeLogger(), baseConfig);
        const unreachableSha = "0".repeat(40);
        const prepared = fakePreparedReplay({
            outputDir: repo.repoPath,
            previousGenerationSha: unreachableSha,
            currentGenerationSha: repo.currentSha
        });

        const result = await step.execute(makeContext(prepared));

        expect(result.success).toBe(true);
        expect(result.previousVersion).toBe("1.0.0");
        expect(result.version).toBe("1.1.0");

        const pkg = JSON.parse(readFileSync(join(repo.repoPath, "package.json"), "utf-8")) as {
            version: string;
        };
        expect(pkg.version).toBe("1.1.0");
    });

    it("omits the Fern trailer when isWhitelabel is true", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: "MINOR",
            message: "feat: add newFeature helper",
            changelog_entry: "### Added\n- newFeature()",
            version_bump_reason: "New public API."
        });

        const step = new AutoVersionStep(repo.repoPath, makeLogger(), {
            ...baseConfig,
            isWhitelabel: true
        });
        const prepared = fakePreparedReplay({
            outputDir: repo.repoPath,
            previousGenerationSha: repo.previousSha,
            currentGenerationSha: repo.currentSha
        });

        await step.execute(makeContext(prepared));

        const head = gitExec(["log", "-1", "--format=%B"], repo.repoPath);
        expect(head).toContain("feat: add newFeature helper");
        expect(head).not.toContain("🌿 Generated with Fern");
    });
});

describe("AutoVersionStep.execute() — unreachable baseline never ships the placeholder", () => {
    let repoPath: string;
    let currentSha: string;
    let cleanup: () => Promise<void>;

    beforeEach(async () => {
        mockAnalyzeSdkDiff.mockReset();
        mockConsolidateChangelog.mockReset();

        // A repo whose only generation commit carries the magic placeholder, and whose
        // recorded previousGenerationSha is unreachable with no prior [fern-generated]
        // commit in history — the worst case. AutoVersion must still rewrite the placeholder
        // rather than crash and let a `0.0.0-fern-placeholder` PR ship.
        const tmpDir = await tmp.dir({ unsafeCleanup: true });
        repoPath = tmpDir.path;
        cleanup = () => tmpDir.cleanup();

        gitExec(["init", "-b", "main"], repoPath);
        gitExec(["config", "user.name", "Test"], repoPath);
        gitExec(["config", "user.email", "test@example.com"], repoPath);
        gitExec(["config", "commit.gpgsign", "false"], repoPath);
        writeFileSync(
            join(repoPath, "package.json"),
            JSON.stringify({ name: "test-sdk", version: "0.0.0-fern-placeholder" }, null, 2) + "\n"
        );
        gitExec(["add", "."], repoPath);
        gitExec(["commit", "-m", "[fern-generated] Current SDK (placeholder)"], repoPath);
        currentSha = gitExec(["rev-parse", "HEAD"], repoPath);
    });

    afterEach(async () => {
        await cleanup();
    });

    it("rewrites the placeholder using baseVersion instead of throwing on the unreachable SHA", async () => {
        const step = new AutoVersionStep(repoPath, makeLogger(), { ...baseConfig, baseVersion: "2.3.4" });
        const prepared = fakePreparedReplay({
            outputDir: repoPath,
            previousGenerationSha: "0".repeat(40),
            currentGenerationSha: currentSha
        });

        const result = await step.execute(makeContext(prepared));

        expect(result.success).toBe(true);
        const pkg = JSON.parse(readFileSync(join(repoPath, "package.json"), "utf-8")) as { version: string };
        expect(pkg.version).not.toContain("fern-placeholder");
        expect(pkg.version).toBe("2.3.4");
        expect(mockAnalyzeSdkDiff).not.toHaveBeenCalled();
    });
});

describe("AutoVersionStep.execute() — adversarial baseline recovery", () => {
    const cleanups: Array<() => Promise<void>> = [];

    beforeEach(() => {
        mockAnalyzeSdkDiff.mockReset();
        mockConsolidateChangelog.mockReset();
    });

    afterEach(async () => {
        await Promise.all(cleanups.splice(0).map((c) => c()));
    });

    async function newRepo(): Promise<string> {
        const tmpDir = await tmp.dir({ unsafeCleanup: true });
        cleanups.push(() => tmpDir.cleanup());
        gitExec(["init", "-b", "main"], tmpDir.path);
        gitExec(["config", "user.name", "Test"], tmpDir.path);
        gitExec(["config", "user.email", "test@example.com"], tmpDir.path);
        gitExec(["config", "commit.gpgsign", "false"], tmpDir.path);
        return tmpDir.path;
    }

    function commit(repoPath: string, message: string, files: Record<string, string>): string {
        for (const [rel, content] of Object.entries(files)) {
            const abs = join(repoPath, rel);
            mkdirSync(join(abs, ".."), { recursive: true });
            writeFileSync(abs, content);
        }
        gitExec(["add", "."], repoPath);
        gitExec(["commit", "-m", message], repoPath);
        return gitExec(["rev-parse", "HEAD"], repoPath);
    }

    const MAGIC = "0.0.0-fern-placeholder";
    const pkg = (version: string) => JSON.stringify({ name: "test-sdk", version }, null, 2) + "\n";
    const FEATURE = { "src/newFeature.ts": "export function newFeature(): number {\n    return 42;\n}\n" };
    const minorAnalysis = {
        version_bump: "MINOR",
        message: "feat: add newFeature helper",
        changelog_entry: "### Added\n- newFeature()",
        version_bump_reason: "New public API."
    };

    function packageVersion(repoPath: string): string {
        return (JSON.parse(readFileSync(join(repoPath, "package.json"), "utf-8")) as { version: string }).version;
    }

    it("skips intervening [fern-replay]/[fern-autoversion]/manual commits and anchors on the prior [fern-generated]", async () => {
        // Mirrors the real regression history: the [fern-replay] advance lockfile commit (and
        // friends) sit between the two generations. The re-anchor must walk past them to the
        // previous [fern-generated] commit, not diff against a replay/manual commit.
        mockAnalyzeSdkDiff.mockResolvedValue(minorAnalysis);
        const repoPath = await newRepo();
        commit(repoPath, "[fern-generated] gen 1", { "package.json": pkg("1.0.0"), "src/client.ts": "export {};\n" });
        commit(repoPath, "[fern-replay] apply patches", { "src/custom.ts": "export const custom = 1;\n" });
        commit(repoPath, "[fern-replay] advance lockfile", {
            ".fern/replay.lock": '{"current_generation":"deadbeef"}\n'
        });
        commit(repoPath, "chore: customer manual edit", { "README.md": "hand-written\n" });
        const currentSha = commit(repoPath, "[fern-generated] gen 2", { "package.json": pkg(MAGIC), ...FEATURE });

        const step = new AutoVersionStep(repoPath, makeLogger(), baseConfig);
        const result = await step.execute(
            makeContext(
                fakePreparedReplay({
                    outputDir: repoPath,
                    previousGenerationSha: "0".repeat(40),
                    currentGenerationSha: currentSha
                })
            )
        );

        expect(result.success).toBe(true);
        expect(result.previousVersion).toBe("1.0.0");
        expect(result.version).toBe("1.1.0");
        expect(packageVersion(repoPath)).toBe("1.1.0");
    });

    it("ignores a rogue [fern-generated] commit on a merged side branch (--first-parent)", async () => {
        // A merged side branch carries its own [fern-generated] commit with a bogus version.
        // A naive `git log` walk could surface it; the first-parent walk must stay on mainline
        // and anchor on the real previous generation.
        mockAnalyzeSdkDiff.mockResolvedValue(minorAnalysis);
        const repoPath = await newRepo();
        commit(repoPath, "[fern-generated] gen 1", { "package.json": pkg("1.0.0"), "src/client.ts": "export {};\n" });
        gitExec(["checkout", "-b", "rogue"], repoPath);
        commit(repoPath, "[fern-generated] rogue side gen", {
            "package.json": pkg("9.9.9"),
            "src/rogue.ts": "export {};\n"
        });
        gitExec(["checkout", "main"], repoPath);
        gitExec(["merge", "--no-ff", "-m", "Merge rogue", "rogue"], repoPath);
        const currentSha = commit(repoPath, "[fern-generated] gen 2", { "package.json": pkg(MAGIC), ...FEATURE });

        const step = new AutoVersionStep(repoPath, makeLogger(), baseConfig);
        const result = await step.execute(
            makeContext(
                fakePreparedReplay({
                    outputDir: repoPath,
                    previousGenerationSha: "0".repeat(40),
                    currentGenerationSha: currentSha
                })
            )
        );

        expect(result.success).toBe(true);
        expect(result.previousVersion).toBe("1.0.0");
        expect(result.version).toBe("1.1.0");
    });

    it.each([
        ["empty string", ""],
        ["a ref name", "HEAD"],
        ["garbage", "not-a-sha"],
        ["shell injection", "0000; rm -rf /"],
        ["non-hex 40 chars", "z".repeat(40)]
    ])("does not trust a malformed recorded SHA (%s) and re-anchors from history", async (_label, recorded) => {
        mockAnalyzeSdkDiff.mockResolvedValue(minorAnalysis);
        const repoPath = await newRepo();
        commit(repoPath, "[fern-generated] gen 1", { "package.json": pkg("1.0.0"), "src/client.ts": "export {};\n" });
        const currentSha = commit(repoPath, "[fern-generated] gen 2", { "package.json": pkg(MAGIC), ...FEATURE });

        const step = new AutoVersionStep(repoPath, makeLogger(), baseConfig);
        const result = await step.execute(
            makeContext(
                fakePreparedReplay({
                    outputDir: repoPath,
                    previousGenerationSha: recorded,
                    currentGenerationSha: currentSha
                })
            )
        );

        expect(result.success).toBe(true);
        expect(result.version).toBe("1.1.0");
        expect(packageVersion(repoPath)).toBe("1.1.0");
    });

    it("degrades to an empty diff (never crashes) when currentGenerationSha is also unreachable", async () => {
        // Worst case: both the recorded SHA and the reported current SHA are unreachable.
        // AutoVersion must not throw — it resolves the version from baseVersion and rewrites
        // the placeholder rather than shipping it.
        const repoPath = await newRepo();
        commit(repoPath, "[fern-generated] gen 1", { "package.json": pkg("1.0.0"), "src/client.ts": "export {};\n" });
        commit(repoPath, "[fern-generated] gen 2", { "package.json": pkg(MAGIC), ...FEATURE });

        const step = new AutoVersionStep(repoPath, makeLogger(), { ...baseConfig, baseVersion: "2.0.0" });
        const result = await step.execute(
            makeContext(
                fakePreparedReplay({
                    outputDir: repoPath,
                    previousGenerationSha: "0".repeat(40),
                    currentGenerationSha: "f".repeat(40)
                })
            )
        );

        expect(result.success).toBe(true);
        expect(packageVersion(repoPath)).not.toContain("fern-placeholder");
        expect(packageVersion(repoPath)).toBe("2.0.0");
    });
});

describe("AutoVersionStep.execute() — pipeline baseVersion overrides diff extraction", () => {
    let repo: TwoGenerations;

    beforeEach(async () => {
        mockAnalyzeSdkDiff.mockReset();
        mockConsolidateChangelog.mockReset();
        // Frameio repro: previous [fern-generated] had 3.2.4; customer manually
        // bumped to 4.1.0 between gens, so fiddle passes baseVersion=4.1.0.
        repo = await setupTwoGenerations({
            previousVersion: "3.2.4",
            featureFile: {
                path: "src/newFeature.ts",
                content: "export function newFeature(): number {\n    return 42;\n}\n"
            }
        });
    });

    afterEach(async () => {
        await repo.cleanup();
    });

    it("bumps from baseVersion (4.1.0 → 4.2.0) instead of regressing to the diff value (3.2.4 → 3.2.5)", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: "MINOR",
            message: "feat: add newFeature helper",
            changelog_entry: "### Added\n- newFeature()",
            version_bump_reason: "New public API."
        });

        const step = new AutoVersionStep(repo.repoPath, makeLogger(), {
            ...baseConfig,
            baseVersion: "4.1.0"
        });
        const prepared = fakePreparedReplay({
            outputDir: repo.repoPath,
            previousGenerationSha: repo.previousSha,
            currentGenerationSha: repo.currentSha
        });

        const result = await step.execute(makeContext(prepared));

        expect(result.success).toBe(true);
        expect(result.previousVersion).toBe("4.1.0");
        expect(result.version).toBe("4.2.0");
        expect(result.versionBump).toBe("MINOR");

        const pkg = JSON.parse(readFileSync(join(repo.repoPath, "package.json"), "utf-8")) as {
            version: string;
        };
        expect(pkg.version).toBe("4.2.0");
    });

    it("falls back to diff extraction when baseVersion is omitted (preserves prior behavior)", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: "PATCH",
            message: "fix: minor",
            changelog_entry: "",
            version_bump_reason: "Internal."
        });

        const step = new AutoVersionStep(repo.repoPath, makeLogger(), baseConfig);
        const prepared = fakePreparedReplay({
            outputDir: repo.repoPath,
            previousGenerationSha: repo.previousSha,
            currentGenerationSha: repo.currentSha
        });

        const result = await step.execute(makeContext(prepared));

        expect(result.success).toBe(true);
        expect(result.previousVersion).toBe("3.2.4");
        expect(result.version).toBe("3.2.5");
    });

    it("ignores a malformed baseVersion and falls back to extraction (shell-injection guard)", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: "PATCH",
            message: "fix: minor",
            changelog_entry: "",
            version_bump_reason: "Internal."
        });

        const step = new AutoVersionStep(repo.repoPath, makeLogger(), {
            ...baseConfig,
            baseVersion: "4.1.0; rm -rf /"
        });
        const prepared = fakePreparedReplay({
            outputDir: repo.repoPath,
            previousGenerationSha: repo.previousSha,
            currentGenerationSha: repo.currentSha
        });

        const result = await step.execute(makeContext(prepared));

        expect(result.success).toBe(true);
        expect(result.previousVersion).toBe("3.2.4");
        expect(result.version).toBe("3.2.5");
    });
});

describe("AutoVersionStep.execute() — placeholder is never treated as a previous version", () => {
    let repo: TwoGenerations;

    beforeEach(async () => {
        mockAnalyzeSdkDiff.mockReset();
        mockConsolidateChangelog.mockReset();
        repo = await setupTwoGenerations({
            previousVersion: "1.0.0",
            featureFile: {
                path: "src/newFeature.ts",
                content: "export function newFeature(): number {\n    return 42;\n}\n"
            }
        });
    });

    afterEach(async () => {
        await repo.cleanup();
    });

    it("ignores a placeholder baseVersion instead of bumping it to 0.0.0-fern-placeholder.0", async () => {
        // Repos that derive their published version from git tags at release time keep the
        // placeholder committed in package.json/.fern/metadata.json, so fiddle hands us
        // baseVersion=0.0.0-fern-placeholder. The placeholder is a valid semver pre-release,
        // so it used to be accepted and advanced as one.
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: "MINOR",
            message: "feat: add newFeature helper",
            changelog_entry: "### Added\n- newFeature()",
            version_bump_reason: "New public API."
        });

        const step = new AutoVersionStep(repo.repoPath, makeLogger(), {
            ...baseConfig,
            baseVersion: "0.0.0-fern-placeholder"
        });
        const prepared = fakePreparedReplay({
            outputDir: repo.repoPath,
            previousGenerationSha: repo.previousSha,
            currentGenerationSha: repo.currentSha
        });

        const result = await step.execute(makeContext(prepared));

        expect(result.success).toBe(true);
        expect(result.previousVersion).toBe("1.0.0");
        expect(result.version).toBe("1.1.0");

        const pkg = JSON.parse(readFileSync(join(repo.repoPath, "package.json"), "utf-8")) as {
            version: string;
        };
        expect(pkg.version).toBe("1.1.0");
    });

    it("ignores an already-mutated placeholder baseVersion (0.0.0-fern-placeholder.0)", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: "PATCH",
            message: "fix: minor",
            changelog_entry: "",
            version_bump_reason: "Internal."
        });

        const step = new AutoVersionStep(repo.repoPath, makeLogger(), {
            ...baseConfig,
            baseVersion: "0.0.0-fern-placeholder.0"
        });
        const prepared = fakePreparedReplay({
            outputDir: repo.repoPath,
            previousGenerationSha: repo.previousSha,
            currentGenerationSha: repo.currentSha
        });

        const result = await step.execute(makeContext(prepared));

        expect(result.success).toBe(true);
        expect(result.previousVersion).toBe("1.0.0");
        expect(result.version).toBe("1.0.1");
    });
});

describe("AutoVersionStep.execute() — placeholder in every resolution source", () => {
    let repo: TwoGenerations;

    beforeEach(async () => {
        mockAnalyzeSdkDiff.mockReset();
        mockConsolidateChangelog.mockReset();
        // Both generations carry the placeholder (the repo never commits a real version,
        // deriving it from git tags at release time instead), so no source yields a real
        // previous version.
        repo = await setupTwoGenerations({
            previousVersion: "0.0.0-fern-placeholder",
            featureFile: {
                path: "src/newFeature.ts",
                content: "export function newFeature(): number {\n    return 42;\n}\n"
            }
        });
    });

    afterEach(async () => {
        await repo.cleanup();
    });

    it("falls back to the initial version rather than advancing the placeholder", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: "MINOR",
            message: "feat: add newFeature helper",
            changelog_entry: "### Added\n- newFeature()",
            version_bump_reason: "New public API."
        });

        const step = new AutoVersionStep(repo.repoPath, makeLogger(), {
            ...baseConfig,
            baseVersion: "0.0.0-fern-placeholder"
        });
        const prepared = fakePreparedReplay({
            outputDir: repo.repoPath,
            previousGenerationSha: repo.previousSha,
            currentGenerationSha: repo.currentSha
        });

        const result = await step.execute(makeContext(prepared));

        expect(result.success).toBe(true);
        expect(result.version).toBe("0.0.1");

        const pkg = JSON.parse(readFileSync(join(repo.repoPath, "package.json"), "utf-8")) as {
            version: string;
        };
        expect(pkg.version).toBe("0.0.1");
    });
});

describe("AutoVersionStep.execute() — pre-release version handling", () => {
    let repo: TwoGenerations;

    beforeEach(async () => {
        mockAnalyzeSdkDiff.mockReset();
        mockConsolidateChangelog.mockReset();
        repo = await setupTwoGenerations({
            previousVersion: "0.0.1",
            featureFile: {
                path: "src/newFeature.ts",
                content: "export function newFeature(): number {\n    return 42;\n}\n"
            }
        });
    });

    afterEach(async () => {
        await repo.cleanup();
    });

    async function runWithBaseVersionAndBump(
        baseVersion: string,
        versionBump: "MAJOR" | "MINOR" | "PATCH" | "NO_CHANGE"
    ) {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: versionBump,
            message: versionBump === "NO_CHANGE" ? "" : "feat: change",
            changelog_entry: versionBump === "NO_CHANGE" ? "" : "### Added\n- change",
            version_bump_reason: "test"
        });
        const step = new AutoVersionStep(repo.repoPath, makeLogger(), {
            ...baseConfig,
            baseVersion
        });
        const prepared = fakePreparedReplay({
            outputDir: repo.repoPath,
            previousGenerationSha: repo.previousSha,
            currentGenerationSha: repo.currentSha
        });
        return step.execute(makeContext(prepared));
    }

    function packageJsonVersion(): string {
        const pkg = JSON.parse(readFileSync(join(repo.repoPath, "package.json"), "utf-8")) as {
            version: string;
        };
        return pkg.version;
    }

    it("PATCH on 4.0.0-beta.2 advances the prerelease counter (4.0.0-beta.3)", async () => {
        const result = await runWithBaseVersionAndBump("4.0.0-beta.2", "PATCH");
        expect(result.success).toBe(true);
        expect(result.previousVersion).toBe("4.0.0-beta.2");
        expect(result.version).toBe("4.0.0-beta.3");
        expect(packageJsonVersion()).toBe("4.0.0-beta.3");
    });

    it("MINOR on 4.0.0-beta.2 stays in the beta line (4.0.0-beta.3)", async () => {
        const result = await runWithBaseVersionAndBump("4.0.0-beta.2", "MINOR");
        expect(result.success).toBe(true);
        expect(result.previousVersion).toBe("4.0.0-beta.2");
        expect(result.version).toBe("4.0.0-beta.3");
        expect(packageJsonVersion()).toBe("4.0.0-beta.3");
    });

    it("MAJOR on 4.0.0-beta.2 stays in the beta line (4.0.0-beta.3) — promotion is never inferred", async () => {
        const result = await runWithBaseVersionAndBump("4.0.0-beta.2", "MAJOR");
        expect(result.success).toBe(true);
        expect(result.previousVersion).toBe("4.0.0-beta.2");
        expect(result.version).toBe("4.0.0-beta.3");
        expect(packageJsonVersion()).toBe("4.0.0-beta.3");
    });

    it("NO_CHANGE on 4.0.0-beta.2 preserves the version verbatim", async () => {
        const result = await runWithBaseVersionAndBump("4.0.0-beta.2", "NO_CHANGE");
        expect(result.success).toBe(true);
        expect(result.previousVersion).toBe("4.0.0-beta.2");
        expect(result.version).toBe("4.0.0-beta.2");
        expect(packageJsonVersion()).toBe("4.0.0-beta.2");
    });

    it("PATCH on 4.0.0-rc.0 advances rc counter (4.0.0-rc.1)", async () => {
        const result = await runWithBaseVersionAndBump("4.0.0-rc.0", "PATCH");
        expect(result.success).toBe(true);
        expect(result.previousVersion).toBe("4.0.0-rc.0");
        expect(result.version).toBe("4.0.0-rc.1");
        expect(packageJsonVersion()).toBe("4.0.0-rc.1");
    });

    it("PATCH on 4.0.0+build.123 drops build metadata and bumps patch (4.0.1)", async () => {
        const result = await runWithBaseVersionAndBump("4.0.0+build.123", "PATCH");
        expect(result.success).toBe(true);
        expect(result.previousVersion).toBe("4.0.0+build.123");
        expect(result.version).toBe("4.0.1");
        expect(packageJsonVersion()).toBe("4.0.1");
    });

    it("PATCH on 4.0.0-rc.2+build.5 drops build metadata and advances rc (4.0.0-rc.3)", async () => {
        const result = await runWithBaseVersionAndBump("4.0.0-rc.2+build.5", "PATCH");
        expect(result.success).toBe(true);
        expect(result.previousVersion).toBe("4.0.0-rc.2+build.5");
        expect(result.version).toBe("4.0.0-rc.3");
        expect(packageJsonVersion()).toBe("4.0.0-rc.3");
    });

    it("PATCH on 4.0.0-0 (numeric prerelease) advances the trailing counter (4.0.0-1)", async () => {
        const result = await runWithBaseVersionAndBump("4.0.0-0", "PATCH");
        expect(result.success).toBe(true);
        expect(result.previousVersion).toBe("4.0.0-0");
        expect(result.version).toBe("4.0.0-1");
        expect(packageJsonVersion()).toBe("4.0.0-1");
    });

    it("PATCH on 1.0.0-alpha.beta.1 (multi-segment prerelease) preserves all earlier segments (1.0.0-alpha.beta.2)", async () => {
        const result = await runWithBaseVersionAndBump("1.0.0-alpha.beta.1", "PATCH");
        expect(result.success).toBe(true);
        expect(result.previousVersion).toBe("1.0.0-alpha.beta.1");
        expect(result.version).toBe("1.0.0-alpha.beta.2");
        expect(packageJsonVersion()).toBe("1.0.0-alpha.beta.2");
    });
});

describe("AutoVersionStep.execute() — first generation", () => {
    let tmpDir: tmp.DirectoryResult;
    let repoPath: string;

    beforeEach(async () => {
        mockAnalyzeSdkDiff.mockReset();
        tmpDir = await tmp.dir({ unsafeCleanup: true });
        repoPath = tmpDir.path;
        gitExec(["init", "-b", "main"], repoPath);
        gitExec(["config", "user.name", "Test"], repoPath);
        gitExec(["config", "user.email", "test@example.com"], repoPath);
        gitExec(["config", "commit.gpgsign", "false"], repoPath);
        writeFileSync(
            join(repoPath, "package.json"),
            JSON.stringify({ name: "test-sdk", version: "0.0.0-fern-placeholder" }, null, 2) + "\n"
        );
        gitExec(["add", "."], repoPath);
        gitExec(["commit", "-m", "[fern-generated] Initial"], repoPath);
    });

    afterEach(async () => {
        await tmpDir.cleanup();
    });

    it("uses baseVersion (or 0.0.1) and commits [fern-autoversion]", async () => {
        const step = new AutoVersionStep(repoPath, makeLogger(), { ...baseConfig, baseVersion: "0.1.0" });
        const prepared = fakePreparedReplay({
            outputDir: repoPath,
            previousGenerationSha: null,
            currentGenerationSha: gitExec(["rev-parse", "HEAD"], repoPath)
        });

        const result = await step.execute(makeContext(prepared));

        expect(result.version).toBe("0.1.0");
        expect(result.commitMessage).toContain("Initial SDK generation");
        const pkg = JSON.parse(readFileSync(join(repoPath, "package.json"), "utf-8")) as {
            version: string;
        };
        expect(pkg.version).toBe("0.1.0");
        expect(mockAnalyzeSdkDiff).not.toHaveBeenCalled();
    });

    it("defaults to 0.0.1 for non-Go languages when baseVersion is omitted", async () => {
        const step = new AutoVersionStep(repoPath, makeLogger(), baseConfig);
        const prepared = fakePreparedReplay({
            outputDir: repoPath,
            previousGenerationSha: null,
            currentGenerationSha: gitExec(["rev-parse", "HEAD"], repoPath)
        });

        const result = await step.execute(makeContext(prepared));
        expect(result.version).toBe("0.0.1");
    });

    it("rejects a baseVersion containing shell metacharacters (injection guard)", async () => {
        // A malformed version string should be rejected by the semver validation
        // in AutoVersionStep before reaching replaceMagicVersion.
        const step = new AutoVersionStep(repoPath, makeLogger(), {
            ...baseConfig,
            baseVersion: "1.0.0'; id>/tmp/fern-autoversion-injection-probe; echo '"
        });
        const prepared = fakePreparedReplay({
            outputDir: repoPath,
            previousGenerationSha: null,
            currentGenerationSha: gitExec(["rev-parse", "HEAD"], repoPath)
        });

        const result = await step.execute(makeContext(prepared));

        expect(result.executed).toBe(true);
        expect(result.success).toBe(false);
        expect(result.errorMessage).toMatch(/not a valid semver/);
        // package.json should remain at the placeholder — no rewrite happened.
        const pkg = JSON.parse(readFileSync(join(repoPath, "package.json"), "utf-8")) as {
            version: string;
        };
        expect(pkg.version).toBe("0.0.0-fern-placeholder");
    });
});

describe("AutoVersionStep.execute() — large-diff chunking", () => {
    let repo: TwoGenerations;

    beforeEach(async () => {
        mockAnalyzeSdkDiff.mockReset();
        mockConsolidateChangelog.mockReset();
        // ~60KB of cleaned diff so chunkDiff produces multiple chunks (MAX_AI_DIFF_BYTES = 40KB).
        repo = await setupTwoGenerations({
            previousVersion: "2.0.0",
            featureFile: {
                path: "src/bigFeature.ts",
                content: "export function bigFeature() {}\n"
            },
            fillerKB: 80
        });
    });

    afterEach(async () => {
        await repo.cleanup();
    });

    it("routes multi-chunk diffs through ConsolidateChangelog when multiple entries are produced", async () => {
        mockAnalyzeSdkDiff.mockImplementation(async (_diff: string) => ({
            version_bump: "MINOR",
            message: "feat: chunked change",
            changelog_entry: `### Added\n- change from chunk ${mockAnalyzeSdkDiff.mock.calls.length}`,
            version_bump_reason: "chunk analysis"
        }));
        mockConsolidateChangelog.mockResolvedValue({
            consolidated_changelog: "### Added\n- Consolidated summary of changes",
            pr_description: "## What's New\n- summary",
            version_bump_reason: "Consolidated reason"
        });

        const step = new AutoVersionStep(repo.repoPath, makeLogger(), baseConfig);
        const prepared = fakePreparedReplay({
            outputDir: repo.repoPath,
            previousGenerationSha: repo.previousSha,
            currentGenerationSha: repo.currentSha
        });

        const result = await step.execute(makeContext(prepared));

        expect(mockAnalyzeSdkDiff.mock.calls.length).toBeGreaterThan(1);
        expect(mockConsolidateChangelog).toHaveBeenCalledTimes(1);
        expect(result.versionBump).toBe("MINOR");
        expect(result.version).toBe("2.1.0");
        expect(result.changelogEntry).toContain("Consolidated summary");
        expect(result.prDescription).toContain("What's New");
    });
});

describe("AutoVersionStep.execute() — Go v2+ module suffix", () => {
    let tmpDir: tmp.DirectoryResult;
    let repoPath: string;
    let previousSha: string;
    let currentSha: string;

    beforeEach(async () => {
        mockAnalyzeSdkDiff.mockReset();
        tmpDir = await tmp.dir({ unsafeCleanup: true });
        repoPath = tmpDir.path;
        gitExec(["init", "-b", "main"], repoPath);
        gitExec(["config", "user.name", "Test"], repoPath);
        gitExec(["config", "user.email", "test@example.com"], repoPath);
        gitExec(["config", "commit.gpgsign", "false"], repoPath);

        // Previous [fern-generated] at v1.9.0
        writeFileSync(join(repoPath, "go.mod"), "module github.com/example/sdk\n\ngo 1.21\n");
        writeFileSync(
            join(repoPath, "client.go"),
            'package sdk\n\nimport "github.com/example/sdk/internal"\n\nfunc Version() string {\n\treturn "v1.9.0"\n}\n'
        );
        mkdirSync(join(repoPath, "internal"), { recursive: true });
        writeFileSync(join(repoPath, "internal/client.go"), "package internal\n");
        gitExec(["add", "."], repoPath);
        gitExec(["commit", "-m", "[fern-generated] v1.9.0"], repoPath);
        previousSha = gitExec(["rev-parse", "HEAD"], repoPath);

        // Current [fern-generated]: placeholder + feature
        writeFileSync(
            join(repoPath, "client.go"),
            'package sdk\n\nimport "github.com/example/sdk/internal"\n\nfunc Version() string {\n\treturn "v0.0.0-fern-placeholder"\n}\n\nfunc Breaking() {}\n'
        );
        gitExec(["add", "."], repoPath);
        gitExec(["commit", "-m", "[fern-generated] placeholder"], repoPath);
        currentSha = gitExec(["rev-parse", "HEAD"], repoPath);
    });

    afterEach(async () => {
        await tmpDir.cleanup();
    });

    it("appends /v2 to the Go module path when MAJOR bump crosses to v2.0.0", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: "MAJOR",
            message: "feat!: breaking Go API change",
            changelog_entry: "### Breaking Changes\n- Removed API",
            version_bump_reason: "Public API removed."
        });

        const step = new AutoVersionStep(repoPath, makeLogger(), {
            ...baseConfig,
            language: "go",
            baseVersion: "v1.9.0"
        });
        const prepared = fakePreparedReplay({
            outputDir: repoPath,
            previousGenerationSha: previousSha,
            currentGenerationSha: currentSha
        });

        const result = await step.execute(makeContext(prepared));

        expect(result.versionBump).toBe("MAJOR");
        expect(result.version).toBe("v2.0.0");

        const goMod = readFileSync(join(repoPath, "go.mod"), "utf-8");
        expect(goMod).toMatch(/module github.com\/example\/sdk\/v2/);
    });
});

describe("AutoVersionStep.execute() — FAI service path (fernToken, no ai config)", () => {
    let repo: TwoGenerations;
    const mockFetch = vi.fn();

    const faiConfig: AutoVersionStepConfig = {
        enabled: true,
        language: "typescript",
        fernToken: "fern-token-123"
    };

    beforeEach(async () => {
        mockAnalyzeSdkDiff.mockReset();
        mockFetch.mockReset();
        vi.stubGlobal("fetch", mockFetch);
        repo = await setupTwoGenerations({
            previousVersion: "1.0.0",
            featureFile: {
                path: "src/newFeature.ts",
                content: "export function newFeature(): number {\n    return 42;\n}\n"
            }
        });
    });

    afterEach(async () => {
        vi.unstubAllGlobals();
        await repo.cleanup();
    });

    function makeStepAndContext() {
        const step = new AutoVersionStep(repo.repoPath, makeLogger(), faiConfig);
        const prepared = fakePreparedReplay({
            outputDir: repo.repoPath,
            previousGenerationSha: repo.previousSha,
            currentGenerationSha: repo.currentSha
        });
        return { step, context: makeContext(prepared) };
    }

    it("calls the FAI service with the fern token and applies the returned analysis", async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                message: "feat: add newFeature helper",
                version_bump: "MINOR",
                changelog_entry: "### Added\n- `newFeature()` helper.",
                version_bump_reason: "New public API surface added."
            })
        });

        const { step, context } = makeStepAndContext();
        const result = await step.execute(context);

        expect(result.success).toBe(true);
        expect(result.version).toBe("1.1.0");
        expect(result.versionBump).toBe("MINOR");
        expect(result.changelogEntry).toContain("newFeature");
        expect(result.versionBumpReason).toBe("New public API surface added.");
        expect(result.commitMessage).toContain("feat: add newFeature helper");
        expect(result.commitMessage).toContain("🌿 Generated with Fern");

        expect(mockAnalyzeSdkDiff).not.toHaveBeenCalled();
        expect(mockFetch).toHaveBeenCalledTimes(1);
        const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
        expect(url).toBe("https://fai.buildwithfern.com/sdks/analyze-commit-diff");
        expect((init.headers as Record<string, string>).Authorization).toBe("Bearer fern-token-123");
        const body = JSON.parse(init.body as string) as Record<string, unknown>;
        expect(typeof body.diff).toBe("string");
        expect(body.language).toBe("typescript");
        expect(body.previous_version).toBe("1.0.0");
    });

    it("treats NO_CHANGE from FAI as a no-bump rewrite to previousVersion", async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ message: "", version_bump: "NO_CHANGE" })
        });

        const { step, context } = makeStepAndContext();
        const result = await step.execute(context);

        expect(result.success).toBe(true);
        expect(result.versionBump).toBe("NO_CHANGE");
        expect(result.version).toBe("1.0.0");
    });

    it("falls back to PATCH when the FAI service returns an error status", async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 500,
            text: async () => "internal error"
        });

        const { step, context } = makeStepAndContext();
        const result = await step.execute(context);

        expect(result.success).toBe(true);
        expect(result.version).toBe("1.0.1");
        expect(result.versionBump).toBe("PATCH");
        expect(result.commitMessage).toContain("SDK regeneration");
        expect(result.changelogEntry).toBeUndefined();
    });

    it("falls back to PATCH when FAI returns malformed optional fields", async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                message: "feat: add newFeature helper",
                version_bump: "MINOR",
                changelog_entry: 123
            })
        });

        const { step, context } = makeStepAndContext();
        const result = await step.execute(context);

        expect(result.success).toBe(true);
        expect(result.version).toBe("1.0.1");
        expect(result.versionBump).toBe("PATCH");
        expect(result.commitMessage).toContain("SDK regeneration");
        expect(result.changelogEntry).toBeUndefined();
    });
});
