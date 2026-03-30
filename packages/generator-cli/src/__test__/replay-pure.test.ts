import { readFileSync } from "fs";
import { join } from "path";
import tmp from "tmp-promise";
import { vi } from "vitest";
import { parseCommitMessageForPR } from "../pipeline/github/parseCommitMessage";
import {
    formatConflictReason,
    formatReplayPrBody,
    logReplaySummary,
    patchDescription
} from "../pipeline/replay-summary";
import { ensureReplayFernignoreEntries, REPLAY_FERNIGNORE_ENTRIES } from "../replay/fernignore";

// ---------------------------------------------------------------------------
// formatConflictReason
// ---------------------------------------------------------------------------

describe("formatConflictReason", () => {
    it("maps same-line-edit", () => {
        expect(formatConflictReason("same-line-edit")).toBe("The new generation changed the same lines you edited");
    });

    it("maps new-file-both", () => {
        expect(formatConflictReason("new-file-both")).toBe(
            "Both the generator and your customization created this file"
        );
    });

    it("maps base-generation-mismatch", () => {
        expect(formatConflictReason("base-generation-mismatch")).toBe(
            "This customization was from a previous generation"
        );
    });

    it("maps patch-apply-failed", () => {
        expect(formatConflictReason("patch-apply-failed")).toBe(
            "The customization could not be applied to the new code"
        );
    });

    it("returns fallback for undefined", () => {
        expect(formatConflictReason(undefined)).toBe("Your edit overlaps with changes in the new generation");
    });

    it("returns fallback for unknown strings", () => {
        expect(formatConflictReason("some-unknown-reason")).toBe(
            "Your edit overlaps with changes in the new generation"
        );
    });
});

// ---------------------------------------------------------------------------
// patchDescription
// ---------------------------------------------------------------------------

describe("patchDescription", () => {
    it("returns patchMessage when truthy and not 'update'", () => {
        expect(patchDescription({ patchMessage: "add custom auth header", files: ["src/auth.ts"] })).toBe(
            "add custom auth header"
        );
    });

    it("returns 'changes in <file>' when patchMessage is falsy (empty string)", () => {
        expect(patchDescription({ patchMessage: "", files: ["src/client.ts"] })).toBe("changes in src/client.ts");
    });

    it("returns 'changes in <file>' when patchMessage is 'update'", () => {
        expect(patchDescription({ patchMessage: "update", files: ["src/index.ts"] })).toBe("changes in src/index.ts");
    });

    it("returns 'customization' when no files and no useful patchMessage", () => {
        expect(patchDescription({ patchMessage: "", files: [] })).toBe("customization");
    });

    it("returns 'customization' when patchMessage is 'update' and no files", () => {
        expect(patchDescription({ patchMessage: "update", files: [] })).toBe("customization");
    });
});

// ---------------------------------------------------------------------------
// logReplaySummary
// ---------------------------------------------------------------------------

describe("logReplaySummary", () => {
    function makeLogger() {
        return {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        };
    }

    it("does nothing when not executed", () => {
        const logger = makeLogger();
        logReplaySummary({ executed: false, success: true }, logger);
        expect(logger.debug).not.toHaveBeenCalled();
        expect(logger.info).not.toHaveBeenCalled();
        expect(logger.warn).not.toHaveBeenCalled();
        expect(logger.error).not.toHaveBeenCalled();
    });

    it("logs debug line for first-generation flow", () => {
        const logger = makeLogger();
        logReplaySummary(
            { executed: true, success: true, flow: "first-generation", patchesDetected: 0, patchesApplied: 0 },
            logger
        );
        expect(logger.debug).toHaveBeenCalledTimes(1);
        expect(logger.debug.mock.calls[0]?.[0]).toContain("flow=first-generation");
    });

    it("logs info when preserved patches > 0", () => {
        const logger = makeLogger();
        logReplaySummary(
            {
                executed: true,
                success: true,
                flow: "normal-regeneration",
                patchesApplied: 3,
                patchesAbsorbed: 0
            },
            logger
        );
        expect(logger.info).toHaveBeenCalledTimes(1);
        expect(logger.info.mock.calls[0]?.[0]).toContain("customizations preserved");
    });

    it("logs info when only absorbed patches (all applied became part of generated code)", () => {
        const logger = makeLogger();
        logReplaySummary(
            {
                executed: true,
                success: true,
                flow: "normal-regeneration",
                patchesApplied: 2,
                patchesAbsorbed: 2
            },
            logger
        );
        // preserved = applied - absorbed = 0, absorbed > 0 => "now part of generated code"
        expect(logger.info).toHaveBeenCalledTimes(1);
        expect(logger.info.mock.calls[0]?.[0]).toContain("now part of generated code");
    });

    it("logs warn for unresolved patches with file details", () => {
        const logger = makeLogger();
        logReplaySummary(
            {
                executed: true,
                success: false,
                flow: "normal-regeneration",
                patchesApplied: 0,
                patchesAbsorbed: 0,
                unresolvedPatches: [
                    {
                        patchId: "patch-1",
                        patchMessage: "add retry logic",
                        files: ["src/client.ts"],
                        conflictDetails: [{ file: "src/client.ts", conflictReason: "same-line-edit" }]
                    }
                ]
            },
            logger
        );
        // Should have at least 2 warn calls: summary line + patch description + file detail
        expect(logger.warn).toHaveBeenCalled();
        const warnMessages = logger.warn.mock.calls.map((c: unknown[]) => c[0] as string);
        expect(warnMessages.some((m) => m.includes("unresolved"))).toBe(true);
        expect(warnMessages.some((m) => m.includes("src/client.ts"))).toBe(true);
    });

    it("logs warnings from result.warnings", () => {
        const logger = makeLogger();
        logReplaySummary(
            {
                executed: true,
                success: true,
                flow: "normal-regeneration",
                patchesApplied: 0,
                patchesAbsorbed: 0,
                warnings: ["lockfile version mismatch"]
            },
            logger
        );
        expect(logger.warn).toHaveBeenCalled();
        const warnMessages = logger.warn.mock.calls.map((c: unknown[]) => c[0] as string);
        expect(warnMessages.some((m) => m.includes("lockfile version mismatch"))).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// formatReplayPrBody
// ---------------------------------------------------------------------------

describe("formatReplayPrBody", () => {
    it("returns undefined for undefined result", () => {
        expect(formatReplayPrBody(undefined)).toBeUndefined();
    });

    it("returns undefined when result is not executed", () => {
        expect(formatReplayPrBody({ executed: false, success: true })).toBeUndefined();
    });

    it("returns undefined when zero preserved and no unresolved patches", () => {
        expect(
            formatReplayPrBody({
                executed: true,
                success: true,
                patchesApplied: 0,
                patchesAbsorbed: 0,
                unresolvedPatches: []
            })
        ).toBeUndefined();
    });

    it("returns happy-path body with checkbox when preserved > 0 and no conflicts", () => {
        const body = formatReplayPrBody({
            executed: true,
            success: true,
            patchesApplied: 3,
            patchesAbsorbed: 0,
            unresolvedPatches: []
        });
        expect(body).toBeDefined();
        // Checkbox emoji ✅ is U+2705
        expect(body).toContain("\u2705");
        expect(body).toContain("preserved");
        expect(body).not.toContain("Action required");
    });

    it("returns conflict body with markdown table when unresolved patches exist", () => {
        const body = formatReplayPrBody({
            executed: true,
            success: false,
            patchesApplied: 0,
            patchesAbsorbed: 0,
            unresolvedPatches: [
                {
                    patchId: "p1",
                    patchMessage: "add retry logic",
                    files: ["src/client.ts"],
                    conflictDetails: [{ file: "src/client.ts", conflictReason: "same-line-edit" }]
                }
            ]
        });
        expect(body).toBeDefined();
        expect(body).toContain("Action required");
        // Table header
        expect(body).toContain("| File |");
        expect(body).toContain("Your customization");
        expect(body).toContain("Why it conflicted");
        // Table row
        expect(body).toContain("src/client.ts");
        expect(body).toContain("add retry logic");
        expect(body).toContain("The new generation changed the same lines you edited");
    });

    it("includes branch name in resolution instructions when branchName option is provided", () => {
        const body = formatReplayPrBody(
            {
                executed: true,
                success: false,
                patchesApplied: 0,
                patchesAbsorbed: 0,
                unresolvedPatches: [
                    {
                        patchId: "p1",
                        patchMessage: "tweak",
                        files: ["src/api.ts"],
                        conflictDetails: [{ file: "src/api.ts", conflictReason: "patch-apply-failed" }]
                    }
                ]
            },
            { branchName: "fern-bot/my-sdk-branch" }
        );
        expect(body).toContain("fern-bot/my-sdk-branch");
    });

    it("includes clone URL when repoUri option is provided", () => {
        const body = formatReplayPrBody(
            {
                executed: true,
                success: false,
                patchesApplied: 0,
                patchesAbsorbed: 0,
                unresolvedPatches: [
                    {
                        patchId: "p1",
                        patchMessage: "tweak",
                        files: ["src/api.ts"],
                        conflictDetails: [{ file: "src/api.ts", conflictReason: "patch-apply-failed" }]
                    }
                ]
            },
            { branchName: "fern-bot/branch", repoUri: "my-org/my-sdk" }
        );
        expect(body).toContain("my-org/my-sdk");
        expect(body).toContain("git clone");
    });

    it("table rows match number of conflict detail entries across patches", () => {
        const body = formatReplayPrBody({
            executed: true,
            success: false,
            patchesApplied: 1,
            patchesAbsorbed: 0,
            unresolvedPatches: [
                {
                    patchId: "p1",
                    patchMessage: "my patch",
                    files: ["a.ts", "b.ts"],
                    conflictDetails: [
                        { file: "a.ts", conflictReason: "same-line-edit" },
                        { file: "b.ts", conflictReason: "new-file-both" }
                    ]
                }
            ]
        });
        expect(body).toBeDefined();
        // Count table data rows (lines starting with "| `")
        const lines = body?.split("\n") ?? [];
        const dataRows = lines.filter((l) => l.startsWith("| `"));
        expect(dataRows).toHaveLength(2);
        expect(dataRows[0]).toContain("a.ts");
        expect(dataRows[1]).toContain("b.ts");
    });
});

// ---------------------------------------------------------------------------
// parseCommitMessageForPR
// ---------------------------------------------------------------------------

describe("parseCommitMessageForPR", () => {
    it("single-line message -> title is that line, body is default", () => {
        const { prTitle, prBody } = parseCommitMessageForPR("Update SDK");
        expect(prTitle).toBe("Update SDK");
        expect(prBody).toBe("Automated SDK generation by Fern");
    });

    it("multi-line message -> title is first line, body is rest of message", () => {
        const { prTitle, prBody } = parseCommitMessageForPR("Update SDK\n\nAdded new endpoints");
        expect(prTitle).toBe("Update SDK");
        expect(prBody).toBe("Added new endpoints");
    });

    it("with changelogEntry -> body uses changelog when no prDescription", () => {
        const { prTitle, prBody } = parseCommitMessageForPR("Update SDK", "## Changelog\n- feature A");
        expect(prTitle).toBe("Update SDK");
        expect(prBody).toBe("## Changelog\n- feature A");
    });

    it("with prDescription -> prefers prDescription over changelogEntry", () => {
        const { prTitle, prBody } = parseCommitMessageForPR(
            "Update SDK",
            "## Changelog\n- feature A",
            "## Before/After\n```before```\n```after```"
        );
        expect(prTitle).toBe("Update SDK");
        expect(prBody).toBe("## Before/After\n```before```\n```after```");
    });

    it("with versionBumpReason -> prepends to body", () => {
        const { prTitle, prBody } = parseCommitMessageForPR(
            "Update SDK",
            undefined,
            undefined,
            "Minor dependency bump"
        );
        expect(prTitle).toBe("Update SDK");
        expect(prBody).toContain("**Version Bump:** Minor dependency bump");
        expect(prBody).toContain("Automated SDK generation by Fern");
    });

    it("versionBumpReason is prepended before prDescription", () => {
        const { prBody } = parseCommitMessageForPR("Update SDK", undefined, "Custom PR description", "Patch release");
        expect(prBody.startsWith("**Version Bump:** Patch release")).toBe(true);
        expect(prBody).toContain("Custom PR description");
    });

    it("empty message -> default title 'SDK Generation'", () => {
        const { prTitle } = parseCommitMessageForPR("");
        expect(prTitle).toBe("SDK Generation");
    });

    it("blank/whitespace-only message -> default title 'SDK Generation'", () => {
        const { prTitle } = parseCommitMessageForPR("   ");
        expect(prTitle).toBe("SDK Generation");
    });
});

// ---------------------------------------------------------------------------
// fernignore
// ---------------------------------------------------------------------------

describe("fernignore", () => {
    it("REPLAY_FERNIGNORE_ENTRIES contains expected values", () => {
        expect(REPLAY_FERNIGNORE_ENTRIES).toContain(".fern/replay.lock");
        expect(REPLAY_FERNIGNORE_ENTRIES.length).toBeGreaterThanOrEqual(1);
    });

    it("creates .fernignore with entries when no file exists, returns true", async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        try {
            const modified = await ensureReplayFernignoreEntries(dir.path);
            expect(modified).toBe(true);
            const content = readFileSync(join(dir.path, ".fernignore"), "utf-8");
            for (const entry of REPLAY_FERNIGNORE_ENTRIES) {
                expect(content).toContain(entry);
            }
        } finally {
            await dir.cleanup();
        }
    });

    it("appends missing entries to existing .fernignore, returns true", async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        try {
            const fernignorePath = join(dir.path, ".fernignore");
            // Write a .fernignore that has unrelated entries but NOT the replay entries
            const { writeFileSync } = await import("fs");
            writeFileSync(fernignorePath, "node_modules\ndist\n", "utf-8");

            const modified = await ensureReplayFernignoreEntries(dir.path);
            expect(modified).toBe(true);

            const content = readFileSync(fernignorePath, "utf-8");
            // Original entries preserved
            expect(content).toContain("node_modules");
            // Replay entries appended
            for (const entry of REPLAY_FERNIGNORE_ENTRIES) {
                expect(content).toContain(entry);
            }
        } finally {
            await dir.cleanup();
        }
    });

    it("returns false when .fernignore already has all entries", async () => {
        const dir = await tmp.dir({ unsafeCleanup: true });
        try {
            const fernignorePath = join(dir.path, ".fernignore");
            const { writeFileSync } = await import("fs");
            writeFileSync(fernignorePath, REPLAY_FERNIGNORE_ENTRIES.join("\n") + "\n", "utf-8");

            const modified = await ensureReplayFernignoreEntries(dir.path);
            expect(modified).toBe(false);
        } finally {
            await dir.cleanup();
        }
    });
});
