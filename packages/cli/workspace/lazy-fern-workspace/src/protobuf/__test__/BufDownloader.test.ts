import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { access, chmod, mkdir, readFile, rm, stat, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const FAKE_BINARY_CONTENT = "#!/bin/sh\necho fake-buf\n";

function createMockLogger(): Logger {
    return {
        disable: vi.fn(),
        enable: vi.fn(),
        trace: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn()
    };
}

async function fileExists(filePath: string): Promise<boolean> {
    try {
        await access(filePath);
        return true;
    } catch {
        return false;
    }
}

describe("BufDownloader", () => {
    let tempHomeDir: string;
    let logger: Logger;

    beforeEach(async () => {
        tempHomeDir = (await tmp.dir({ unsafeCleanup: true })).path;
        logger = createMockLogger();

        // Reset module registry so vi.doMock takes effect on next dynamic import
        vi.resetModules();

        // Mock os.homedir() to use our temp directory
        vi.doMock("os", async () => {
            const actual = await vi.importActual<typeof import("os")>("os");
            return {
                ...actual,
                default: {
                    ...actual,
                    homedir: () => tempHomeDir,
                    platform: actual.platform,
                    arch: actual.arch
                }
            };
        });
    });

    afterEach(async () => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        await rm(tempHomeDir, { recursive: true, force: true });
    });

    function getCacheDir(): string {
        return path.join(tempHomeDir, ".fern", "bin");
    }

    function getBinaryName(): string {
        return process.platform === "win32" ? "buf.exe" : "buf";
    }

    function getVersionedBinaryName(version: string): string {
        const ext = process.platform === "win32" ? ".exe" : "";
        return `buf-${version}${ext}`;
    }

    describe("fresh download", () => {
        it("downloads and caches binary on first invocation", async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                statusText: "OK",
                arrayBuffer: () => Promise.resolve(new TextEncoder().encode(FAKE_BINARY_CONTENT).buffer)
            });
            vi.stubGlobal("fetch", mockFetch);

            const { resolveBuf } = await import("../BufDownloader.js");
            const result = await resolveBuf(logger);

            // Should return the full path to the canonical binary
            const expectedPath = path.join(getCacheDir(), getBinaryName());
            expect(result).toBe(AbsoluteFilePath.of(expectedPath));

            // Should have called fetch once
            expect(mockFetch).toHaveBeenCalledOnce();
            const fetchUrl = mockFetch.mock.calls[0]?.[0] as string;
            expect(fetchUrl).toContain("bufbuild/buf/releases/download");

            // Versioned binary should exist
            const versionedPath = path.join(getCacheDir(), getVersionedBinaryName("v1.50.0"));
            expect(await fileExists(versionedPath)).toBe(true);

            // Canonical binary should exist
            const canonicalPath = path.join(getCacheDir(), getBinaryName());
            expect(await fileExists(canonicalPath)).toBe(true);

            // Version marker should exist with correct content
            const markerPath = path.join(getCacheDir(), "buf.version");
            expect(await fileExists(markerPath)).toBe(true);
            const markerContent = await readFile(markerPath, "utf-8");
            expect(markerContent.trim()).toBe("v1.50.0");

            // Lock directory should be cleaned up
            const lockPath = path.join(getCacheDir(), "buf.lock");
            expect(await fileExists(lockPath)).toBe(false);

            vi.unstubAllGlobals();
        });
    });

    describe("cache hit (fast path)", () => {
        it("returns immediately when versioned binary and marker already exist", async () => {
            // Pre-populate cache
            const cacheDir = getCacheDir();
            await mkdir(cacheDir, { recursive: true });

            const versionedPath = path.join(cacheDir, getVersionedBinaryName("v1.50.0"));
            await writeFile(versionedPath, FAKE_BINARY_CONTENT);
            await chmod(versionedPath, 0o755);

            const canonicalPath = path.join(cacheDir, getBinaryName());
            await writeFile(canonicalPath, FAKE_BINARY_CONTENT);
            await chmod(canonicalPath, 0o755);

            const markerPath = path.join(cacheDir, "buf.version");
            await writeFile(markerPath, "v1.50.0");

            // fetch should NOT be called
            const mockFetch = vi.fn();
            vi.stubGlobal("fetch", mockFetch);

            const { resolveBuf } = await import("../BufDownloader.js");
            const result = await resolveBuf(logger);

            expect(result).toBe(AbsoluteFilePath.of(canonicalPath));
            expect(mockFetch).not.toHaveBeenCalled();

            // Info log should indicate cache hit
            expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Using cached buf"));

            vi.unstubAllGlobals();
        });
    });

    describe("version upgrade", () => {
        it("refreshes canonical binary when version marker is stale", async () => {
            const cacheDir = getCacheDir();
            await mkdir(cacheDir, { recursive: true });

            const versionedPath = path.join(cacheDir, getVersionedBinaryName("v1.50.0"));
            const newContent = "new-binary-content";
            await writeFile(versionedPath, newContent);
            await chmod(versionedPath, 0o755);

            const canonicalPath = path.join(cacheDir, getBinaryName());
            await writeFile(canonicalPath, "old-binary-content");
            await chmod(canonicalPath, 0o755);

            // Marker says old version
            const markerPath = path.join(cacheDir, "buf.version");
            await writeFile(markerPath, "v1.65.0");

            const mockFetch = vi.fn();
            vi.stubGlobal("fetch", mockFetch);

            const { resolveBuf } = await import("../BufDownloader.js");
            const result = await resolveBuf(logger);

            expect(result).toBe(AbsoluteFilePath.of(canonicalPath));
            expect(mockFetch).not.toHaveBeenCalled();

            // Canonical binary should now have the new content
            const canonicalContent = await readFile(canonicalPath, "utf-8");
            expect(canonicalContent).toBe(newContent);

            // Marker should be updated
            const updatedMarker = await readFile(markerPath, "utf-8");
            expect(updatedMarker.trim()).toBe("v1.50.0");

            // Should log the update
            expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Updated buf"));

            vi.unstubAllGlobals();
        });

        it("refreshes canonical binary when canonical is missing but versioned exists", async () => {
            const cacheDir = getCacheDir();
            await mkdir(cacheDir, { recursive: true });

            const versionedPath = path.join(cacheDir, getVersionedBinaryName("v1.50.0"));
            await writeFile(versionedPath, FAKE_BINARY_CONTENT);
            await chmod(versionedPath, 0o755);

            // Marker is correct but canonical is missing
            const markerPath = path.join(cacheDir, "buf.version");
            await writeFile(markerPath, "v1.50.0");

            const mockFetch = vi.fn();
            vi.stubGlobal("fetch", mockFetch);

            const { resolveBuf } = await import("../BufDownloader.js");
            const result = await resolveBuf(logger);

            const canonicalPath = path.join(cacheDir, getBinaryName());
            expect(result).toBe(AbsoluteFilePath.of(canonicalPath));
            expect(mockFetch).not.toHaveBeenCalled();

            // Canonical should now exist
            expect(await fileExists(canonicalPath)).toBe(true);

            vi.unstubAllGlobals();
        });
    });

    describe("download failure", () => {
        it("returns undefined when download returns non-200", async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 404,
                statusText: "Not Found"
            });
            vi.stubGlobal("fetch", mockFetch);

            const { resolveBuf } = await import("../BufDownloader.js");
            const result = await resolveBuf(logger);

            expect(result).toBeUndefined();
            expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining("Failed to download buf"));

            vi.unstubAllGlobals();
        });

        it("returns undefined when fetch throws a network error", async () => {
            const mockFetch = vi.fn().mockRejectedValue(new Error("network error"));
            vi.stubGlobal("fetch", mockFetch);

            const { resolveBuf } = await import("../BufDownloader.js");
            const result = await resolveBuf(logger);

            expect(result).toBeUndefined();
            expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining("network error"));

            vi.unstubAllGlobals();
        });
    });

    describe("lock safety", () => {
        it("releases lock even when download fails", async () => {
            const mockFetch = vi.fn().mockRejectedValue(new Error("download failed"));
            vi.stubGlobal("fetch", mockFetch);

            const { resolveBuf } = await import("../BufDownloader.js");
            await resolveBuf(logger);

            // Lock directory should be cleaned up
            const lockPath = path.join(getCacheDir(), "buf.lock");
            expect(await fileExists(lockPath)).toBe(false);

            vi.unstubAllGlobals();
        });

        it("concurrent calls do not corrupt the cache", async () => {
            let fetchCallCount = 0;
            const mockFetch = vi.fn().mockImplementation(async () => {
                fetchCallCount++;
                // Simulate download latency
                await new Promise((resolve) => setTimeout(resolve, 50));
                return {
                    ok: true,
                    status: 200,
                    statusText: "OK",
                    arrayBuffer: () =>
                        Promise.resolve(new TextEncoder().encode(`binary-content-${fetchCallCount}`).buffer)
                };
            });
            vi.stubGlobal("fetch", mockFetch);

            const { resolveBuf } = await import("../BufDownloader.js");

            // Run 3 concurrent resolves
            const results = await Promise.all([resolveBuf(logger), resolveBuf(logger), resolveBuf(logger)]);

            // All should succeed
            const canonicalPath = path.join(getCacheDir(), getBinaryName());
            for (const result of results) {
                expect(result).toBe(AbsoluteFilePath.of(canonicalPath));
            }

            // Canonical binary should exist and be valid
            expect(await fileExists(canonicalPath)).toBe(true);
            const content = await readFile(canonicalPath, "utf-8");
            expect(content).toContain("binary-content");

            // Version marker should be correct
            const markerPath = path.join(getCacheDir(), "buf.version");
            const marker = await readFile(markerPath, "utf-8");
            expect(marker.trim()).toBe("v1.50.0");

            // Lock should be released
            const lockPath = path.join(getCacheDir(), "buf.lock");
            expect(await fileExists(lockPath)).toBe(false);

            vi.unstubAllGlobals();
        });
    });

    describe("cache directory creation", () => {
        it("creates cache directory if it does not exist", async () => {
            const cacheDir = getCacheDir();
            expect(await fileExists(cacheDir)).toBe(false);

            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                statusText: "OK",
                arrayBuffer: () => Promise.resolve(new TextEncoder().encode(FAKE_BINARY_CONTENT).buffer)
            });
            vi.stubGlobal("fetch", mockFetch);

            const { resolveBuf } = await import("../BufDownloader.js");
            const result = await resolveBuf(logger);

            const expectedPath = path.join(cacheDir, getBinaryName());
            expect(result).toBe(AbsoluteFilePath.of(expectedPath));
            expect(await fileExists(cacheDir)).toBe(true);

            vi.unstubAllGlobals();
        });
    });

    describe("binary permissions", () => {
        it("sets executable permissions on downloaded binary", async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                statusText: "OK",
                arrayBuffer: () => Promise.resolve(new TextEncoder().encode(FAKE_BINARY_CONTENT).buffer)
            });
            vi.stubGlobal("fetch", mockFetch);

            const { resolveBuf } = await import("../BufDownloader.js");
            await resolveBuf(logger);

            // Canonical binary should be executable
            const canonicalPath = path.join(getCacheDir(), getBinaryName());
            const canonicalStat = await stat(canonicalPath);
            // Check owner execute bit (0o100)
            expect(canonicalStat.mode & 0o100).toBeTruthy();

            // Versioned binary should also be executable
            const versionedPath = path.join(getCacheDir(), getVersionedBinaryName("v1.50.0"));
            const versionedStat = await stat(versionedPath);
            expect(versionedStat.mode & 0o100).toBeTruthy();

            vi.unstubAllGlobals();
        });
    });

    describe("download URL format", () => {
        it("constructs correct URL for the current platform", async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                statusText: "OK",
                arrayBuffer: () => Promise.resolve(new TextEncoder().encode(FAKE_BINARY_CONTENT).buffer)
            });
            vi.stubGlobal("fetch", mockFetch);

            const { resolveBuf } = await import("../BufDownloader.js");
            await resolveBuf(logger);

            expect(mockFetch).toHaveBeenCalledOnce();
            const fetchUrl = mockFetch.mock.calls[0]?.[0] as string;

            // URL should match buf's release naming convention
            expect(fetchUrl).toContain("github.com/bufbuild/buf/releases/download/v1.50.0/buf-");

            // OS name should be capitalized (Darwin, Linux, Windows)
            const platform = process.platform;
            if (platform === "darwin") {
                expect(fetchUrl).toContain("buf-Darwin-");
            } else if (platform === "linux") {
                expect(fetchUrl).toContain("buf-Linux-");
            } else if (platform === "win32") {
                expect(fetchUrl).toContain("buf-Windows-");
            }

            // Arch should use buf's naming convention
            const arch = process.arch;
            if (arch === "x64") {
                expect(fetchUrl).toContain("x86_64");
            } else if (arch === "arm64") {
                if (platform === "linux") {
                    expect(fetchUrl).toContain("aarch64");
                } else {
                    expect(fetchUrl).toContain("arm64");
                }
            }

            vi.unstubAllGlobals();
        });
    });
});

describe("BufDownloader (real e2e)", () => {
    let tempHomeDir: string;
    let logger: Logger;

    beforeEach(async () => {
        tempHomeDir = (await tmp.dir({ unsafeCleanup: true })).path;
        logger = createMockLogger();

        // Reset module registry so vi.doMock takes effect on next dynamic import
        vi.resetModules();

        // Mock os.homedir() to isolate cache to a temp directory
        vi.doMock("os", async () => {
            const actual = await vi.importActual<typeof import("os")>("os");
            return {
                ...actual,
                default: {
                    ...actual,
                    homedir: () => tempHomeDir,
                    platform: actual.platform,
                    arch: actual.arch
                }
            };
        });
    });

    afterEach(async () => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        await rm(tempHomeDir, { recursive: true, force: true });
    });

    function getCacheDir(): string {
        return path.join(tempHomeDir, ".fern", "bin");
    }

    function getBinaryName(): string {
        return process.platform === "win32" ? "buf.exe" : "buf";
    }

    function getVersionedBinaryName(version: string): string {
        const ext = process.platform === "win32" ? ".exe" : "";
        return `buf-${version}${ext}`;
    }

    it("downloads real buf binary from GitHub Releases, caches it, and reuses on second call", {
        timeout: 120_000
    }, async () => {
        // Do NOT mock fetch — use the real network
        const { resolveBuf } = await import("../BufDownloader.js");

        // --- First call: should download from GitHub Releases ---
        const result1 = await resolveBuf(logger);

        const expectedPath = path.join(getCacheDir(), getBinaryName());
        expect(result1).toBe(AbsoluteFilePath.of(expectedPath));

        // Verify download log messages
        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Downloading buf"));
        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Downloaded buf"));

        // Verify cache structure
        const cacheDir = getCacheDir();
        const canonicalPath = path.join(cacheDir, getBinaryName());
        const versionedPath = path.join(cacheDir, getVersionedBinaryName("v1.50.0"));
        const markerPath = path.join(cacheDir, "buf.version");

        // All cache files should exist
        expect(await fileExists(canonicalPath)).toBe(true);
        expect(await fileExists(versionedPath)).toBe(true);
        expect(await fileExists(markerPath)).toBe(true);

        // Version marker should contain v1.50.0
        const markerContent = await readFile(markerPath, "utf-8");
        expect(markerContent.trim()).toBe("v1.50.0");

        // Binary should be a real executable (buf is ~47-52MB)
        const binaryStat = await stat(canonicalPath);
        expect(binaryStat.size).toBeGreaterThan(10_000_000);

        // Binary should have executable permissions
        expect(binaryStat.mode & 0o100).toBeTruthy();

        // Lock should be cleaned up
        const lockPath = path.join(cacheDir, "buf.lock");
        expect(await fileExists(lockPath)).toBe(false);

        // --- Second call: should use cache (no re-download) ---
        const infoCallsBefore = (logger.info as ReturnType<typeof vi.fn>).mock.calls.length;
        const result2 = await resolveBuf(logger);

        expect(result2).toBe(AbsoluteFilePath.of(expectedPath));

        // Should log cache hit, not download
        const infoCallsAfter = (logger.info as ReturnType<typeof vi.fn>).mock.calls;
        const newCalls = infoCallsAfter.slice(infoCallsBefore);
        const newMessages = newCalls.map((call) => call[0] as string);
        expect(newMessages.some((msg) => msg.includes("Using cached buf"))).toBe(true);
        expect(newMessages.some((msg) => msg.includes("Downloading"))).toBe(false);
    });

    it("downloaded binary is a valid ELF/Mach-O executable", { timeout: 120_000 }, async () => {
        const { resolveBuf } = await import("../BufDownloader.js");
        const result = await resolveBuf(logger);
        expect(result).toBeDefined();

        const canonicalPath = path.join(getCacheDir(), getBinaryName());

        // Read first 4 bytes to verify it's a real binary (ELF or Mach-O magic)
        const buffer = await readFile(canonicalPath);
        expect(buffer.length).toBeGreaterThan(4);

        // ELF magic: 0x7f 'E' 'L' 'F'  |  Mach-O magic: 0xFEEDFACE/0xFEEDFACF/0xCFFA..
        const elfMagic = buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46;
        const machoMagic =
            (buffer[0] === 0xfe && buffer[1] === 0xed && buffer[2] === 0xfa) ||
            (buffer[0] === 0xcf && buffer[1] === 0xfa && buffer[2] === 0xed);
        const peMagic = buffer[0] === 0x4d && buffer[1] === 0x5a; // MZ header for Windows PE

        expect(elfMagic || machoMagic || peMagic).toBe(true);
    });
});
