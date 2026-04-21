import { VersionBump } from "@fern-api/cli-ai";
import { describe, expect, it } from "vitest";
import { AutoVersioningCache, CachedAnalysis } from "../autoversion/AutoVersioningCache.js";

describe("AutoVersioningCache", () => {
    it("calls AI when no cache entry exists", async () => {
        const cache = new AutoVersioningCache();
        const key = cache.key("some diff content", "typescript", "1.0.0");
        let called = false;
        const { promise, isHit } = cache.getOrCompute(key, async () => {
            called = true;
            return {
                versionBump: VersionBump.MINOR,
                message: "feat: new feature",
                changelogEntry: "New feature available."
            };
        });
        expect(isHit).toBe(false);
        await promise;
        expect(called).toBe(true);
    });

    it("returns cached result without calling AI on second identical diff", async () => {
        const cache = new AutoVersioningCache();
        const diff = "diff --git a/src/index.ts\n+export const foo = true;";
        const key = cache.key(diff, "typescript", "1.0.0");

        const analysis: CachedAnalysis = {
            versionBump: VersionBump.MINOR,
            message: "feat: add foo export",
            changelogEntry: "New foo export available."
        };

        // First call — populates cache
        const first = cache.getOrCompute(key, async () => analysis);
        expect(first.isHit).toBe(false);
        expect(await first.promise).toEqual(analysis);

        // Second call — cache hit, compute never invoked
        let secondComputed = false;
        const second = cache.getOrCompute(key, async () => {
            secondComputed = true;
            return { versionBump: VersionBump.PATCH, message: "should not be used", changelogEntry: "" };
        });
        expect(second.isHit).toBe(true);
        expect(await second.promise).toEqual(analysis);
        expect(secondComputed).toBe(false);
    });

    it("caches NO_CHANGE result and returns it on subsequent identical diff", async () => {
        const cache = new AutoVersioningCache();
        const diff = "diff with no semantic changes";
        const key = cache.key(diff, "python", "2.0.0");

        // null represents NO_CHANGE
        const first = cache.getOrCompute(key, async () => null);
        expect(await first.promise).toBeNull();

        // Second call should return cached null without invoking compute
        let secondComputed = false;
        const second = cache.getOrCompute(key, async () => {
            secondComputed = true;
            return { versionBump: VersionBump.PATCH, message: "should not run", changelogEntry: "" };
        });
        expect(second.isHit).toBe(true);
        expect(await second.promise).toBeNull();
        expect(secondComputed).toBe(false);
    });

    it("produces different cache keys for same diff but different language, version, priorChangelog, or specCommitMessage", () => {
        const cache = new AutoVersioningCache();
        const diff = "diff --git a/src/index.ts\n+export const foo = true;";

        const keyTs = cache.key(diff, "typescript", "1.0.0");
        const keyPy = cache.key(diff, "python", "1.0.0");
        const keyTsDiffVer = cache.key(diff, "typescript", "2.0.0");

        // priorChangelog differentiation (4th param)
        const keyWithChangelog = cache.key(diff, "typescript", "1.0.0", "## [1.0.0] prior entry", "");
        const keyWithDiffChangelog = cache.key(diff, "typescript", "1.0.0", "## [0.9.0] other entry", "");
        const keyNoChangelog = cache.key(diff, "typescript", "1.0.0", "");

        // specCommitMessage differentiation (5th param)
        const keyWithSpec = cache.key(diff, "typescript", "1.0.0", "", "add /payments endpoint");
        const keyWithDiffSpec = cache.key(diff, "typescript", "1.0.0", "", "remove /users endpoint");
        const keyNoSpec = cache.key(diff, "typescript", "1.0.0", "", "");

        // Same diff but different language → different keys
        expect(keyTs).not.toBe(keyPy);
        // Same diff and language but different previous version → different keys
        expect(keyTs).not.toBe(keyTsDiffVer);

        // Different priorChangelog → different keys
        expect(keyTs).not.toBe(keyWithChangelog);
        expect(keyWithChangelog).not.toBe(keyWithDiffChangelog);
        // Empty string priorChangelog matches default (no arg)
        expect(keyTs).toBe(keyNoChangelog);

        // Different specCommitMessage → different keys
        expect(keyTs).not.toBe(keyWithSpec);
        expect(keyWithSpec).not.toBe(keyWithDiffSpec);
        // Empty string specCommitMessage matches default (no arg)
        expect(keyTs).toBe(keyNoSpec);
    });

    it("does not return cached result for a different diff", async () => {
        const cache = new AutoVersioningCache();
        const diff1 = "diff --git a/src/index.ts\n+export const foo = true;";
        const diff2 = "diff --git a/src/index.ts\n+export const bar = false;";

        const key1 = cache.key(diff1, "typescript", "1.0.0");
        const key2 = cache.key(diff2, "typescript", "1.0.0");

        expect(key1).not.toBe(key2);

        const analysis1: CachedAnalysis = {
            versionBump: VersionBump.MINOR,
            message: "feat: add foo",
            changelogEntry: "New foo capability."
        };
        cache.getOrCompute(key1, async () => analysis1);

        // key2 should trigger a fresh compute
        let key2Computed = false;
        const analysis2: CachedAnalysis = { versionBump: VersionBump.PATCH, message: "fix: bar", changelogEntry: "" };
        const result2 = cache.getOrCompute(key2, async () => {
            key2Computed = true;
            return analysis2;
        });
        expect(result2.isHit).toBe(false);
        expect(key2Computed).toBe(true);
    });

    it("generates same cache key for identical diff content", () => {
        const cache = new AutoVersioningCache();
        const diff = "diff --git a/src/index.ts\n+export const foo = true;";

        const key1 = cache.key(diff, "java", "3.0.0");
        const key2 = cache.key(diff, "java", "3.0.0");

        expect(key1).toBe(key2);
        // Keys should be sha256 hex strings (64 chars)
        expect(key1).toHaveLength(64);
        expect(key1).toMatch(/^[0-9a-f]{64}$/);
    });

    it("does not share cache between separate instances", async () => {
        const cache1 = new AutoVersioningCache();
        const cache2 = new AutoVersioningCache();
        const diff = "some diff content";
        const key = cache1.key(diff, "typescript", "1.0.0");

        const analysis: CachedAnalysis = {
            versionBump: VersionBump.MAJOR,
            message: "feat: breaking change",
            changelogEntry: "Breaking change: migration required."
        };
        await cache1.getOrCompute(key, async () => analysis).promise;

        // cache2 should not have the entry — compute is invoked
        let cache2Computed = false;
        const result = cache2.getOrCompute(key, async () => {
            cache2Computed = true;
            return analysis;
        });
        expect(result.isHit).toBe(false);
        expect(cache2Computed).toBe(true);
    });

    it("makes only one AI call when two concurrent generators share identical cleaned diff", async () => {
        const cache = new AutoVersioningCache();
        const cleanedDiff = "diff --git a/src/api.ts\n+export function newEndpoint() {}";

        let aiCallCount = 0;
        const mockAI = async (): Promise<CachedAnalysis> => {
            aiCallCount++;
            // Simulate async AI latency
            await new Promise((resolve) => setTimeout(resolve, 10));
            return {
                versionBump: VersionBump.MINOR,
                message: "feat: add new endpoint",
                changelogEntry: "New endpoint available."
            };
        };

        const key = cache.key(cleanedDiff, "typescript", "1.0.0");

        // Fire two concurrent getOrCompute calls (simulating Promise.all generators)
        const [r1, r2] = await Promise.all([
            cache.getOrCompute(key, mockAI).promise,
            cache.getOrCompute(key, mockAI).promise
        ]);

        // AI should have been called exactly once
        expect(aiCallCount).toBe(1);
        // Both generators receive the same raw analysis
        expect(r1).toEqual(r2);
        expect(r1).toEqual({
            versionBump: VersionBump.MINOR,
            message: "feat: add new endpoint",
            changelogEntry: "New endpoint available."
        });
    });

    it("evicts failed promises so subsequent callers can retry", async () => {
        const cache = new AutoVersioningCache();
        const key = cache.key("some diff", "python", "0.1.0");

        // First call fails
        const first = cache.getOrCompute(key, async () => {
            throw new Error("AI service unavailable");
        });
        await expect(first.promise).rejects.toThrow("AI service unavailable");

        // Second call should be a miss (failed promise was evicted) and can succeed
        let secondCalled = false;
        const second = cache.getOrCompute(key, async () => {
            secondCalled = true;
            return { versionBump: VersionBump.PATCH, message: "fix: retry succeeded", changelogEntry: "" };
        });
        expect(second.isHit).toBe(false);
        expect(secondCalled).toBe(true);
        expect(await second.promise).toEqual({
            versionBump: VersionBump.PATCH,
            message: "fix: retry succeeded",
            changelogEntry: ""
        });
    });
});
