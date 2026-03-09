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

describe("CliCache", () => {
    let tmpDir: tmp.DirectoryResult;

    beforeEach(async () => {
        tmpDir = await tmp.dir({ unsafeCleanup: true });
        vi.mocked(homedir).mockReturnValue(tmpDir.path);
    });

    afterEach(async () => {
        await tmpDir.cleanup();
        vi.restoreAllMocks();
    });

    describe("writeCache + readCache round-trip", () => {
        it("should write and read back a string value", () => {
            writeCache("test-key", "hello");
            const result = readCache<string>("test-key", 60_000);
            expect(result).toBe("hello");
        });

        it("should write and read back an object value", () => {
            const value = { message: "upgrade available", latestVersion: "1.2.3", fromVersion: "1.0.0" };
            writeCache("nudge", value);
            const result = readCache<typeof value>("nudge", 60_000);
            expect(result).toEqual(value);
        });

        it("should create the .fern cache directory if it does not exist", () => {
            const fernDir = path.join(tmpDir.path, ".fern");
            expect(fs.existsSync(fernDir)).toBe(false);

            writeCache("create-dir-test", "value");

            expect(fs.existsSync(fernDir)).toBe(true);
        });

        it("should write the cache file atomically (no .tmp files left behind)", () => {
            writeCache("atomic-test", "value");

            const fernDir = path.join(tmpDir.path, ".fern");
            const files = fs.readdirSync(fernDir);
            const tmpFiles = files.filter((f) => f.endsWith(".tmp"));
            expect(tmpFiles).toHaveLength(0);
            expect(files).toContain("atomic-test.json");
        });
    });

    describe("TTL expiration", () => {
        it("should return the value when within TTL", () => {
            writeCache("ttl-valid", "fresh-value");
            const result = readCache<string>("ttl-valid", 60_000);
            expect(result).toBe("fresh-value");
        });

        it("should return undefined when TTL has expired", () => {
            // Write a cache entry with an old timestamp
            const fernDir = path.join(tmpDir.path, ".fern");
            fs.mkdirSync(fernDir, { recursive: true });
            const entry = {
                value: "stale-value",
                timestamp: Date.now() - 120_000 // 2 minutes ago
            };
            fs.writeFileSync(path.join(fernDir, "ttl-expired.json"), JSON.stringify(entry), "utf-8");

            const result = readCache<string>("ttl-expired", 60_000); // 1 minute TTL
            expect(result).toBeUndefined();
        });

        it("should return value when exactly at TTL boundary", () => {
            const fernDir = path.join(tmpDir.path, ".fern");
            fs.mkdirSync(fernDir, { recursive: true });
            const entry = {
                value: "boundary-value",
                timestamp: Date.now() - 59_999 // just under 1 minute
            };
            fs.writeFileSync(path.join(fernDir, "ttl-boundary.json"), JSON.stringify(entry), "utf-8");

            const result = readCache<string>("ttl-boundary", 60_000);
            expect(result).toBe("boundary-value");
        });
    });

    describe("cache miss scenarios", () => {
        it("should return undefined for a non-existent key", () => {
            const result = readCache<string>("nonexistent", 60_000);
            expect(result).toBeUndefined();
        });

        it("should return undefined for corrupted JSON", () => {
            const fernDir = path.join(tmpDir.path, ".fern");
            fs.mkdirSync(fernDir, { recursive: true });
            fs.writeFileSync(path.join(fernDir, "corrupted.json"), "not valid json{{{", "utf-8");

            const result = readCache<string>("corrupted", 60_000);
            expect(result).toBeUndefined();
        });

        it("should return undefined for an empty file", () => {
            const fernDir = path.join(tmpDir.path, ".fern");
            fs.mkdirSync(fernDir, { recursive: true });
            fs.writeFileSync(path.join(fernDir, "empty.json"), "", "utf-8");

            const result = readCache<string>("empty", 60_000);
            expect(result).toBeUndefined();
        });

        it("should return undefined for a file missing the timestamp field", () => {
            const fernDir = path.join(tmpDir.path, ".fern");
            fs.mkdirSync(fernDir, { recursive: true });
            fs.writeFileSync(path.join(fernDir, "no-ts.json"), JSON.stringify({ value: "hello" }), "utf-8");

            // timestamp is undefined, so Date.now() - undefined = NaN, which is not < ttlMs
            const result = readCache<string>("no-ts", 60_000);
            expect(result).toBeUndefined();
        });
    });

    describe("overwrite behavior", () => {
        it("should overwrite an existing cache entry", () => {
            writeCache("overwrite-key", "first");
            expect(readCache<string>("overwrite-key", 60_000)).toBe("first");

            writeCache("overwrite-key", "second");
            expect(readCache<string>("overwrite-key", 60_000)).toBe("second");
        });
    });

    describe("error resilience", () => {
        it("should not throw when writing to a read-only directory", () => {
            const fernDir = path.join(tmpDir.path, ".fern");
            fs.mkdirSync(fernDir, { recursive: true });
            // Make the directory read-only
            fs.chmodSync(fernDir, 0o444);

            // Should not throw - best-effort
            expect(() => writeCache("readonly-test", "value")).not.toThrow();

            // Restore permissions for cleanup
            fs.chmodSync(fernDir, 0o755);
        });

        it("should not throw when reading from a non-existent directory", () => {
            // homedir points to tmpDir, but .fern doesn't exist
            expect(() => readCache<string>("no-dir", 60_000)).not.toThrow();
        });
    });

    describe("different value types", () => {
        it("should handle numeric values", () => {
            writeCache("number", 42);
            expect(readCache<number>("number", 60_000)).toBe(42);
        });

        it("should handle boolean values", () => {
            writeCache("bool", true);
            expect(readCache<boolean>("bool", 60_000)).toBe(true);
        });

        it("should handle null values", () => {
            writeCache("null-val", null);
            expect(readCache<null>("null-val", 60_000)).toBeNull();
        });

        it("should handle array values", () => {
            writeCache("array", [1, 2, 3]);
            expect(readCache<number[]>("array", 60_000)).toEqual([1, 2, 3]);
        });
    });
});
