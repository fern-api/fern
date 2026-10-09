import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join as pathJoin } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { VersionsCache } from "../VersionsCache.js";

describe("VersionsCache", () => {
    let testDir: AbsoluteFilePath;
    let cache: VersionsCache;

    beforeEach(async () => {
        testDir = AbsoluteFilePath.of(pathJoin(tmpdir(), `fern-versions-cache-test-${randomUUID()}`));
        await mkdir(testDir, { recursive: true });
        cache = new VersionsCache({ absoluteFilePath: testDir });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    async function writeFakeBinary(version: string, binaryName: string, contents: string): Promise<void> {
        const versionDir = cache.getVersionPath(version);
        await mkdir(versionDir, { recursive: true });
        await writeFile(join(versionDir, RelativeFilePath.of(binaryName)), contents, "utf-8");
    }

    describe("paths", () => {
        it("returns a path nested by version", () => {
            const path = cache.getVersionPath("1.2.3");
            expect(path).toMatch(/[/\\]1\.2\.3$/);
        });

        it("returns the binary path inside the version directory", () => {
            const path = cache.getBinaryPath("1.2.3", "fern");
            expect(path).toMatch(/[/\\]1\.2\.3[/\\]fern$/);
        });
    });

    describe("hasVersion", () => {
        it("returns false when no binary exists", async () => {
            expect(await cache.hasVersion("1.0.0", "fern")).toBe(false);
        });

        it("returns true when the binary exists", async () => {
            await writeFakeBinary("1.0.0", "fern", "hello");
            expect(await cache.hasVersion("1.0.0", "fern")).toBe(true);
        });
    });

    describe("listLocalVersions", () => {
        it("returns an empty array when the directory does not exist", async () => {
            const ghostCache = new VersionsCache({
                absoluteFilePath: AbsoluteFilePath.of(pathJoin(tmpdir(), `fern-ghost-${randomUUID()}`))
            });
            expect(await ghostCache.listLocalVersions()).toEqual([]);
        });

        it("returns all version subdirectories", async () => {
            await writeFakeBinary("1.0.0", "fern", "a");
            await writeFakeBinary("1.1.0", "fern", "bb");
            const versions = await cache.listLocalVersions();
            expect(versions.sort()).toEqual(["1.0.0", "1.1.0"]);
        });
    });

    describe("getStats", () => {
        it("reports totalSize and per-version breakdown", async () => {
            await writeFakeBinary("1.0.0", "fern", "x");
            await writeFakeBinary("1.1.0", "fern", "yyy");
            const stats = await cache.getStats();
            expect(stats.entryCount).toBe(2);
            expect(stats.totalSize).toBe(1 + 3);
            expect(stats.byVersion["1.0.0"]?.totalSize).toBe(1);
            expect(stats.byVersion["1.1.0"]?.totalSize).toBe(3);
        });

        it("returns zeros for an empty directory", async () => {
            const stats = await cache.getStats();
            expect(stats).toEqual({ entryCount: 0, totalSize: 0, byVersion: {} });
        });
    });

    describe("removeVersion", () => {
        it("deletes the directory and reports the freed size", async () => {
            await writeFakeBinary("1.0.0", "fern", "hello");
            const result = await cache.removeVersion("1.0.0", false);
            expect(result.deletedCount).toBe(1);
            expect(result.freedSize).toBe(5);
            expect(await cache.hasVersion("1.0.0", "fern")).toBe(false);
        });

        it("does nothing during a dry run", async () => {
            await writeFakeBinary("1.0.0", "fern", "hello");
            const result = await cache.removeVersion("1.0.0", true);
            expect(result.deletedCount).toBe(1);
            expect(result.freedSize).toBe(5);
            expect(await cache.hasVersion("1.0.0", "fern")).toBe(true);
        });

        it("returns zeros for a missing version", async () => {
            const result = await cache.removeVersion("9.9.9", false);
            expect(result).toEqual({ deletedCount: 0, freedSize: 0 });
        });
    });

    describe("clear", () => {
        it("deletes all version directories", async () => {
            await writeFakeBinary("1.0.0", "fern", "x");
            await writeFakeBinary("1.1.0", "fern", "yyy");
            const result = await cache.clear(false);
            expect(result.deletedCount).toBe(2);
            expect(result.freedSize).toBe(4);
            expect(await cache.listLocalVersions()).toEqual([]);
        });

        it("reports counts during a dry run without deleting", async () => {
            await writeFakeBinary("1.0.0", "fern", "x");
            const result = await cache.clear(true);
            expect(result.deletedCount).toBe(1);
            expect(await cache.hasVersion("1.0.0", "fern")).toBe(true);
        });
    });
});
