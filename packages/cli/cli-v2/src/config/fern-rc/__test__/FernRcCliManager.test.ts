import { randomUUID } from "crypto";
import { mkdir, rm } from "fs/promises";
import { tmpdir } from "os";
import { join as pathJoin } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FernRcCliManager } from "../FernRcCliManager.js";
import { FernRcSchemaLoader } from "../FernRcSchemaLoader.js";

describe("FernRcCliManager", () => {
    let testHome: string;
    let originalHome: string | undefined;
    let manager: FernRcCliManager;

    beforeEach(async () => {
        testHome = pathJoin(tmpdir(), `fern-rc-cli-test-${randomUUID()}`);
        await mkdir(testHome, { recursive: true });
        originalHome = process.env.HOME;
        process.env.HOME = testHome;
        if (process.platform === "win32") {
            process.env.USERPROFILE = testHome;
        }
        manager = new FernRcCliManager({ loader: new FernRcSchemaLoader() });
    });

    afterEach(async () => {
        await rm(testHome, { recursive: true, force: true });
        if (originalHome != null) {
            process.env.HOME = originalHome;
        } else {
            delete process.env.HOME;
        }
    });

    describe("when no config exists", () => {
        it("returns undefined for active version", async () => {
            expect(await manager.getActiveVersion()).toBeUndefined();
        });

        it("returns an empty list for installed versions", async () => {
            expect(await manager.getInstalledVersions()).toEqual([]);
        });
    });

    describe("addInstalledVersion", () => {
        it("appends a new version", async () => {
            await manager.addInstalledVersion("1.0.0");
            expect(await manager.getInstalledVersions()).toEqual(["1.0.0"]);
        });

        it("is idempotent for an already-tracked version", async () => {
            await manager.addInstalledVersion("1.0.0");
            await manager.addInstalledVersion("1.0.0");
            expect(await manager.getInstalledVersions()).toEqual(["1.0.0"]);
        });

        it("preserves prior versions when adding a new one", async () => {
            await manager.addInstalledVersion("1.0.0");
            await manager.addInstalledVersion("1.1.0");
            expect(await manager.getInstalledVersions()).toEqual(["1.0.0", "1.1.0"]);
        });
    });

    describe("setActiveVersion / getActiveVersion", () => {
        it("persists the active version", async () => {
            await manager.setActiveVersion("1.2.3");
            expect(await manager.getActiveVersion()).toBe("1.2.3");
        });

        it("clears the active version when undefined is passed", async () => {
            await manager.setActiveVersion("1.2.3");
            await manager.setActiveVersion(undefined);
            expect(await manager.getActiveVersion()).toBeUndefined();
        });
    });

    describe("removeInstalledVersion", () => {
        it("removes the version from the installed list", async () => {
            await manager.addInstalledVersion("1.0.0");
            await manager.addInstalledVersion("1.1.0");
            await manager.removeInstalledVersion("1.0.0");
            expect(await manager.getInstalledVersions()).toEqual(["1.1.0"]);
        });

        it("clears the active version when it matches the removed version", async () => {
            await manager.addInstalledVersion("1.0.0");
            await manager.setActiveVersion("1.0.0");
            await manager.removeInstalledVersion("1.0.0");
            expect(await manager.getActiveVersion()).toBeUndefined();
        });

        it("preserves the active version when it does not match", async () => {
            await manager.addInstalledVersion("1.0.0");
            await manager.addInstalledVersion("1.1.0");
            await manager.setActiveVersion("1.1.0");
            await manager.removeInstalledVersion("1.0.0");
            expect(await manager.getActiveVersion()).toBe("1.1.0");
        });
    });
});
