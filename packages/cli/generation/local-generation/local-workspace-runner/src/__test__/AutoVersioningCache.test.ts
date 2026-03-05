import { describe, expect, it } from "vitest";
import { AutoVersioningCache } from "../AutoVersioningCache.js";
import type { AutoVersionResult } from "../AutoVersioningService.js";

describe("AutoVersioningCache", () => {
    it("calls AI when no cache entry exists", () => {
        const cache = new AutoVersioningCache();
        const key = cache.key("some diff content");
        const result = cache.get(key);
        // undefined means cache miss — caller should invoke AI
        expect(result).toBeUndefined();
    });

    it("returns cached result without calling AI on second identical diff", () => {
        const cache = new AutoVersioningCache();
        const diff = "diff --git a/src/index.ts\n+export const foo = true;";
        const key = cache.key(diff);

        const versionResult: AutoVersionResult = {
            version: "1.3.0",
            commitMessage: "feat: add foo export"
        };
        cache.set(key, versionResult);

        const cached = cache.get(key);
        expect(cached).toEqual(versionResult);
    });

    it("caches NO_CHANGE result and returns it on subsequent identical diff", () => {
        const cache = new AutoVersioningCache();
        const diff = "diff with no semantic changes";
        const key = cache.key(diff);

        // null represents NO_CHANGE
        cache.set(key, null);

        const cached = cache.get(key);
        // null (not undefined) — the diff was analyzed and determined to be NO_CHANGE
        expect(cached).toBeNull();
    });

    it("does not return cached result for a different diff", () => {
        const cache = new AutoVersioningCache();
        const diff1 = "diff --git a/src/index.ts\n+export const foo = true;";
        const diff2 = "diff --git a/src/index.ts\n+export const bar = false;";

        const key1 = cache.key(diff1);
        const key2 = cache.key(diff2);

        expect(key1).not.toBe(key2);

        const versionResult: AutoVersionResult = {
            version: "1.3.0",
            commitMessage: "feat: add foo export"
        };
        cache.set(key1, versionResult);

        // key2 should be a cache miss
        expect(cache.get(key2)).toBeUndefined();
        // key1 should still be a cache hit
        expect(cache.get(key1)).toEqual(versionResult);
    });

    it("generates same cache key for identical diff content", () => {
        const cache = new AutoVersioningCache();
        const diff = "diff --git a/src/index.ts\n+export const foo = true;";

        const key1 = cache.key(diff);
        const key2 = cache.key(diff);

        expect(key1).toBe(key2);
        // Keys should be sha256 hex strings (64 chars)
        expect(key1).toHaveLength(64);
        expect(key1).toMatch(/^[0-9a-f]{64}$/);
    });

    it("does not share cache between separate instances", () => {
        const cache1 = new AutoVersioningCache();
        const cache2 = new AutoVersioningCache();
        const diff = "some diff content";
        const key = cache1.key(diff);

        const versionResult: AutoVersionResult = {
            version: "2.0.0",
            commitMessage: "feat: breaking change"
        };
        cache1.set(key, versionResult);

        // cache2 should not have the entry
        expect(cache2.get(key)).toBeUndefined();
        // cache1 should still have it
        expect(cache1.get(key)).toEqual(versionResult);
    });

    it("makes only one AI call when two generators share identical cleaned diff", async () => {
        // Simulates the integration scenario: two generators with the same cleaned diff
        // should only trigger one AI call, with the second using the cached result.
        const cache = new AutoVersioningCache();
        const cleanedDiff = "diff --git a/src/api.ts\n+export function newEndpoint() {}";

        let aiCallCount = 0;
        const mockAnalyzeWithAI = async (_diff: string): Promise<AutoVersionResult | null> => {
            aiCallCount++;
            return {
                version: "1.3.0",
                commitMessage: "feat: add new endpoint"
            };
        };

        // Simulate first generator's handleAutoVersioning logic
        const cacheKey1 = cache.key(cleanedDiff);
        let result1: AutoVersionResult | null | undefined = cache.get(cacheKey1);
        if (result1 === undefined) {
            // Cache miss — call AI
            result1 = await mockAnalyzeWithAI(cleanedDiff);
            cache.set(cacheKey1, result1);
        }

        // Simulate second generator's handleAutoVersioning logic (same diff)
        const cacheKey2 = cache.key(cleanedDiff);
        let result2: AutoVersionResult | null | undefined = cache.get(cacheKey2);
        if (result2 === undefined) {
            // Cache miss — call AI (should NOT happen)
            result2 = await mockAnalyzeWithAI(cleanedDiff);
            cache.set(cacheKey2, result2);
        }

        // AI should have been called exactly once
        expect(aiCallCount).toBe(1);
        // Both generators should get the same result
        expect(result1).toEqual(result2);
        expect(result1).toEqual({
            version: "1.3.0",
            commitMessage: "feat: add new endpoint"
        });
    });
});
