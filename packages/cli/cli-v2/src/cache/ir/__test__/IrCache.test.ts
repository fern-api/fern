import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { randomUUID } from "crypto";
import { mkdir, rm } from "fs/promises";
import { tmpdir } from "os";
import { join as pathJoin } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { IrCache } from "../IrCache.js";

describe("IrCache", () => {
    let testDir: AbsoluteFilePath;
    let cache: IrCache;

    beforeEach(async () => {
        testDir = AbsoluteFilePath.of(pathJoin(tmpdir(), `fern-ir-cache-test-${randomUUID()}`));
        await mkdir(testDir, { recursive: true });

        const irDir = join(testDir, RelativeFilePath.of("ir"));
        const tmpDir = join(testDir, RelativeFilePath.of("tmp"));
        cache = new IrCache({
            absoluteFilePath: irDir,
            tempPath: tmpDir
        });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    describe("store + lookup", () => {
        it("stores content and looks it up by same hash and version", async () => {
            const hash = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2";
            const irVersion = "v63";
            const content = { types: {}, services: {} };

            await cache.store({ hash, irVersion, content });
            const entry = await cache.lookup({ hash, irVersion });

            expect(entry).toBeDefined();
            expect(entry?.hash).toBe(hash);
            expect(entry?.irVersion).toBe(irVersion);
            expect(entry?.size).toBeGreaterThan(0);
            expect(entry?.createdAt).toBeInstanceOf(Date);
        });
    });

    describe("store + read", () => {
        it("stores content and reads it back with matching structure", async () => {
            const hash = "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3";
            const irVersion = "v63";
            const content = { types: { User: { name: "User" } } };

            const entry = await cache.store({ hash, irVersion, content });
            const readContent = await cache.read(entry);

            expect(JSON.parse(readContent)).toEqual(content);
        });
    });

    describe("cache miss", () => {
        it("returns undefined for a non-existent hash", async () => {
            const entry = await cache.lookup({
                hash: "0000000000000000000000000000000000000000000000000000000000000000",
                irVersion: "v63"
            });
            expect(entry).toBeUndefined();
        });
    });

    describe("multiple IR versions", () => {
        it("stores and looks up entries independently per version", async () => {
            const hash = "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4";
            const contentV63 = { version: "v63", types: {} };
            const contentV62 = { version: "v62", types: {} };

            await cache.store({ hash, irVersion: "v63", content: contentV63 });
            await cache.store({ hash, irVersion: "v62", content: contentV62 });

            const entryV63 = await cache.lookup({ hash, irVersion: "v63" });
            const entryV62 = await cache.lookup({ hash, irVersion: "v62" });

            expect(entryV63).toBeDefined();
            expect(entryV62).toBeDefined();

            if (entryV63 == null || entryV62 == null) {
                return;
            }

            const readV63 = await cache.read(entryV63);
            const readV62 = await cache.read(entryV62);

            expect(JSON.parse(readV63)).toEqual(contentV63);
            expect(JSON.parse(readV62)).toEqual(contentV62);
        });
    });

    describe("content-addressable", () => {
        it("stores same hash and version twice without errors", async () => {
            const hash = "d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5";
            const irVersion = "v63";
            const content = { types: {} };

            const entry1 = await cache.store({ hash, irVersion, content });
            const entry2 = await cache.store({ hash, irVersion, content });

            expect(entry1.absoluteFilePath).toBe(entry2.absoluteFilePath);
        });
    });

    describe("getStats", () => {
        it("returns correct stats across versions", async () => {
            await cache.store({
                hash: "1111111111111111111111111111111111111111111111111111111111111111",
                irVersion: "v63",
                content: { id: 1 }
            });
            await cache.store({
                hash: "2222222222222222222222222222222222222222222222222222222222222222",
                irVersion: "v63",
                content: { id: 2 }
            });
            await cache.store({
                hash: "3333333333333333333333333333333333333333333333333333333333333333",
                irVersion: "v62",
                content: { id: 3 }
            });

            const stats = await cache.getStats();

            expect(stats.entryCount).toBe(3);
            expect(stats.totalSize).toBeGreaterThan(0);
            expect(stats.byVersion["v63"]?.entryCount).toBe(2);
            expect(stats.byVersion["v62"]?.entryCount).toBe(1);
        });

        it("returns zero counts on empty cache", async () => {
            const stats = await cache.getStats();
            expect(stats.entryCount).toBe(0);
            expect(stats.totalSize).toBe(0);
            expect(Object.keys(stats.byVersion)).toHaveLength(0);
        });
    });

    describe("clear", () => {
        it("clears all entries and reports correct counts", async () => {
            const content = { data: "test" };

            await cache.store({
                hash: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                irVersion: "v63",
                content
            });
            await cache.store({
                hash: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
                irVersion: "v62",
                content
            });

            const result = await cache.clear();
            expect(result.deletedCount).toBe(2);
            expect(result.freedSize).toBeGreaterThan(0);

            // Verify entries are gone
            const entry = await cache.lookup({
                hash: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                irVersion: "v63"
            });
            expect(entry).toBeUndefined();
        });

        it("does not delete entries on dry run", async () => {
            const content = { data: "test" };
            const hash = "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";
            const irVersion = "v63";

            await cache.store({ hash, irVersion, content });

            const result = await cache.clear({ dryRun: true });
            expect(result.deletedCount).toBe(1);
            expect(result.freedSize).toBeGreaterThan(0);

            // Entry should still exist
            const entry = await cache.lookup({ hash, irVersion });
            expect(entry).toBeDefined();
        });

        it("returns zero counts on empty cache", async () => {
            const result = await cache.clear();
            expect(result.deletedCount).toBe(0);
            expect(result.freedSize).toBe(0);
        });
    });

    describe("entry path structure", () => {
        it("returns path in expected format: {base}/{version}/sha256/{first2chars}/{hash}.json", () => {
            const hash = "e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6";
            const irVersion = "v63";
            const entryPath = cache.getEntryPath({ irVersion, hash });

            const expected = join(
                cache.absoluteFilePath,
                RelativeFilePath.of("v63"),
                RelativeFilePath.of("sha256"),
                RelativeFilePath.of("e5"),
                RelativeFilePath.of(`${hash}.json`)
            );
            expect(entryPath).toBe(expected);
        });
    });
});
