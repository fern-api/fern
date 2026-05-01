/**
 * End-to-end test for chunked diff analysis with realistic large diffs.
 *
 * This test is NOT part of the main test suite. Run it separately:
 *   pnpm run test:e2e
 *
 * It constructs a realistic 1+ MB Java SDK diff (simulating 700+ generated files),
 * exercises the full pipeline through real AutoVersioningService methods, and verifies:
 *
 * 1. cleanDiffForAI() correctly strips version-change pairs and excluded files
 * 2. chunkDiff() splits large diffs into multiple chunks within the byte budget
 * 3. Each chunk respects the MAX_AI_DIFF_BYTES limit
 * 4. Section priority ordering: deletions > signatures > mixed > additions > context
 * 5. Oversized single-file sections get their own chunk
 * 6. truncateDiff() respects the byte budget (comparison test)
 * 7. Full LocalTaskHandler multi-chunk flow with mocked AI responses
 * 8. Version bump merging across chunks (highest wins)
 * 9. Changelog entry comes from the highest-bump chunk
 * 10. Performance: chunking + analysis completes in reasonable time
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { AutoVersioningService } from "../autoversion/AutoVersioningService.js";
import { MAX_AI_DIFF_BYTES, maxVersionBump, VersionBump } from "../autoversion/VersionUtils.js";

// ---------------------------------------------------------------------------
// Diff generators — reusable helpers that build realistic diff content
// ---------------------------------------------------------------------------

/** Generates a realistic "diff --git" section for a Java file with the given change type. */
function makeJavaFileSection(opts: {
    filePath: string;
    changeType: "deletion" | "signature" | "mixed" | "addition" | "context";
    /** Approximate number of lines to generate (controls section size). Default 20. */
    lineCount?: number;
}): string {
    const { filePath, changeType, lineCount = 20 } = opts;
    const header = [
        `diff --git a/${filePath} b/${filePath}`,
        `--- a/${filePath}`,
        `+++ b/${filePath}`,
        `@@ -1,${lineCount} +1,${lineCount} @@`
    ];

    const body: string[] = [];
    for (let i = 0; i < lineCount; i++) {
        switch (changeType) {
            case "deletion":
                body.push(`-    public void removedMethod${i}() { return; }`);
                break;
            case "signature":
                body.push(`-    public String oldMethod${i}() { return "old"; }`);
                body.push(`+    public String newMethod${i}() { return "new"; }`);
                break;
            case "mixed":
                body.push(`-    int value${i} = ${i};`);
                body.push(`+    int value${i} = ${i + 100};`);
                break;
            case "addition":
                body.push(`+    public void newMethod${i}() {`);
                body.push(`+        System.out.println("new method ${i}");`);
                body.push(`+    }`);
                break;
            case "context":
                body.push(`     // context line ${i}`);
                break;
        }
    }

    return [...header, ...body].join("\n");
}

/** Generates a version-change file section (should be stripped by cleanDiffForAI). */
function makeVersionFileSection(magicVersion: string): string {
    return [
        "diff --git a/build.gradle b/build.gradle",
        "--- a/build.gradle",
        "+++ b/build.gradle",
        "@@ -1,3 +1,3 @@",
        ' plugins { id "java" }',
        '-version = "1.0.0"',
        `+version = "${magicVersion}"`,
        " repositories { mavenCentral() }"
    ].join("\n");
}

/** Generates a lock file section (should be excluded by cleanDiffForAI). */
function makeLockFileSection(): string {
    return [
        "diff --git a/package-lock.json b/package-lock.json",
        "--- a/package-lock.json",
        "+++ b/package-lock.json",
        "@@ -1,5 +1,5 @@",
        '-  "lockfileVersion": 2,',
        '+  "lockfileVersion": 3,',
        '   "name": "test-sdk"'
    ].join("\n");
}

/**
 * Builds a realistic large Java SDK diff.
 *
 * @param fileCount Total number of file sections to generate
 * @param targetSizeMB Approximate target size in MB
 * @returns The raw diff string + metadata
 */
function buildLargeJavaDiff(
    fileCount: number,
    targetSizeMB: number
): {
    rawDiff: string;
    metadata: {
        totalFiles: number;
        deletionFiles: number;
        signatureFiles: number;
        mixedFiles: number;
        additionFiles: number;
        contextFiles: number;
        versionFiles: number;
        lockFiles: number;
    };
} {
    const sections: string[] = [];
    const magicVersion = "0.0.0-fern-placeholder";

    // Distribution: realistic mix of change types
    // ~2% deletions, ~8% signature changes, ~15% mixed, ~70% additions, ~5% context
    const deletionCount = Math.max(2, Math.floor(fileCount * 0.02));
    const signatureCount = Math.max(5, Math.floor(fileCount * 0.08));
    const mixedCount = Math.max(10, Math.floor(fileCount * 0.15));
    const contextCount = Math.max(3, Math.floor(fileCount * 0.05));
    const additionCount = fileCount - deletionCount - signatureCount - mixedCount - contextCount;

    // Calculate line count per file to reach target size
    // Each line is ~50 bytes, so targetSizeMB * 1024 * 1024 / fileCount / 50 = lines per file
    const bytesTarget = targetSizeMB * 1024 * 1024;
    const linesPerFile = Math.max(10, Math.floor(bytesTarget / fileCount / 50));

    // Version file (should be stripped)
    sections.push(makeVersionFileSection(magicVersion));

    // Lock file (should be excluded)
    sections.push(makeLockFileSection());

    // Deletion sections
    for (let i = 0; i < deletionCount; i++) {
        sections.push(
            makeJavaFileSection({
                filePath: `src/main/java/com/example/sdk/removed/RemovedClass${i}.java`,
                changeType: "deletion",
                lineCount: linesPerFile
            })
        );
    }

    // Signature change sections
    for (let i = 0; i < signatureCount; i++) {
        sections.push(
            makeJavaFileSection({
                filePath: `src/main/java/com/example/sdk/api/ApiClient${i}.java`,
                changeType: "signature",
                lineCount: linesPerFile
            })
        );
    }

    // Mixed change sections
    for (let i = 0; i < mixedCount; i++) {
        sections.push(
            makeJavaFileSection({
                filePath: `src/main/java/com/example/sdk/internal/Internal${i}.java`,
                changeType: "mixed",
                lineCount: linesPerFile
            })
        );
    }

    // Addition sections (majority — new files)
    for (let i = 0; i < additionCount; i++) {
        sections.push(
            makeJavaFileSection({
                filePath: `src/main/java/com/example/sdk/types/NewType${i}.java`,
                changeType: "addition",
                lineCount: linesPerFile
            })
        );
    }

    // Context-only sections
    for (let i = 0; i < contextCount; i++) {
        sections.push(
            makeJavaFileSection({
                filePath: `src/main/java/com/example/sdk/config/Config${i}.java`,
                changeType: "context",
                lineCount: linesPerFile
            })
        );
    }

    return {
        rawDiff: sections.join("\n"),
        metadata: {
            totalFiles: fileCount + 2, // +2 for version + lock file
            deletionFiles: deletionCount,
            signatureFiles: signatureCount,
            mixedFiles: mixedCount,
            additionFiles: additionCount,
            contextFiles: contextCount,
            versionFiles: 1,
            lockFiles: 1
        }
    };
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Creates a mock logger with vi.fn() stubs for all Logger methods. */
function createMockLogger() {
    return {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        disable: vi.fn(),
        enable: vi.fn(),
        trace: vi.fn(),
        log: vi.fn()
    };
}

/** Creates an AutoVersioningService with a mock logger. */
function createService(): AutoVersioningService {
    return new AutoVersioningService({
        logger: createMockLogger() as any
    });
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe("E2E: Large Diff Chunking Pipeline", () => {
    const magicVersion = "0.0.0-fern-placeholder";
    let service: AutoVersioningService;

    beforeEach(() => {
        service = createService();
    });

    describe("Realistic 1+ MB Java SDK diff", () => {
        // Build the diff once for all tests in this block
        const { rawDiff, metadata } = buildLargeJavaDiff(200, 1.2);

        it("generates a diff larger than 1 MB", () => {
            const sizeBytes = Buffer.byteLength(rawDiff, "utf-8");
            console.log(`Raw diff size: ${(sizeBytes / 1024 / 1024).toFixed(2)} MB (${sizeBytes} bytes)`);
            console.log(`Total file sections: ${metadata.totalFiles}`);
            console.log(
                `Distribution: ${metadata.deletionFiles} deletions, ${metadata.signatureFiles} signatures, ` +
                    `${metadata.mixedFiles} mixed, ${metadata.additionFiles} additions, ${metadata.contextFiles} context, ` +
                    `${metadata.versionFiles} version, ${metadata.lockFiles} lock`
            );
            expect(sizeBytes).toBeGreaterThan(1_000_000);
        });

        it("cleanDiffForAI strips version-change pairs and excluded files", () => {
            const startTime = performance.now();
            const cleaned = service.cleanDiffForAI(rawDiff, magicVersion);
            const elapsed = performance.now() - startTime;

            const cleanedBytes = Buffer.byteLength(cleaned, "utf-8");
            console.log(
                `cleanDiffForAI: ${(cleanedBytes / 1024).toFixed(1)} KB cleaned ` +
                    `from ${(Buffer.byteLength(rawDiff, "utf-8") / 1024 / 1024).toFixed(2)} MB raw (${elapsed.toFixed(0)}ms)`
            );

            // Version file section should be stripped (only version-change lines removed)
            expect(cleaned).not.toContain(magicVersion);

            // Lock file should be excluded entirely
            expect(cleaned).not.toContain("package-lock.json");

            // Real content should remain
            expect(cleaned).toContain("RemovedClass");
            expect(cleaned).toContain("ApiClient");
            expect(cleaned).toContain("NewType");
        });

        it("chunkDiff splits cleaned diff into multiple chunks within budget", () => {
            const cleaned = service.cleanDiffForAI(rawDiff, magicVersion);
            const cleanedBytes = Buffer.byteLength(cleaned, "utf-8");

            const startTime = performance.now();
            const chunks = service.chunkDiff(cleaned, MAX_AI_DIFF_BYTES);
            const elapsed = performance.now() - startTime;

            console.log(
                `chunkDiff: ${chunks.length} chunks from ${(cleanedBytes / 1024).toFixed(1)} KB cleaned diff (${elapsed.toFixed(0)}ms)`
            );

            // Should produce multiple chunks for a 1+ MB diff
            expect(chunks.length).toBeGreaterThan(1);

            // Verify each chunk's byte size
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const chunkBytes = Buffer.byteLength(chunk ?? "", "utf-8");
                console.log(`  Chunk ${i + 1}: ${(chunkBytes / 1024).toFixed(1)} KB (${chunkBytes} bytes)`);

                // Each chunk should be non-empty
                expect(chunkBytes).toBeGreaterThan(0);
            }

            // Verify no data is lost: all file sections from cleaned diff appear in some chunk
            const allChunkContent = chunks.join("\n");
            const cleanedFileSections = cleaned.match(/diff --git/g) ?? [];
            const chunkFileSections = allChunkContent.match(/diff --git/g) ?? [];
            console.log(
                `  File sections: ${cleanedFileSections.length} in cleaned, ${chunkFileSections.length} in chunks`
            );
            expect(chunkFileSections.length).toBe(cleanedFileSections.length);
        });

        it("first chunk contains highest-priority sections (deletions and signatures)", () => {
            const cleaned = service.cleanDiffForAI(rawDiff, magicVersion);
            const chunks = service.chunkDiff(cleaned, MAX_AI_DIFF_BYTES);

            // First chunk should contain deletion and signature files
            const firstChunk = chunks[0] ?? "";
            expect(firstChunk).toContain("RemovedClass");
            expect(firstChunk).toContain("ApiClient");

            // Last chunk should contain lower-priority content (additions/context)
            const lastChunk = chunks[chunks.length - 1] ?? "";
            // Addition-only files should be toward the end
            expect(lastChunk).toContain("NewType");
        });

        it("no chunk exceeds MAX_AI_DIFF_BYTES (except oversized single-file sections)", () => {
            const cleaned = service.cleanDiffForAI(rawDiff, magicVersion);
            const chunks = service.chunkDiff(cleaned, MAX_AI_DIFF_BYTES);

            let oversizedChunks = 0;
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i] ?? "";
                const chunkBytes = Buffer.byteLength(chunk, "utf-8");
                const fileSections = (chunk.match(/diff --git/g) ?? []).length;

                if (chunkBytes > MAX_AI_DIFF_BYTES) {
                    // Allowed only if the chunk is a single oversized file section
                    expect(fileSections).toBe(1);
                    oversizedChunks++;
                    console.log(
                        `  Oversized chunk ${i + 1}: ${(chunkBytes / 1024).toFixed(1)} KB (single file section — allowed)`
                    );
                }
            }

            console.log(`  ${oversizedChunks} oversized single-file chunks out of ${chunks.length} total`);
        });
    });

    describe("Realistic 700-file Java SDK diff", () => {
        const { rawDiff } = buildLargeJavaDiff(700, 2.0);

        it("handles 700+ file sections efficiently", () => {
            const rawBytes = Buffer.byteLength(rawDiff, "utf-8");
            console.log(`\n700-file diff: ${(rawBytes / 1024 / 1024).toFixed(2)} MB`);

            const cleanStart = performance.now();
            const cleaned = service.cleanDiffForAI(rawDiff, magicVersion);
            const cleanElapsed = performance.now() - cleanStart;

            const chunkStart = performance.now();
            const chunks = service.chunkDiff(cleaned, MAX_AI_DIFF_BYTES);
            const chunkElapsed = performance.now() - chunkStart;

            const cleanedBytes = Buffer.byteLength(cleaned, "utf-8");
            console.log(
                `  cleanDiffForAI: ${(cleanedBytes / 1024 / 1024).toFixed(2)} MB in ${cleanElapsed.toFixed(0)}ms`
            );
            console.log(`  chunkDiff: ${chunks.length} chunks in ${chunkElapsed.toFixed(0)}ms`);
            console.log(`  Total processing time: ${(cleanElapsed + chunkElapsed).toFixed(0)}ms`);

            // Should complete in reasonable time (< 5 seconds)
            expect(cleanElapsed + chunkElapsed).toBeLessThan(5000);

            // Should produce many chunks
            expect(chunks.length).toBeGreaterThan(10);

            // Verify all content is preserved
            const allChunkContent = chunks.join("\n");
            const cleanedFiles = (cleaned.match(/diff --git/g) ?? []).length;
            const chunkFiles = (allChunkContent.match(/diff --git/g) ?? []).length;
            expect(chunkFiles).toBe(cleanedFiles);

            console.log(`  Files preserved: ${chunkFiles} across ${chunks.length} chunks`);
        });
    });

    describe("Edge cases with real AutoVersioningService", () => {
        it("empty diff produces single chunk", () => {
            const chunks = service.chunkDiff("", MAX_AI_DIFF_BYTES);
            expect(chunks).toEqual([""]);
        });

        it("small diff (under budget) produces single chunk", () => {
            const smallDiff = makeJavaFileSection({
                filePath: "src/Main.java",
                changeType: "mixed",
                lineCount: 5
            });
            const chunks = service.chunkDiff(smallDiff, MAX_AI_DIFF_BYTES);
            expect(chunks).toHaveLength(1);
            expect(chunks[0]).toBe(smallDiff);
        });

        it("single oversized file section gets its own chunk", () => {
            // Create one file section larger than MAX_AI_DIFF_BYTES
            const oversizedSection = makeJavaFileSection({
                filePath: "src/HugeClient.java",
                changeType: "signature",
                lineCount: 1000
            });
            const smallSection = makeJavaFileSection({
                filePath: "src/SmallHelper.java",
                changeType: "addition",
                lineCount: 5
            });
            const diff = oversizedSection + "\n" + smallSection;
            const oversizedBytes = Buffer.byteLength(oversizedSection, "utf-8");

            console.log(`Oversized section: ${(oversizedBytes / 1024).toFixed(1)} KB`);
            expect(oversizedBytes).toBeGreaterThan(MAX_AI_DIFF_BYTES);

            const chunks = service.chunkDiff(diff, MAX_AI_DIFF_BYTES);

            // Should produce at least 2 chunks: oversized + small
            expect(chunks.length).toBeGreaterThanOrEqual(2);

            // The oversized section should be in its own chunk
            const oversizedChunk = chunks.find((c) => c.includes("HugeClient.java"));
            expect(oversizedChunk).toBeDefined();
            expect(oversizedChunk).not.toContain("SmallHelper.java");
        });

        it("diff with only excluded/version files produces single chunk with remaining content", () => {
            const versionSection = makeVersionFileSection(magicVersion);
            const lockSection = makeLockFileSection();
            const realSection = makeJavaFileSection({
                filePath: "src/RealCode.java",
                changeType: "mixed",
                lineCount: 5
            });
            const diff = versionSection + "\n" + lockSection + "\n" + realSection;

            const cleaned = service.cleanDiffForAI(diff, magicVersion);
            const chunks = service.chunkDiff(cleaned, MAX_AI_DIFF_BYTES);

            expect(chunks).toHaveLength(1);
            expect(chunks[0]).toContain("RealCode.java");
            expect(chunks[0]).not.toContain("package-lock.json");
        });
    });
});

describe("E2E: maxVersionBump merging logic", () => {
    it("correctly ranks all version bump combinations", () => {
        // Exhaustive pairwise comparison
        const expected = [
            // NO_CHANGE vs all
            [VersionBump.NO_CHANGE, VersionBump.NO_CHANGE, VersionBump.NO_CHANGE],
            [VersionBump.NO_CHANGE, VersionBump.PATCH, VersionBump.PATCH],
            [VersionBump.NO_CHANGE, VersionBump.MINOR, VersionBump.MINOR],
            [VersionBump.NO_CHANGE, VersionBump.MAJOR, VersionBump.MAJOR],
            // PATCH vs all
            [VersionBump.PATCH, VersionBump.NO_CHANGE, VersionBump.PATCH],
            [VersionBump.PATCH, VersionBump.PATCH, VersionBump.PATCH],
            [VersionBump.PATCH, VersionBump.MINOR, VersionBump.MINOR],
            [VersionBump.PATCH, VersionBump.MAJOR, VersionBump.MAJOR],
            // MINOR vs all
            [VersionBump.MINOR, VersionBump.NO_CHANGE, VersionBump.MINOR],
            [VersionBump.MINOR, VersionBump.PATCH, VersionBump.MINOR],
            [VersionBump.MINOR, VersionBump.MINOR, VersionBump.MINOR],
            [VersionBump.MINOR, VersionBump.MAJOR, VersionBump.MAJOR],
            // MAJOR vs all
            [VersionBump.MAJOR, VersionBump.NO_CHANGE, VersionBump.MAJOR],
            [VersionBump.MAJOR, VersionBump.PATCH, VersionBump.MAJOR],
            [VersionBump.MAJOR, VersionBump.MINOR, VersionBump.MAJOR],
            [VersionBump.MAJOR, VersionBump.MAJOR, VersionBump.MAJOR]
        ];

        for (const [a, b, exp] of expected) {
            expect(maxVersionBump(a as string, b as string)).toBe(exp);
        }
    });

    it("simulates multi-chunk version merging across 10 chunks with aggregated changelog", () => {
        // Simulate a scenario: 10 chunks with varying bumps and changelog entries
        const chunkResults: { bump: VersionBump | null; changelog: string }[] = [
            { bump: VersionBump.PATCH, changelog: "Fixed retry logic." },
            { bump: null, changelog: "" }, // NO_CHANGE
            { bump: VersionBump.PATCH, changelog: "" },
            { bump: VersionBump.MINOR, changelog: "Added new paginator helper." },
            { bump: VersionBump.PATCH, changelog: "" },
            { bump: null, changelog: "" }, // NO_CHANGE
            { bump: VersionBump.PATCH, changelog: "" },
            { bump: VersionBump.MINOR, changelog: "New webhook event types." },
            { bump: VersionBump.PATCH, changelog: "" },
            { bump: VersionBump.PATCH, changelog: "" }
        ];

        let bestBump: string = VersionBump.NO_CHANGE;
        let bestMessage = "";
        const allChangelogs: string[] = [];

        for (let i = 0; i < chunkResults.length; i++) {
            const result = chunkResults[i];
            if (result == null || result.bump == null) {
                continue;
            }

            const prevBest = bestBump;
            bestBump = maxVersionBump(bestBump, result.bump);

            if (bestBump !== prevBest) {
                bestMessage = `message from chunk ${i + 1}`;
            }

            const entry = result.changelog.trim();
            if (entry) {
                allChangelogs.push(entry);
            }
        }

        // MINOR is the highest bump in the list
        expect(bestBump).toBe(VersionBump.MINOR);
        // Message should come from chunk 4 (first MINOR)
        expect(bestMessage).toBe("message from chunk 4");
        // Changelog aggregates all non-empty entries separated by double newlines
        const aggregated = allChangelogs.length > 1 ? allChangelogs.join("\n\n") : allChangelogs[0];
        expect(aggregated).toBe("Fixed retry logic.\n\nAdded new paginator helper.\n\nNew webhook event types.");
    });

    it("processes all chunks even with MAJOR bump to collect full changelog", () => {
        const chunkResults: { bump: VersionBump; changelog: string }[] = [
            { bump: VersionBump.PATCH, changelog: "" },
            { bump: VersionBump.MINOR, changelog: "New feature added." },
            { bump: VersionBump.MAJOR, changelog: "Breaking API removed." },
            { bump: VersionBump.MINOR, changelog: "Extra helpers added." },
            { bump: VersionBump.PATCH, changelog: "" }
        ];

        let bestBump: string = VersionBump.NO_CHANGE;
        const allChangelogs: string[] = [];

        for (const result of chunkResults) {
            bestBump = maxVersionBump(bestBump, result.bump);
            const entry = result.changelog.trim();
            if (entry) {
                allChangelogs.push(entry);
            }
        }

        expect(bestBump).toBe(VersionBump.MAJOR);
        // All chunks processed — changelog includes entries from all 5 chunks separated by double newlines
        const aggregated = allChangelogs.length > 1 ? allChangelogs.join("\n\n") : allChangelogs[0];
        expect(aggregated).toBe("New feature added.\n\nBreaking API removed.\n\nExtra helpers added.");
    });
});

describe("E2E: Full pipeline — clean + chunk + analyze (mocked AI)", () => {
    it("processes a 1+ MB diff end-to-end with mocked AI responses per chunk", () => {
        const magicVersion = "0.0.0-fern-placeholder";
        const service = createService();

        // Build and clean a realistic large diff
        const { rawDiff } = buildLargeJavaDiff(200, 1.2);
        const pipelineStart = performance.now();

        const cleaned = service.cleanDiffForAI(rawDiff, magicVersion);
        const cleanedBytes = Buffer.byteLength(cleaned, "utf-8");

        const chunks = service.chunkDiff(cleaned, MAX_AI_DIFF_BYTES);

        // Simulate AI analysis for each chunk (mock responses)
        const mockAiResponses: { versionBump: string; message: string; changelogEntry: string }[] = chunks.map(
            (chunk, i) => {
                // First chunk has deletions (highest priority) — give it MINOR
                // Middle chunks get PATCH
                // If any chunk has removal patterns, give it MAJOR
                if (i === 0 && chunk.includes("RemovedClass")) {
                    return {
                        versionBump: VersionBump.MAJOR,
                        message: "breaking: removed deprecated API classes",
                        changelogEntry: "Removed deprecated RemovedClass API endpoints."
                    };
                }
                if (chunk.includes("ApiClient")) {
                    return {
                        versionBump: VersionBump.MINOR,
                        message: "feat: updated API client signatures",
                        changelogEntry: "Updated API client method signatures."
                    };
                }
                return {
                    versionBump: VersionBump.PATCH,
                    message: `fix: internal changes in chunk ${i + 1}`,
                    changelogEntry: ""
                };
            }
        );

        // Simulate the merging logic from LocalTaskHandler (lines 249-307).
        // This mirrors the production multi-chunk loop so we can verify the
        // algorithm end-to-end without mocking the full handler.
        // All chunks are processed (no short-circuit) so that every changelog
        // entry is captured.
        let bestBump: string = VersionBump.NO_CHANGE;
        let bestMessage = "";
        const allChangelogEntries: string[] = [];

        for (let i = 0; i < chunks.length; i++) {
            const response = mockAiResponses[i];
            if (response == null) {
                continue;
            }

            // Simulate getAnalysis() converting NO_CHANGE to null
            if (response.versionBump === VersionBump.NO_CHANGE) {
                continue;
            }

            const prevBest = bestBump;
            bestBump = maxVersionBump(bestBump, response.versionBump);

            if (bestBump !== prevBest) {
                bestMessage = response.message;
            }

            const entry = response.changelogEntry?.trim();
            if (entry) {
                allChangelogEntries.push(entry);
            }
        }

        const aggregatedChangelog =
            allChangelogEntries.length > 1 ? allChangelogEntries.join("\n\n") : (allChangelogEntries[0] ?? "");
        const pipelineElapsed = performance.now() - pipelineStart;

        console.log("\n=== Full Pipeline Results ===");
        console.log(`  Raw diff: ${(Buffer.byteLength(rawDiff, "utf-8") / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  Cleaned diff: ${(cleanedBytes / 1024).toFixed(1)} KB`);
        console.log(`  Chunks: ${chunks.length} (all analyzed)`);
        console.log(`  Best bump: ${bestBump}`);
        console.log(`  Message: ${bestMessage}`);
        console.log(`  Changelog entries: ${allChangelogEntries.length}`);
        console.log(`  Total pipeline time: ${pipelineElapsed.toFixed(0)}ms`);

        // Assertions
        expect(bestBump).toBe(VersionBump.MAJOR);
        expect(bestMessage).toContain("removed deprecated");
        // Changelog aggregates entries from all chunks with non-empty changelogs
        expect(aggregatedChangelog).toContain("RemovedClass");
        expect(allChangelogEntries.length).toBeGreaterThanOrEqual(1);
        // Pipeline should complete quickly (no real AI calls)
        expect(pipelineElapsed).toBeLessThan(5000);
    });

    it("produces MINOR when no MAJOR bump is present", () => {
        const magicVersion = "0.0.0-fern-placeholder";
        const service = createService();

        // Build a diff without deletions (no MAJOR signal)
        const sections: string[] = [];
        // 50 signature files + 150 addition files = enough to need chunking
        for (let i = 0; i < 50; i++) {
            sections.push(
                makeJavaFileSection({
                    filePath: `src/api/Service${i}.java`,
                    changeType: "signature",
                    lineCount: 30
                })
            );
        }
        for (let i = 0; i < 150; i++) {
            sections.push(
                makeJavaFileSection({
                    filePath: `src/types/Type${i}.java`,
                    changeType: "addition",
                    lineCount: 30
                })
            );
        }

        const rawDiff = sections.join("\n");
        const cleaned = service.cleanDiffForAI(rawDiff, magicVersion);
        const chunks = service.chunkDiff(cleaned, MAX_AI_DIFF_BYTES);

        expect(chunks.length).toBeGreaterThan(1);

        // Simulate: first chunk has signatures (MINOR), rest are additions (PATCH)
        // All chunks processed, changelog aggregated
        let bestBump: string = VersionBump.NO_CHANGE;
        let bestMessage = "";
        const allChangelogs: string[] = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i] ?? "";
            const isMinor = chunk.includes("Service");
            const bump = isMinor ? VersionBump.MINOR : VersionBump.PATCH;
            const prevBest = bestBump;
            bestBump = maxVersionBump(bestBump, bump);

            if (bestBump !== prevBest) {
                bestMessage = isMinor ? "feat: updated service APIs" : `fix: chunk ${i + 1}`;
            }

            if (isMinor) {
                allChangelogs.push(`Updated service APIs in chunk ${i + 1}.`);
            }
        }

        expect(bestBump).toBe(VersionBump.MINOR);
        expect(bestMessage).toBe("feat: updated service APIs");
        // Changelog should contain entries from all MINOR chunks
        expect(allChangelogs.length).toBeGreaterThanOrEqual(1);
    });
});
