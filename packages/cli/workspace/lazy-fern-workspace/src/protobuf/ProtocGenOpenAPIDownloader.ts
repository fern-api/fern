import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { CliError } from "@fern-api/task-context";
import { access, chmod, copyFile, mkdir, readFile, rename, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";

const PROTOC_GEN_OPENAPI_VERSION = "v0.1.13";
const GITHUB_RELEASE_URL_BASE = "https://github.com/fern-api/protoc-gen-openapi/releases/download";
const BINARY_NAME = "protoc-gen-openapi";
const CACHE_DIR_NAME = ".fern";
const BIN_DIR_NAME = "bin";
const LOCK_TIMEOUT_MS = 120_000;
const LOCK_RETRY_INTERVAL_MS = 200;

interface PlatformInfo {
    os: string;
    arch: string;
    extension: string;
}

function getPlatformInfo(): PlatformInfo {
    const platform = os.platform();
    const arch = os.arch();

    let osName: string;
    switch (platform) {
        case "linux":
            osName = "linux";
            break;
        case "darwin":
            osName = "darwin";
            break;
        case "win32":
            osName = "windows";
            break;
        default:
            throw new CliError({ message: `Unsupported platform: ${platform}`, code: CliError.Code.EnvironmentError });
    }

    let archName: string;
    switch (arch) {
        case "x64":
            archName = "amd64";
            break;
        case "arm64":
            archName = "arm64";
            break;
        default:
            throw new CliError({ message: `Unsupported architecture: ${arch}`, code: CliError.Code.EnvironmentError });
    }

    return {
        os: osName,
        arch: archName,
        extension: osName === "windows" ? ".exe" : ""
    };
}

function getCacheDir(): AbsoluteFilePath {
    const homeDir = os.homedir();
    return AbsoluteFilePath.of(path.join(homeDir, CACHE_DIR_NAME, BIN_DIR_NAME));
}

function getVersionedBinaryPath(): AbsoluteFilePath {
    const { extension } = getPlatformInfo();
    const cacheDir = getCacheDir();
    return join(cacheDir, RelativeFilePath.of(`${BINARY_NAME}-${PROTOC_GEN_OPENAPI_VERSION}${extension}`));
}

function getCanonicalBinaryPath(): AbsoluteFilePath {
    const { extension } = getPlatformInfo();
    const cacheDir = getCacheDir();
    return join(cacheDir, RelativeFilePath.of(`${BINARY_NAME}${extension}`));
}

function getVersionMarkerPath(): AbsoluteFilePath {
    const cacheDir = getCacheDir();
    return join(cacheDir, RelativeFilePath.of(`${BINARY_NAME}.version`));
}

function getLockDirPath(): string {
    const cacheDir = getCacheDir();
    return path.join(cacheDir, `${BINARY_NAME}.lock`);
}

function getDownloadUrl(): string {
    const { os: osName, arch, extension } = getPlatformInfo();
    return `${GITHUB_RELEASE_URL_BASE}/${PROTOC_GEN_OPENAPI_VERSION}/${BINARY_NAME}-${osName}-${arch}${extension}`;
}

async function fileExists(filePath: AbsoluteFilePath): Promise<boolean> {
    try {
        await access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Acquires an exclusive filesystem lock using mkdir (atomic on all platforms).
 * Returns a release function that removes the lock directory.
 * If the lock cannot be acquired within LOCK_TIMEOUT_MS, force-breaks it
 * (assumes the holder crashed) and retries once.
 */
async function acquireLock(logger: Logger): Promise<() => Promise<void>> {
    const lockPath = getLockDirPath();
    const deadline = Date.now() + LOCK_TIMEOUT_MS;

    while (Date.now() < deadline) {
        try {
            await mkdir(lockPath, { recursive: false });
            return createLockReleaser(lockPath, logger);
        } catch {
            logger.debug(`Waiting for lock on ${lockPath}...`);
            await new Promise((resolve) => setTimeout(resolve, LOCK_RETRY_INTERVAL_MS));
        }
    }

    // Timeout — force-break the presumed-stale lock and retry once
    logger.debug(`Lock timed out after ${LOCK_TIMEOUT_MS}ms, breaking stale lock`);
    try {
        await rm(lockPath, { recursive: true });
    } catch (err) {
        logger.debug(`Failed to remove stale lock: ${err instanceof Error ? err.message : String(err)}`);
    }
    try {
        await mkdir(lockPath, { recursive: false });
    } catch {
        // Another process grabbed the lock between our rm and mkdir — retry with remaining time
        const remaining = Math.max(LOCK_RETRY_INTERVAL_MS * 5, deadline - Date.now());
        const retryDeadline = Date.now() + remaining;
        while (Date.now() < retryDeadline) {
            try {
                await mkdir(lockPath, { recursive: false });
                return createLockReleaser(lockPath, logger);
            } catch {
                logger.debug(`Waiting for lock on ${lockPath} (post-break retry)...`);
                await new Promise((resolve) => setTimeout(resolve, LOCK_RETRY_INTERVAL_MS));
            }
        }
        throw new CliError({
            message: `Failed to acquire lock after timeout and retry`,
            code: CliError.Code.InternalError
        });
    }
    return createLockReleaser(lockPath, logger);
}

function createLockReleaser(lockPath: string, logger: Logger): () => Promise<void> {
    return async () => {
        try {
            await rm(lockPath, { recursive: true });
        } catch (err) {
            logger.debug(`Failed to release lock: ${err instanceof Error ? err.message : String(err)}`);
        }
    };
}

/**
 * Resolves the protoc-gen-openapi binary, downloading it from GitHub Releases if needed.
 *
 * **Versioning**: Binaries are cached with a versioned filename (e.g. `protoc-gen-openapi-v0.1.13`).
 * A `.version` marker file tracks which version the canonical `protoc-gen-openapi` binary corresponds to.
 * When `PROTOC_GEN_OPENAPI_VERSION` is bumped, the canonical binary is atomically replaced on the
 * next invocation.
 *
 * **Race conditions**: An exclusive filesystem lock (mkdir-based) is held during download and
 * file operations to prevent concurrent processes from corrupting the cache. All file replacements
 * use write-to-temp + atomic rename.
 *
 * @returns The directory containing the binary (for PATH injection), or `undefined` if download fails.
 */
export async function resolveProtocGenOpenAPI(logger: Logger): Promise<AbsoluteFilePath | undefined> {
    try {
        const cacheDir = getCacheDir();
        await mkdir(cacheDir, { recursive: true });

        const releaseLock = await acquireLock(logger);
        try {
            return await resolveUnderLock(logger);
        } finally {
            await releaseLock();
        }
    } catch (error) {
        logger.debug(`Failed to resolve protoc-gen-openapi: ${error instanceof Error ? error.message : String(error)}`);
        return undefined;
    }
}

async function resolveUnderLock(logger: Logger): Promise<AbsoluteFilePath | undefined> {
    const versionedPath = getVersionedBinaryPath();
    const canonicalPath = getCanonicalBinaryPath();
    const versionMarkerPath = getVersionMarkerPath();

    // Fast path: versioned binary already downloaded
    if (await fileExists(versionedPath)) {
        const currentMarker = await readVersionMarker(versionMarkerPath, logger);
        if (currentMarker === PROTOC_GEN_OPENAPI_VERSION && (await fileExists(canonicalPath))) {
            logger.info(`Using cached protoc-gen-openapi ${PROTOC_GEN_OPENAPI_VERSION}`);
            return getCacheDir();
        }
        // Version marker is stale or canonical binary is missing — refresh atomically
        await atomicCopyBinary(versionedPath, canonicalPath);
        await writeFile(versionMarkerPath, PROTOC_GEN_OPENAPI_VERSION);
        logger.info(`Updated protoc-gen-openapi to ${PROTOC_GEN_OPENAPI_VERSION}`);
        return getCacheDir();
    }

    // Download the binary
    const downloadUrl = getDownloadUrl();
    logger.info(`Downloading protoc-gen-openapi ${PROTOC_GEN_OPENAPI_VERSION}...`);

    const tmpDownloadPath = AbsoluteFilePath.of(`${versionedPath}.download`);
    try {
        const response = await fetch(downloadUrl, { redirect: "follow" });
        if (!response.ok) {
            logger.debug(`Failed to download protoc-gen-openapi: ${response.status} ${response.statusText}`);
            return undefined;
        }

        const arrayBuffer = await response.arrayBuffer();
        await writeFile(tmpDownloadPath, new Uint8Array(arrayBuffer));
        await chmod(tmpDownloadPath, 0o755);

        // Atomic rename to versioned path
        await rename(tmpDownloadPath, versionedPath);

        // Atomic copy to canonical path + update version marker
        await atomicCopyBinary(versionedPath, canonicalPath);
        await writeFile(versionMarkerPath, PROTOC_GEN_OPENAPI_VERSION);

        logger.info(`Downloaded protoc-gen-openapi ${PROTOC_GEN_OPENAPI_VERSION}`);
        return getCacheDir();
    } catch (error) {
        logger.debug(
            `Failed to download protoc-gen-openapi: ${error instanceof Error ? error.message : String(error)}`
        );
        // Clean up partial download if it exists
        try {
            await rm(tmpDownloadPath, { force: true });
        } catch (cleanupErr) {
            logger.debug(
                `Failed to clean up partial download: ${cleanupErr instanceof Error ? cleanupErr.message : String(cleanupErr)}`
            );
        }
        return undefined;
    }
}

async function readVersionMarker(markerPath: AbsoluteFilePath, logger: Logger): Promise<string | undefined> {
    try {
        return (await readFile(markerPath, "utf-8")).trim();
    } catch (err) {
        logger.debug(`Failed to read version marker: ${err instanceof Error ? err.message : String(err)}`);
        return undefined;
    }
}

/**
 * Atomically copies src to dest by writing to a temp file first, then renaming.
 * rename() is atomic on the same filesystem, so no other process can observe a
 * partially-written binary.
 */
async function atomicCopyBinary(src: AbsoluteFilePath, dest: AbsoluteFilePath): Promise<void> {
    const tmpDest = AbsoluteFilePath.of(`${dest}.tmp`);
    await copyFile(src, tmpDest);
    await chmod(tmpDest, 0o755);
    await rename(tmpDest, dest);
}
