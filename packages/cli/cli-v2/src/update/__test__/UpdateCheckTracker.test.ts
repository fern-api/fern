import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join as pathJoin } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { UpdateCheckTracker } from "../UpdateCheckTracker.js";

describe("UpdateCheckTracker", () => {
    let testDir: AbsoluteFilePath;
    let tracker: UpdateCheckTracker;

    beforeEach(async () => {
        testDir = AbsoluteFilePath.of(pathJoin(tmpdir(), `fern-update-check-test-${randomUUID()}`));
        await mkdir(testDir, { recursive: true });
        tracker = new UpdateCheckTracker({ baseDir: testDir });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    describe("shouldCheck", () => {
        it("returns true when no state exists", async () => {
            expect(await tracker.shouldCheck()).toBe(true);
        });

        it("returns false when last check was within the interval", async () => {
            const now = 1_700_000_000_000;
            await tracker.recordCheck({ latestVersion: "1.0.0", now });
            // 1 hour later, default interval is 24 hours
            expect(await tracker.shouldCheck(now + 60 * 60 * 1000)).toBe(false);
        });

        it("returns true when last check was past the interval", async () => {
            const now = 1_700_000_000_000;
            await tracker.recordCheck({ latestVersion: "1.0.0", now });
            // 25 hours later
            expect(await tracker.shouldCheck(now + 25 * 60 * 60 * 1000)).toBe(true);
        });

        it("respects a custom interval", async () => {
            const shortTracker = new UpdateCheckTracker({ baseDir: testDir, intervalMs: 100 });
            const now = 1_700_000_000_000;
            await shortTracker.recordCheck({ latestVersion: "1.0.0", now });
            expect(await shortTracker.shouldCheck(now + 50)).toBe(false);
            expect(await shortTracker.shouldCheck(now + 200)).toBe(true);
        });
    });

    describe("recordCheck + read", () => {
        it("persists and reads back the last-checked timestamp and version", async () => {
            const now = 1_700_000_000_000;
            await tracker.recordCheck({ latestVersion: "1.2.3", now });
            const state = await tracker.read();
            expect(state).toEqual({ lastCheckedAt: now, latestVersion: "1.2.3" });
        });

        it("returns undefined for a missing file", async () => {
            expect(await tracker.read()).toBeUndefined();
        });

        it("returns undefined for a malformed JSON file", async () => {
            await writeFile(pathJoin(testDir, "update-check.json"), "not json", "utf-8");
            expect(await tracker.read()).toBeUndefined();
        });

        it("returns undefined when lastCheckedAt is missing", async () => {
            await writeFile(pathJoin(testDir, "update-check.json"), JSON.stringify({ foo: "bar" }), "utf-8");
            expect(await tracker.read()).toBeUndefined();
        });
    });
});
