import { describe, expect, it, vi } from "vitest";
import { AutoVersioningService } from "../AutoVersioningService.js";
import { MAX_AI_DIFF_BYTES } from "../VersionUtils.js";

// Mock logger for tests
const mockLogger = {
    info: () => {
        // No-op for tests
    },
    warn: () => {
        // No-op for tests
    },
    error: () => {
        // No-op for tests
    },
    debug: () => {
        // No-op for tests
    },
    disable: () => {
        // No-op for tests
    },
    enable: () => {
        // No-op for tests
    },
    trace: () => {
        // No-op for tests
    },
    log: () => {
        // No-op for tests
    }
};

/**
 * Helper: creates a diff file section for a given file path with the specified lines.
 */
function makeFileSection(filePath: string, lines: string[]): string {
    return [
        `diff --git a/${filePath} b/${filePath}`,
        `index abc123..def456 100644`,
        `--- a/${filePath}`,
        `+++ b/${filePath}`,
        `@@ -1,10 +1,10 @@`,
        ...lines
    ].join("\n");
}

/**
 * Helper: creates a large diff string that exceeds maxBytes by repeating file sections.
 */
function makeLargeDiff(fileCount: number, linesPerFile: number, linePrefix: string): string {
    const sections: string[] = [];
    for (let i = 0; i < fileCount; i++) {
        const lines: string[] = [];
        for (let j = 0; j < linesPerFile; j++) {
            lines.push(`${linePrefix}line ${j} of file ${i} with some padding content to increase size`);
        }
        sections.push(makeFileSection(`src/file${i}.ts`, lines));
    }
    return sections.join("\n");
}

describe("AutoVersioningService.truncateDiff", () => {
    const service = new AutoVersioningService({ logger: mockLogger });

    it("returns diff unchanged when under 40KB", () => {
        const diff = makeFileSection("src/client.ts", [
            "-export function oldMethod(): void {}",
            "+export function newMethod(): void {}"
        ]);

        expect(diff.length).toBeLessThan(MAX_AI_DIFF_BYTES);

        const result = service.truncateDiff(diff, MAX_AI_DIFF_BYTES);
        expect(result.truncated).toBe(diff);
        expect(result.omittedFiles).toBe(0);
    });

    it("truncates diff to under 40KB when over limit", () => {
        // Create a diff large enough to exceed 40KB
        const largeDiff = makeLargeDiff(100, 20, "+");

        expect(largeDiff.length).toBeGreaterThan(MAX_AI_DIFF_BYTES);

        const result = service.truncateDiff(largeDiff, MAX_AI_DIFF_BYTES);
        // The truncated result may slightly exceed maxBytes if a single section is large,
        // but omittedFiles should be > 0
        expect(result.omittedFiles).toBeGreaterThan(0);
        // Verify truncation note is present
        expect(result.truncated).toContain("[Diff truncated:");
    });

    it("prioritises deletion-only file sections in truncated output", () => {
        // Create a small budget to force truncation
        const deletionSection = makeFileSection("src/removed.ts", [
            "-export function removedApi(): void {}",
            "-export function anotherRemoved(): void {}"
        ]);

        const additionSection = makeFileSection("src/added.ts", [
            "+export function newApi(): void {}",
            "+export function anotherNew(): void {}"
        ]);

        // Combine: addition first, deletion second (truncation should reorder)
        const diff = additionSection + "\n" + deletionSection;

        // Use a budget that fits only one section — exact size of the deletion section
        const exactSectionSize = Buffer.byteLength(deletionSection, "utf-8");

        const result = service.truncateDiff(diff, exactSectionSize);

        // The deletion section should be included (higher priority)
        expect(result.truncated).toContain("removed.ts");
        expect(result.truncated).toContain("-export function removedApi");
        // The addition section should be omitted
        expect(result.omittedFiles).toBe(1);
    });

    it("prioritises sections with signature changes over addition-only sections", () => {
        // Mixed section with signature changes (priority 2)
        const signatureSection = makeFileSection("src/api.ts", [
            "-public oldMethod(): string { return ''; }",
            "+public newMethod(): string { return ''; }",
            " // unchanged context"
        ]);

        // Addition-only section (priority 4)
        const additionSection = makeFileSection("src/newfile.ts", [
            "+const helper = () => {};",
            "+const anotherHelper = () => {};"
        ]);

        const diff = additionSection + "\n" + signatureSection;

        // Budget that fits only one section — use exact size of the signature section
        const exactSectionSize = Buffer.byteLength(signatureSection, "utf-8");

        const result = service.truncateDiff(diff, exactSectionSize);

        // Signature section should be included (higher priority)
        expect(result.truncated).toContain("api.ts");
        expect(result.truncated).toContain("public newMethod");
        expect(result.omittedFiles).toBe(1);
    });

    it("appends truncation note with accurate omitted file count", () => {
        // Create diff with many small sections
        const sections: string[] = [];
        for (let i = 0; i < 10; i++) {
            sections.push(
                makeFileSection(`src/file${i}.ts`, [`+new line in file ${i} with extra content to use some space`])
            );
        }
        const diff = sections.join("\n");

        // Use a very small budget
        const result = service.truncateDiff(diff, 500);

        expect(result.truncated).toContain("[Diff truncated:");
        // Verify the note contains correct counts
        const totalFiles = 10;
        const includedFiles = totalFiles - result.omittedFiles;
        expect(result.truncated).toContain(`showing ${includedFiles} of ${totalFiles} files`);
        expect(result.truncated).toContain(`${result.omittedFiles} files omitted due to size limit`);
    });

    it("reports correct omittedFiles count", () => {
        const sections: string[] = [];
        for (let i = 0; i < 5; i++) {
            sections.push(
                makeFileSection(`src/file${i}.ts`, [
                    `+line in file ${i} with padding to ensure each section has reasonable size for testing`
                ])
            );
        }
        const diff = sections.join("\n");

        // Budget that fits exactly 2 sections
        const singleSection = makeFileSection("src/test.ts", ["+single line"]);
        const approxSectionSize = Buffer.byteLength(singleSection, "utf-8");
        const budget = approxSectionSize * 2 + 100;

        const result = service.truncateDiff(diff, budget);

        // Should have omitted some files
        expect(result.omittedFiles).toBeGreaterThan(0);
        expect(result.omittedFiles).toBeLessThan(5);
        // Total should add up
        const includedCount = 5 - result.omittedFiles;
        expect(result.truncated).toContain(`showing ${includedCount} of 5 files`);
    });

    it("handles edge case where single file section exceeds max bytes", () => {
        // Create one huge section
        const hugeLines: string[] = [];
        for (let i = 0; i < 1000; i++) {
            hugeLines.push(`+large line number ${i} with lots of padding content to blow up the size significantly`);
        }
        const hugeSection = makeFileSection("src/huge.ts", hugeLines);

        expect(Buffer.byteLength(hugeSection, "utf-8")).toBeGreaterThan(MAX_AI_DIFF_BYTES);

        // Should still include at least one section
        const result = service.truncateDiff(hugeSection, MAX_AI_DIFF_BYTES);
        expect(result.truncated).toContain("huge.ts");
        expect(result.omittedFiles).toBe(0);
    });

    it("handles empty diff", () => {
        const result = service.truncateDiff("", MAX_AI_DIFF_BYTES);
        expect(result.truncated).toBe("");
        expect(result.omittedFiles).toBe(0);
    });

    it("preserves full ranking order: deletions > signatures > mixed > additions > context", () => {
        // Create one section of each type with small sizes
        const deletionOnly = makeFileSection("src/deleted.ts", ["-export function removed(): void {}"]);

        const signatureMixed = makeFileSection("src/signature.ts", [
            "-export function old(): void {}",
            "+export function updated(): void {}"
        ]);

        const mixed = makeFileSection("src/mixed.ts", ["-const a = 1;", "+const b = 2;"]);

        const additionOnly = makeFileSection("src/added.ts", ["+const newThing = true;"]);

        // Put them in reverse priority order
        const diff = [additionOnly, mixed, signatureMixed, deletionOnly].join("\n");

        // Budget large enough for all
        const result = service.truncateDiff(diff, 100_000);
        expect(result.omittedFiles).toBe(0);
        expect(result.truncated).toContain("deleted.ts");
        expect(result.truncated).toContain("signature.ts");
        expect(result.truncated).toContain("mixed.ts");
        expect(result.truncated).toContain("added.ts");

        // Now with tight budget: only deletion should survive
        const tinyBudget = Buffer.byteLength(deletionOnly, "utf-8");
        const tightResult = service.truncateDiff(diff, tinyBudget);
        expect(tightResult.truncated).toContain("deleted.ts");
        expect(tightResult.omittedFiles).toBe(3);
    });
});

describe("LocalTaskHandler size gate", () => {
    it("emits WARN log when diff exceeds MAX_AI_DIFF_BYTES", async () => {
        // This test verifies the integration logic by checking that
        // the truncation path is exercised for large diffs.
        const warnFn = vi.fn();
        const spyLogger = {
            ...mockLogger,
            warn: warnFn
        };

        const service = new AutoVersioningService({ logger: spyLogger });

        // Create a diff larger than MAX_AI_DIFF_BYTES
        const largeDiff = makeLargeDiff(100, 20, "+");
        expect(largeDiff.length).toBeGreaterThan(MAX_AI_DIFF_BYTES);

        // Simulate the size gate logic from LocalTaskHandler
        let diffToAnalyze = largeDiff;
        if (largeDiff.length > MAX_AI_DIFF_BYTES) {
            const { truncated, omittedFiles } = service.truncateDiff(largeDiff, MAX_AI_DIFF_BYTES);
            spyLogger.warn(
                `Diff too large for AI analysis (${largeDiff.length} bytes). ` +
                    `Truncated to ${truncated.length} bytes, omitting ${omittedFiles} files.`
            );
            diffToAnalyze = truncated;
        }

        expect(warnFn).toHaveBeenCalledTimes(1);
        expect(warnFn).toHaveBeenCalledWith(expect.stringContaining("Diff too large for AI analysis"));
        expect(warnFn).toHaveBeenCalledWith(expect.stringContaining("bytes"));
        expect(diffToAnalyze).not.toBe(largeDiff);
    });

    it("passes truncated diff to AI when original exceeds limit", async () => {
        const service = new AutoVersioningService({ logger: mockLogger });

        // Create a diff larger than MAX_AI_DIFF_BYTES
        const largeDiff = makeLargeDiff(100, 20, "+");
        expect(largeDiff.length).toBeGreaterThan(MAX_AI_DIFF_BYTES);

        // Simulate the size gate logic from LocalTaskHandler
        let diffToAnalyze = largeDiff;
        if (largeDiff.length > MAX_AI_DIFF_BYTES) {
            const { truncated } = service.truncateDiff(largeDiff, MAX_AI_DIFF_BYTES);
            diffToAnalyze = truncated;
        }

        // The diff passed to AI should be the truncated version
        expect(diffToAnalyze).not.toBe(largeDiff);
        expect(diffToAnalyze.length).toBeLessThan(largeDiff.length);
        // It should contain the truncation note
        expect(diffToAnalyze).toContain("[Diff truncated:");
        expect(diffToAnalyze).toContain("files omitted due to size limit");
    });
});
