import { BehavioralBump, VersionBump } from "@fern-api/cli-ai";
import crypto from "crypto";

/**
 * The raw AI analysis result cached by AutoVersioningCache.
 * This is intentionally separate from AutoVersionResult because the cache
 * stores the AI decision (bump type + raw message), NOT the generator-specific
 * computed version. Each generator applies its own previousVersion and
 * isWhitelabel to derive the final result.
 */
export interface CachedAnalysis {
    /** The version bump type as returned by the AI. */
    versionBump: VersionBump;
    /** The raw commit message from the AI (before any branding is applied). */
    message: string;
    /** User-facing changelog entry from the AI. Empty string for PATCH, present for MINOR/MAJOR. */
    changelogEntry: string;
}

/**
 * Cached Tier 3 behavioral analysis result.
 * Stored separately from CachedAnalysis because Tier 3 has different
 * fields (behavioral_changes list) and is keyed without previousVersion.
 */
export interface CachedBehavioralAnalysis {
    /** The behavioral bump type as returned by the AI. */
    versionBump: BehavioralBump;
    /** List of behavioral changes found (empty for PATCH). */
    behavioralChanges: string[];
    /** Commit message if changes found, empty string if no changes. */
    message: string;
}

/**
 * Per-invocation in-memory cache that deduplicates AI calls during AUTO versioning.
 *
 * When multiple generators run in a single `fern generate` invocation with
 * identical cleaned diffs, only the first generator calls the AI endpoint.
 * Subsequent generators with the same diff await the same in-flight Promise,
 * ensuring exactly one AI call per unique diff even under concurrent execution.
 *
 * The cache stores Promise<CachedAnalysis | null> (null = NO_CHANGE) so that
 * concurrent callers coalesce onto the same request rather than racing.
 */
export class AutoVersioningCache {
    private readonly cache = new Map<string, Promise<CachedAnalysis | null>>();
    private readonly behavioralCache = new Map<string, Promise<CachedBehavioralAnalysis>>();

    public key(cleanedDiff: string, language: string, previousVersion: string): string {
        return crypto.createHash("sha256").update(`${language}\0${previousVersion}\0${cleanedDiff}`).digest("hex");
    }

    /** Cache key for Tier 3 behavioral analysis (no previousVersion — Tier 3 doesn't use it). */
    public behavioralKey(cleanedDiff: string, language: string): string {
        return crypto.createHash("sha256").update(`behavioral\0${language}\0${cleanedDiff}`).digest("hex");
    }

    /**
     * Returns the cached Promise for the given key, or computes and caches a new one.
     *
     * If a Promise already exists for this key (either resolved or in-flight),
     * the existing Promise is returned — concurrent callers share the same result.
     *
     * If the compute function rejects, the failed Promise is evicted from the cache
     * so that a subsequent caller can retry.
     */
    public getOrCompute(
        key: string,
        compute: () => Promise<CachedAnalysis | null>
    ): { promise: Promise<CachedAnalysis | null>; isHit: boolean } {
        const existing = this.cache.get(key);
        if (existing !== undefined) {
            return { promise: existing, isHit: true };
        }

        const promise = compute().catch((error) => {
            // Evict failed promises so subsequent callers can retry
            this.cache.delete(key);
            throw error;
        });
        this.cache.set(key, promise);
        return { promise, isHit: false };
    }

    /**
     * Same as getOrCompute but for Tier 3 behavioral analysis results.
     * Ensures concurrent generators sharing the same diff get the same Tier 3 decision.
     */
    public getOrComputeBehavioral(
        key: string,
        compute: () => Promise<CachedBehavioralAnalysis>
    ): { promise: Promise<CachedBehavioralAnalysis>; isHit: boolean } {
        const existing = this.behavioralCache.get(key);
        if (existing !== undefined) {
            return { promise: existing, isHit: true };
        }

        const promise = compute().catch((error) => {
            this.behavioralCache.delete(key);
            throw error;
        });
        this.behavioralCache.set(key, promise);
        return { promise, isHit: false };
    }
}
