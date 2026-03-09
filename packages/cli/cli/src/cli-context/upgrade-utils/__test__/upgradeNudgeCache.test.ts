import fs from "fs";
import path from "path";
import tmp from "tmp-promise";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { readCache, writeCache } from "../CliCache.js";

// Mock the homedir to use a temp directory for isolation
vi.mock("os", async () => {
    const actual = await vi.importActual<typeof import("os")>("os");
    return {
        ...actual,
        homedir: vi.fn()
    };
});

import { homedir } from "os";

interface UpgradeNudgeCache {
    message: string;
    latestVersion: string;
    fromVersion: string;
}

const UPGRADE_NUDGE_CACHE_KEY = "upgrade-nudge-message";
const UPGRADE_NUDGE_CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

/**
 * Mirrors the validation logic in CliContext.nudgeUpgradeIfAvailable().
 * This function is extracted here so we can test the cache validation
 * independently of the full CliContext.
 */
function isCachedNudgeRelevant(
    cached: UpgradeNudgeCache | undefined,
    currentVersion: string,
    isVersionAhead: (a: string, b: string) => boolean
): boolean {
    return (
        cached != null &&
        cached.message.length > 0 &&
        cached.fromVersion === currentVersion &&
        isVersionAhead(cached.latestVersion, currentVersion)
    );
}

describe("upgrade nudge cache validation", () => {
    let tmpDir: tmp.DirectoryResult;

    beforeEach(async () => {
        tmpDir = await tmp.dir({ unsafeCleanup: true });
        vi.mocked(homedir).mockReturnValue(tmpDir.path);
    });

    afterEach(async () => {
        await tmpDir.cleanup();
        vi.restoreAllMocks();
    });

    describe("fromVersion validation", () => {
        it("should accept cached nudge when fromVersion matches current version", () => {
            const cached: UpgradeNudgeCache = {
                message: "Upgrade available: 1.0.0 -> 2.0.0\n",
                latestVersion: "2.0.0",
                fromVersion: "1.0.0"
            };
            const alwaysAhead = () => true;

            expect(isCachedNudgeRelevant(cached, "1.0.0", alwaysAhead)).toBe(true);
        });

        it("should reject cached nudge when user upgraded to intermediate version", () => {
            const cached: UpgradeNudgeCache = {
                message: "Upgrade available: 1.0.0 -> 2.0.0\n",
                latestVersion: "2.0.0",
                fromVersion: "1.0.0"
            };
            const alwaysAhead = () => true;

            // User upgraded from 1.0.0 to 1.5.0 — cached fromVersion doesn't match
            expect(isCachedNudgeRelevant(cached, "1.5.0", alwaysAhead)).toBe(false);
        });

        it("should reject cached nudge when user upgraded to the latest version", () => {
            const cached: UpgradeNudgeCache = {
                message: "Upgrade available: 1.0.0 -> 2.0.0\n",
                latestVersion: "2.0.0",
                fromVersion: "1.0.0"
            };
            const neverAhead = () => false;

            // User is now on 2.0.0 — fromVersion doesn't match AND latestVersion is not ahead
            expect(isCachedNudgeRelevant(cached, "2.0.0", neverAhead)).toBe(false);
        });
    });

    describe("latestVersion validation", () => {
        it("should reject cached nudge when latest is no longer ahead", () => {
            const cached: UpgradeNudgeCache = {
                message: "Upgrade available: 1.0.0 -> 2.0.0\n",
                latestVersion: "2.0.0",
                fromVersion: "1.0.0"
            };
            const neverAhead = () => false;

            expect(isCachedNudgeRelevant(cached, "1.0.0", neverAhead)).toBe(false);
        });
    });

    describe("empty/cleared cache", () => {
        it("should reject cached nudge with empty message (cleared cache)", () => {
            const cached: UpgradeNudgeCache = {
                message: "",
                latestVersion: "",
                fromVersion: "1.0.0"
            };
            const alwaysAhead = () => true;

            expect(isCachedNudgeRelevant(cached, "1.0.0", alwaysAhead)).toBe(false);
        });

        it("should reject when cached is undefined (no cache file)", () => {
            const alwaysAhead = () => true;
            expect(isCachedNudgeRelevant(undefined, "1.0.0", alwaysAhead)).toBe(false);
        });
    });

    describe("round-trip with CliCache", () => {
        it("should store and retrieve nudge cache correctly", () => {
            const nudge: UpgradeNudgeCache = {
                message: "Upgrade available: 1.0.0 -> 2.0.0\n",
                latestVersion: "2.0.0",
                fromVersion: "1.0.0"
            };

            writeCache<UpgradeNudgeCache>(UPGRADE_NUDGE_CACHE_KEY, nudge);
            const cached = readCache<UpgradeNudgeCache>(UPGRADE_NUDGE_CACHE_KEY, UPGRADE_NUDGE_CACHE_TTL_MS);

            expect(cached).toEqual(nudge);
        });

        it("should return undefined for expired nudge cache", () => {
            const fernDir = path.join(tmpDir.path, ".fern");
            fs.mkdirSync(fernDir, { recursive: true });

            const entry = {
                value: {
                    message: "Upgrade available\n",
                    latestVersion: "2.0.0",
                    fromVersion: "1.0.0"
                },
                timestamp: Date.now() - 5 * 60 * 60 * 1000 // 5 hours ago (> 4 hour TTL)
            };
            fs.writeFileSync(path.join(fernDir, `${UPGRADE_NUDGE_CACHE_KEY}.json`), JSON.stringify(entry), "utf-8");

            const cached = readCache<UpgradeNudgeCache>(UPGRADE_NUDGE_CACHE_KEY, UPGRADE_NUDGE_CACHE_TTL_MS);
            expect(cached).toBeUndefined();
        });

        it("should overwrite old nudge when new version is available", () => {
            const oldNudge: UpgradeNudgeCache = {
                message: "Upgrade: 1.0.0 -> 1.5.0\n",
                latestVersion: "1.5.0",
                fromVersion: "1.0.0"
            };
            writeCache<UpgradeNudgeCache>(UPGRADE_NUDGE_CACHE_KEY, oldNudge);

            const newNudge: UpgradeNudgeCache = {
                message: "Upgrade: 1.5.0 -> 2.0.0\n",
                latestVersion: "2.0.0",
                fromVersion: "1.5.0"
            };
            writeCache<UpgradeNudgeCache>(UPGRADE_NUDGE_CACHE_KEY, newNudge);

            const cached = readCache<UpgradeNudgeCache>(UPGRADE_NUDGE_CACHE_KEY, UPGRADE_NUDGE_CACHE_TTL_MS);
            expect(cached).toEqual(newNudge);
        });

        it("should clear nudge cache when no upgrade is available", () => {
            // First, write a valid nudge
            writeCache<UpgradeNudgeCache>(UPGRADE_NUDGE_CACHE_KEY, {
                message: "Upgrade: 1.0.0 -> 2.0.0\n",
                latestVersion: "2.0.0",
                fromVersion: "1.0.0"
            });

            // Then clear it (as CliContext does when no upgrade is available)
            writeCache<UpgradeNudgeCache>(UPGRADE_NUDGE_CACHE_KEY, {
                message: "",
                latestVersion: "",
                fromVersion: "2.0.0"
            });

            const cached = readCache<UpgradeNudgeCache>(UPGRADE_NUDGE_CACHE_KEY, UPGRADE_NUDGE_CACHE_TTL_MS);
            expect(cached).toBeDefined();
            expect(cached?.message).toBe("");
            // The cleared cache should not be considered relevant
            expect(isCachedNudgeRelevant(cached, "2.0.0", () => true)).toBe(false);
        });
    });
});
