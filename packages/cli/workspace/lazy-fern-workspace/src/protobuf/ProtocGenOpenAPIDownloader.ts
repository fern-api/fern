import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { createWriteStream } from "fs";
import { access, chmod, mkdir, rename } from "fs/promises";
import os from "os";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";

const PROTOC_GEN_OPENAPI_VERSION = "v0.1.12";
const GITHUB_RELEASE_URL_BASE = "https://github.com/fern-api/protoc-gen-openapi/releases/download";
const BINARY_NAME = "protoc-gen-openapi";
const CACHE_DIR_NAME = ".fern";
const BIN_DIR_NAME = "bin";

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
            throw new Error(`Unsupported platform: ${platform}`);
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
            throw new Error(`Unsupported architecture: ${arch}`);
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

function getCachedBinaryPath(): AbsoluteFilePath {
    const { extension } = getPlatformInfo();
    const cacheDir = getCacheDir();
    return join(cacheDir, RelativeFilePath.of(`${BINARY_NAME}-${PROTOC_GEN_OPENAPI_VERSION}${extension}`));
}

function getSymlinkPath(): AbsoluteFilePath {
    const { extension } = getPlatformInfo();
    const cacheDir = getCacheDir();
    return join(cacheDir, RelativeFilePath.of(`${BINARY_NAME}${extension}`));
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
 * Returns the directory containing the protoc-gen-openapi binary.
 * If the binary is not cached, downloads it from GitHub Releases.
 * Returns undefined if the download fails.
 */
export async function resolveProtocGenOpenAPI(logger: Logger): Promise<AbsoluteFilePath | undefined> {
    const cachedBinaryPath = getCachedBinaryPath();
    const symlinkPath = getSymlinkPath();

    if (await fileExists(cachedBinaryPath)) {
        logger.debug(`Using cached protoc-gen-openapi at ${cachedBinaryPath}`);
        // Ensure the unversioned symlink/copy exists
        if (!(await fileExists(symlinkPath))) {
            await copyBinaryFile(cachedBinaryPath, symlinkPath);
        }
        return getCacheDir();
    }

    const downloadUrl = getDownloadUrl();
    logger.debug(`Downloading protoc-gen-openapi from ${downloadUrl}`);

    try {
        const cacheDir = getCacheDir();
        await mkdir(cacheDir, { recursive: true });

        const tmpPath = AbsoluteFilePath.of(`${cachedBinaryPath}.tmp`);
        const response = await fetch(downloadUrl, { redirect: "follow" });
        if (!response.ok) {
            logger.debug(`Failed to download protoc-gen-openapi: ${response.status} ${response.statusText}`);
            return undefined;
        }

        if (response.body == null) {
            logger.debug("Failed to download protoc-gen-openapi: empty response body");
            return undefined;
        }

        const fileStream = createWriteStream(tmpPath);
        await pipeline(Readable.fromWeb(response.body as ReadableStream), fileStream);

        await chmod(tmpPath, 0o755);
        await rename(tmpPath, cachedBinaryPath);

        // Create the unversioned copy so buf can find it as "protoc-gen-openapi"
        await copyBinaryFile(cachedBinaryPath, symlinkPath);

        logger.debug(`Downloaded protoc-gen-openapi ${PROTOC_GEN_OPENAPI_VERSION} to ${cachedBinaryPath}`);
        return cacheDir;
    } catch (error) {
        logger.debug(
            `Failed to download protoc-gen-openapi: ${error instanceof Error ? error.message : String(error)}`
        );
        return undefined;
    }
}

async function copyBinaryFile(src: AbsoluteFilePath, dest: AbsoluteFilePath): Promise<void> {
    const { copyFile: fsCopyFile } = await import("fs/promises");
    await fsCopyFile(src, dest);
    await chmod(dest, 0o755);
}
