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
    b: {
        withOptions: () => ({
            AnalyzeSdkDiff: mockAnalyzeSdkDiff,
            ConsolidateChangelog: mockConsolidateChangelog
        })
    },
    configureBamlClient: mockConfigureBamlClient,
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
 * `previousGenerationSha`, `currentGenerationSha`, and `baseBranchHead` only;
 * `_service` and `_preparation` are never dereferenced inside execute().
 */
function fakePreparedReplay(overrides: Partial<PreparedReplay>): PreparedReplay {
    return {
        _service: {} as unknown as PreparedReplay["_service"],
        _preparation: {} as unknown as PreparedReplay["_preparation"],
        outputDir: overrides.outputDir ?? "/tmp/fake",
        flow: overrides.flow ?? "normal-regeneration",
        previousGenerationSha: overrides.previousGenerationSha ?? null,
        currentGenerationSha: overrides.currentGenerationSha ?? "unused",
        baseBranchHead: overrides.baseBranchHead ?? null
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

    it("returns success without commit when generationCommit is absent from context", async () => {
        const step = new AutoVersionStep("/tmp/fake", makeLogger(), baseConfig);
        const result = await step.execute(makeContext(undefined));
        expect(result).toEqual({ executed: true, success: true });
        expect(mockAnalyzeSdkDiff).not.toHaveBeenCalled();
    });

    it("returns success without commit when preparedReplay is null (no lockfile)", async () => {
        const step = new AutoVersionStep("/tmp/fake", makeLogger(), baseConfig);
        const result = await step.execute(makeContext(null));
        expect(result).toEqual({ executed: true, success: true });
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
        // A semver-shaped prefix followed by a single quote would escape the
        // single-quoted sed expression in AutoVersioningService.replaceMagicVersion.
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
