import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getLatestVersionOfCli } from "../getLatestVersionOfCli.js";

// Mock the latest-version package
vi.mock("latest-version", () => ({
    default: vi.fn()
}));

// Mock CliCache
vi.mock("../CliCache.js", () => ({
    readCache: vi.fn(),
    writeCache: vi.fn()
}));

import latestVersion from "latest-version";
import { readCache, writeCache } from "../CliCache.js";

const FERN_API_ENV = {
    packageName: "fern-api",
    packageVersion: "1.0.0",
    cliName: "fern"
};

const DEV_ENV = {
    packageName: "@fern-api/cli",
    packageVersion: "0.0.0",
    cliName: "dev-cli"
};

describe("getLatestVersionOfCli", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("non-prod CLI (dev/test)", () => {
        it("should return packageVersion without hitting registry or cache", async () => {
            const result = await getLatestVersionOfCli({ cliEnvironment: DEV_ENV });
            expect(result).toBe("0.0.0");
            expect(latestVersion).not.toHaveBeenCalled();
            expect(readCache).not.toHaveBeenCalled();
            expect(writeCache).not.toHaveBeenCalled();
        });
    });

    describe("prod CLI without useCache", () => {
        it("should always fetch from registry (no cache read)", async () => {
            vi.mocked(latestVersion).mockResolvedValue("2.0.0");

            const result = await getLatestVersionOfCli({ cliEnvironment: FERN_API_ENV });
            expect(result).toBe("2.0.0");
            expect(readCache).not.toHaveBeenCalled();
            expect(latestVersion).toHaveBeenCalledWith("fern-api", { version: "latest" });
            expect(writeCache).toHaveBeenCalledWith("latest-cli-version", "2.0.0");
        });

        it("should fetch from registry even when useCache is explicitly false", async () => {
            vi.mocked(latestVersion).mockResolvedValue("2.0.0");

            const result = await getLatestVersionOfCli({
                cliEnvironment: FERN_API_ENV,
                useCache: false
            });
            expect(result).toBe("2.0.0");
            expect(readCache).not.toHaveBeenCalled();
            expect(latestVersion).toHaveBeenCalled();
        });

        it("should still write to cache even without useCache (populates for future reads)", async () => {
            vi.mocked(latestVersion).mockResolvedValue("3.0.0");

            await getLatestVersionOfCli({ cliEnvironment: FERN_API_ENV });
            expect(writeCache).toHaveBeenCalledWith("latest-cli-version", "3.0.0");
        });
    });

    describe("prod CLI with useCache", () => {
        it("should return cached value when cache hit", async () => {
            vi.mocked(readCache).mockReturnValue("2.5.0");

            const result = await getLatestVersionOfCli({
                cliEnvironment: FERN_API_ENV,
                useCache: true
            });
            expect(result).toBe("2.5.0");
            expect(latestVersion).not.toHaveBeenCalled();
            expect(writeCache).not.toHaveBeenCalled();
        });

        it("should fetch from registry on cache miss", async () => {
            vi.mocked(readCache).mockReturnValue(undefined);
            vi.mocked(latestVersion).mockResolvedValue("2.5.0");

            const result = await getLatestVersionOfCli({
                cliEnvironment: FERN_API_ENV,
                useCache: true
            });
            expect(result).toBe("2.5.0");
            expect(readCache).toHaveBeenCalled();
            expect(latestVersion).toHaveBeenCalled();
            expect(writeCache).toHaveBeenCalledWith("latest-cli-version", "2.5.0");
        });

        it("should use prerelease cache key when includePreReleases is true", async () => {
            vi.mocked(readCache).mockReturnValue("3.0.0-rc1");

            const result = await getLatestVersionOfCli({
                cliEnvironment: FERN_API_ENV,
                includePreReleases: true,
                useCache: true
            });
            expect(result).toBe("3.0.0-rc1");
            expect(readCache).toHaveBeenCalledWith("latest-cli-prerelease-version", expect.any(Number));
        });

        it("should use stable cache key when includePreReleases is false", async () => {
            vi.mocked(readCache).mockReturnValue("2.0.0");

            const result = await getLatestVersionOfCli({
                cliEnvironment: FERN_API_ENV,
                includePreReleases: false,
                useCache: true
            });
            expect(result).toBe("2.0.0");
            expect(readCache).toHaveBeenCalledWith("latest-cli-version", expect.any(Number));
        });
    });

    describe("prerelease version fetching", () => {
        it("should pass 'prerelease' version tag to registry", async () => {
            vi.mocked(latestVersion).mockResolvedValue("3.0.0-rc2");

            const result = await getLatestVersionOfCli({
                cliEnvironment: FERN_API_ENV,
                includePreReleases: true
            });
            expect(result).toBe("3.0.0-rc2");
            expect(latestVersion).toHaveBeenCalledWith("fern-api", { version: "prerelease" });
            expect(writeCache).toHaveBeenCalledWith("latest-cli-prerelease-version", "3.0.0-rc2");
        });
    });
});
