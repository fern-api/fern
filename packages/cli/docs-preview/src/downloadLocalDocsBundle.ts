import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import chalk from "chalk";
import { execSync } from "child_process";
import cliProgress from "cli-progress";
import decompress from "decompress";
import { cpSync, existsSync, lstatSync, mkdirSync, symlinkSync } from "fs";
import { mkdir, readFile, rename, rm, writeFile } from "fs/promises";
import { homedir } from "os";
import path from "path";
import tmp from "tmp-promise";
import xml2js from "xml2js";

const PLATFORM_IS_WINDOWS = process.platform === "win32";
const DOCS_PREFIX = chalk.cyan("[docs]:");
const ETAG_FILENAME = "etag";

// Progress bar label alignment - pad labels to the longest one for consistent bar positioning
const PROGRESS_LABEL_WIDTH = "Downloading docs bundle".length;
const formatProgressLabel = (label: string): string => label.padEnd(PROGRESS_LABEL_WIDTH, " ");
const PREVIEW_FOLDER_NAME = "preview";
const APP_PREVIEW_FOLDER_NAME = "app-preview";
const BUNDLE_FOLDER_NAME = "bundle";
const NEXT_BUNDLE_FOLDER_NAME = ".next";
const STANDALONE_FOLDER_NAME = "standalone";
const LOCAL_STORAGE_FOLDER = process.env.LOCAL_STORAGE_FOLDER ?? ".fern";

// Const for windows post-processing
const INSTRUMENTATION_PATH = "packages/fern-docs/bundle/.next/server/instrumentation.js";
const COREPACK_MISSING_KEYID_ERROR_MESSAGE = 'Cannot find matching keyid: {"signatures":';

interface SymlinkEntry {
    path: string;
    linkname: string;
}

/**
 * Checks the Windows registry for LongPathsEnabled and prints a prominent
 * warning if long paths are not enabled. Long paths are required because
 * .pnpm directory names inside the bundle can exceed the 260-char MAX_PATH.
 */
function warnIfLongPathsDisabled(logger: Logger): void {
    try {
        const output = execSync(
            'reg query "HKLM\\SYSTEM\\CurrentControlSet\\Control\\FileSystem" /v LongPathsEnabled',
            { encoding: "utf-8", timeout: 5000 }
        );
        // Output looks like: "LongPathsEnabled    REG_DWORD    0x1"
        const match = output.match(/LongPathsEnabled\s+REG_DWORD\s+0x(\d+)/i);
        if (match != null && match[1] === "1") {
            return;
        }
    } catch (error) {
        // reg query failed — key may not exist, which means long paths are disabled
        logger.debug(`Registry query for LongPathsEnabled failed: ${error}`);
    }

    logger.warn(
        chalk.yellow.bold(
            "\n" +
                "╔══════════════════════════════════════════════════════════════════════════╗\n" +
                "║  WARNING: Windows long path support is NOT enabled.                     ║\n" +
                "║                                                                         ║\n" +
                "║  The docs bundle contains deeply nested .pnpm paths that may exceed     ║\n" +
                "║  the 260-character MAX_PATH limit. Extraction may silently truncate     ║\n" +
                "║  paths and produce a broken bundle.                                     ║\n" +
                "║                                                                         ║\n" +
                "║  To fix, run this in an elevated PowerShell:                             ║\n" +
                "║                                                                         ║\n" +
                "║    New-ItemProperty -Path                                                ║\n" +
                "║      'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\FileSystem'           ║\n" +
                "║      -Name 'LongPathsEnabled' -Value 1 -PropertyType DWORD -Force       ║\n" +
                "║                                                                         ║\n" +
                "║  Then restart your terminal.                                             ║\n" +
                "║                                                                         ║\n" +
                "║  For more details, see:                                                  ║\n" +
                "║  https://learn.microsoft.com/en-us/windows/win32/fileio/                 ║\n" +
                "║  maximum-file-path-limitation                                            ║\n" +
                "╚══════════════════════════════════════════════════════════════════════════╝\n"
        )
    );
}

function isWithinOutputDir(resolvedPath: string, outputDir: string): boolean {
    const rel = path.relative(outputDir, resolvedPath);
    // rel must not start with ".." and must not be an absolute path
    return !rel.startsWith("..") && !path.isAbsolute(rel);
}

/**
 * On Windows, tar symlinks are filtered out during extraction (fs.symlink
 * requires elevated privileges). This function resolves each collected symlink
 * by creating an NTFS junction (for directories) or copying the file.
 * When a direct target doesn't exist, it falls back to searching the root
 * .pnpm store.
 */
function resolveWindowsSymlinks(
    outputDir: string,
    symlinks: SymlinkEntry[],
    logger: Logger,
    onProgress?: (resolved: number, total: number) => void
): void {
    if (symlinks.length === 0) {
        return;
    }

    logger.debug(`Resolving ${symlinks.length} symlinks via NTFS junctions/copies...`);

    let junctions = 0;
    let copies = 0;
    let failed = 0;
    let fallbackUsed = 0;
    let alreadyExisted = 0;

    const rootPnpmStore = path.join(outputDir, "standalone", "node_modules", ".pnpm");

    for (const { path: symlinkPath, linkname } of symlinks) {
        const fullSymlinkPath = path.join(outputDir, symlinkPath);

        if (!isWithinOutputDir(fullSymlinkPath, outputDir)) {
            logger.warn(`Skipping symlink with path outside outputDir: ${symlinkPath}`);
            failed++;
            continue;
        }

        const symlinkDir = path.dirname(fullSymlinkPath);
        const resolvedTarget = path.resolve(symlinkDir, linkname);

        if (existsSync(fullSymlinkPath)) {
            alreadyExisted++;
            continue;
        }

        let sourcePath = resolvedTarget;
        let usedFallback = false;

        // If direct target doesn't exist, try fallback in root .pnpm store
        if (!existsSync(sourcePath) && existsSync(rootPnpmStore)) {
            const parts = linkname.split("/");
            const nmIdx = parts.lastIndexOf("node_modules");
            if (nmIdx >= 0 && nmIdx > 0) {
                const pnpmDirName = parts[nmIdx - 1];
                const pkgRelPath = parts.slice(nmIdx + 1).join("/");
                if (pnpmDirName != null && pkgRelPath != null) {
                    const fallback = path.join(rootPnpmStore, pnpmDirName, "node_modules", pkgRelPath);
                    if (!isWithinOutputDir(fallback, outputDir)) {
                        continue; // skip unsafe fallback
                    }
                    if (existsSync(fallback)) {
                        sourcePath = fallback;
                        usedFallback = true;
                    }
                }
            }
        }

        if (!isWithinOutputDir(sourcePath, outputDir)) {
            logger.warn(`Skipping symlink whose target is outside outputDir: ${linkname}`);
            failed++;
            continue;
        }

        if (!existsSync(sourcePath)) {
            failed++;
            continue;
        }

        try {
            mkdirSync(path.dirname(fullSymlinkPath), { recursive: true });
            const stat = lstatSync(sourcePath);
            if (stat.isDirectory()) {
                symlinkSync(sourcePath, fullSymlinkPath, "junction");
                junctions++;
            } else {
                cpSync(sourcePath, fullSymlinkPath);
                copies++;
            }
            if (usedFallback) {
                fallbackUsed++;
            }
        } catch (error) {
            logger.debug(`Failed to resolve symlink ${symlinkPath}: ${error}`);
            failed++;
        }
        onProgress?.(junctions + copies + alreadyExisted + failed, symlinks.length);
    }

    logger.debug(
        `Symlink resolution: ${junctions} junctions, ${copies} file copies, ` +
            `${alreadyExisted} pre-existing, ${failed} failed (${fallbackUsed} via fallback) ` +
            `out of ${symlinks.length}`
    );

    // Verify critical top-level packages
    const standaloneNM = path.join(outputDir, "standalone", "node_modules");
    for (const dep of ["next", "react", "react-dom", "styled-jsx"]) {
        if (!existsSync(path.join(standaloneNM, dep))) {
            logger.warn(`${dep} is MISSING from standalone/node_modules/`);
        }
    }
}

export function getLocalStorageFolder(): AbsoluteFilePath {
    return join(AbsoluteFilePath.of(homedir()), RelativeFilePath.of(LOCAL_STORAGE_FOLDER));
}

export function getPathToPreviewFolder({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(getLocalStorageFolder(), RelativeFilePath.of(app ? APP_PREVIEW_FOLDER_NAME : PREVIEW_FOLDER_NAME));
}

export function getPathToBundleFolder({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(
        getPathToPreviewFolder({ app }),
        RelativeFilePath.of(app ? NEXT_BUNDLE_FOLDER_NAME : BUNDLE_FOLDER_NAME)
    );
}

export function getPathToStandaloneFolder({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(getPathToBundleFolder({ app }), RelativeFilePath.of(STANDALONE_FOLDER_NAME));
}

export function getPathToInstrumentationJs({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(getPathToStandaloneFolder({ app }), RelativeFilePath.of(INSTRUMENTATION_PATH));
}

function contactFernSupportError(errorMessage: string): Error {
    return new Error(`${errorMessage}. Please reach out to support@buildwithfern.com.`);
}

export function getPathToEtagFile({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(getPathToPreviewFolder({ app }), RelativeFilePath.of(ETAG_FILENAME));
}

export declare namespace DownloadLocalBundle {
    type Result = SuccessResult | FailureResult;

    interface SuccessResult {
        type: "success";
    }

    interface FailureResult {
        type: "failure";
    }
}

export async function downloadBundle({
    bucketUrl,
    logger,
    preferCached,
    app = false,
    tryTar = false
}: {
    bucketUrl: string;
    logger: Logger;
    preferCached: boolean;
    app?: boolean;
    tryTar?: boolean;
}): Promise<DownloadLocalBundle.Result> {
    logger.debug("Setting up docs preview bundle...");
    const response = await fetch(bucketUrl);
    if (!response.ok) {
        return {
            type: "failure"
        };
    }
    const body = await response.text();
    const parser = new xml2js.Parser();
    const parsedResponse = await parser.parseStringPromise(body);
    const eTag = parsedResponse?.ListBucketResult?.Contents?.[0]?.ETag?.[0];
    const key = parsedResponse?.ListBucketResult?.Contents?.[0]?.Key?.[0];

    const eTagFilepath = getPathToEtagFile({ app });
    if (preferCached) {
        const currentETagExists = await doesPathExist(eTagFilepath);
        let currentETag = undefined;
        if (currentETagExists) {
            logger.debug("Reading existing ETag");
            currentETag = (await readFile(eTagFilepath)).toString();
        }
        if (currentETag != null && currentETag === eTag) {
            logger.debug("ETag matches. Using already downloaded bundle");
            // The bundle is already downloaded
            return {
                type: "success"
            };
        } else {
            logger.debug("ETag is different. Downloading latest preview bundle");
            if (app) {
                logger.info(
                    "Setting up docs preview bundle...\nPlease wait while the installation completes. This may take a few minutes depending on your connection speed."
                );
            }
        }
    }

    logger.debug("Creating tmp directory to download docs preview bundle");
    // create tmp directory
    const dir = await tmp.dir({ prefix: "fern" });
    const absoluteDirectoryToTmpDir = AbsoluteFilePath.of(dir.path);

    const docsBundleUrl = new URL(key, bucketUrl).href;
    logger.debug(`Downloading docs preview bundle from ${docsBundleUrl}`);
    // download docs bundle
    try {
        const docsBundleZipResponse = await fetch(docsBundleUrl);
        if (!docsBundleZipResponse.ok) {
            throw new Error(`Failed to download docs preview bundle. Status code: ${docsBundleZipResponse.status}`);
        }
        const outputZipPath = join(
            absoluteDirectoryToTmpDir,
            RelativeFilePath.of(tryTar ? "output.tar.gz" : "output.zip")
        );

        if (docsBundleZipResponse.body == null) {
            throw contactFernSupportError("Docs bundle has empty response body");
        }

        const contentLength = docsBundleZipResponse.headers.get("content-length");
        const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

        let progressBar: cliProgress.SingleBar | undefined;
        if (app && totalBytes > 0) {
            progressBar = new cliProgress.SingleBar({
                format: `${DOCS_PREFIX} ${formatProgressLabel("Downloading docs bundle")} [{bar}] {percentage}% | {value}/{total} MB`,
                barCompleteChar: "\u2588",
                barIncompleteChar: "\u2591",
                hideCursor: true
            });
            progressBar.start(Math.ceil(totalBytes / (1024 * 1024)), 0);
        } else if (app) {
            logger.info(`${DOCS_PREFIX} Downloading docs bundle...`);
        }

        const chunks: Uint8Array[] = [];
        let downloadedBytes = 0;

        const reader = docsBundleZipResponse.body.getReader();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }

                chunks.push(value);
                downloadedBytes += value.length;

                if (progressBar && totalBytes > 0) {
                    progressBar.update(Math.ceil(downloadedBytes / (1024 * 1024)));
                }
            }
        } finally {
            reader.releaseLock();
            if (progressBar) {
                progressBar.stop();
            }
        }

        const nodeBuffer = Buffer.concat(chunks);
        await writeFile(outputZipPath, new Uint8Array(nodeBuffer));
        logger.debug(`Wrote ${tryTar ? "output.tar.gz" : "output.zip"} to ${outputZipPath}`);

        const absolutePathToPreviewFolder = getPathToPreviewFolder({ app });
        if (await doesPathExist(absolutePathToPreviewFolder)) {
            const oldBundlePath = AbsoluteFilePath.of(`${absolutePathToPreviewFolder}-old-${Date.now()}`);
            logger.debug(`Moving previously cached bundle to: ${oldBundlePath}`);
            await rename(absolutePathToPreviewFolder, oldBundlePath);

            // Delete the old bundle asynchronously so it doesn't block the rest of the setup
            rm(oldBundlePath, { recursive: true }).catch((error) => {
                logger.debug(`Failed to remove old bundle at ${oldBundlePath}: ${error}`);
            });
        }
        await mkdir(absolutePathToPreviewFolder, { recursive: true });

        const absolutePathToBundleFolder = getPathToBundleFolder({ app });
        await mkdir(absolutePathToBundleFolder, { recursive: true });
        logger.debug(`Decompressing bundle from ${outputZipPath} to ${absolutePathToBundleFolder}`);

        let unzipProgressBar: cliProgress.SingleBar | undefined;
        let unzipInterval: NodeJS.Timeout | undefined;

        if (app) {
            unzipProgressBar = new cliProgress.SingleBar({
                format: `${DOCS_PREFIX} ${formatProgressLabel("Unzipping docs bundle")} [{bar}] {percentage}%`,
                barCompleteChar: "\u2588",
                barIncompleteChar: "\u2591",
                hideCursor: true
            });
            unzipProgressBar.start(100, 0);

            const UNZIP_DURATION_MS = PLATFORM_IS_WINDOWS ? 60000 : 30000;
            const startTime = Date.now();
            unzipInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const t = Math.min(elapsed / UNZIP_DURATION_MS, 1);
                const p = 1 - Math.pow(1 - t, 3);
                const percentage = Math.min(99, Math.floor(p * 100));
                unzipProgressBar?.update(percentage);
            }, 50);
        }

        if (PLATFORM_IS_WINDOWS) {
            warnIfLongPathsDisabled(logger);
        }

        const collectedSymlinks: SymlinkEntry[] = [];

        try {
            await decompress(outputZipPath, absolutePathToBundleFolder, {
                filter: (file) => {
                    if (PLATFORM_IS_WINDOWS && file.type === "symlink") {
                        // decompress-tar adds `linkname` for symlink entries but the
                        // TypeScript types don't include it, so access via bracket notation.
                        const linkname = (file as unknown as Record<string, unknown>)["linkname"];
                        if (typeof linkname === "string") {
                            collectedSymlinks.push({ path: file.path, linkname });
                        }
                        return false;
                    }
                    return true;
                }
            });
        } finally {
            if (unzipInterval) {
                clearInterval(unzipInterval);
            }
            if (unzipProgressBar) {
                unzipProgressBar.update(100);
                unzipProgressBar.stop();
            }
        }

        // Resolve symlinks via NTFS junctions on Windows
        if (PLATFORM_IS_WINDOWS && collectedSymlinks.length > 0) {
            let symlinkProgressBar: cliProgress.SingleBar | undefined;
            if (app) {
                symlinkProgressBar = new cliProgress.SingleBar({
                    format: `${DOCS_PREFIX} ${formatProgressLabel("Patching symlinks")} [{bar}] {percentage}% | {value}/{total}`,
                    barCompleteChar: "\u2588",
                    barIncompleteChar: "\u2591",
                    hideCursor: true
                });
                symlinkProgressBar.start(collectedSymlinks.length, 0);
            }
            resolveWindowsSymlinks(
                absolutePathToBundleFolder,
                collectedSymlinks,
                logger,
                symlinkProgressBar ? (resolved, total) => symlinkProgressBar?.update(resolved) : undefined
            );
            if (symlinkProgressBar) {
                symlinkProgressBar.update(collectedSymlinks.length);
                symlinkProgressBar.stop();
            }
        }

        // write etag
        await writeFile(eTagFilepath, eTag);
        logger.debug(`Downloaded bundle to ${absolutePathToBundleFolder}`);

        if (app) {
            // check if pnpm exists
            logger.debug("Checking if pnpm is installed");
            try {
                await loggingExeca(logger, PLATFORM_IS_WINDOWS ? "where" : "which", ["pnpm"], {
                    cwd: absolutePathToBundleFolder,
                    doNotPipeOutput: true
                });
            } catch (error) {
                logger.debug("pnpm not found, installing pnpm");
                await loggingExeca(logger, "npm", ["install", "-g", "pnpm"], {
                    doNotPipeOutput: true
                });
            }

            // if pnpm still hasn't been installed, user should install themselves
            try {
                await loggingExeca(logger, PLATFORM_IS_WINDOWS ? "where" : "which", ["pnpm"], {
                    cwd: absolutePathToBundleFolder,
                    doNotPipeOutput: true
                });
            } catch (error) {
                throw new Error(
                    "Requires [pnpm] to run local development. Please run: npm install -g pnpm, and then: fern docs dev"
                );
            }

            try {
                // install esbuild
                logger.debug("Installing esbuild");
                await loggingExeca(logger, "pnpm", ["i", "esbuild"], {
                    cwd: absolutePathToBundleFolder,
                    doNotPipeOutput: true
                });
            } catch (error) {
                if (error instanceof Error) {
                    // If error message contains "Cannot find matching keyid:", try to upgrade corepack
                    if (
                        typeof error?.message === "string" &&
                        error.message.includes(COREPACK_MISSING_KEYID_ERROR_MESSAGE)
                    ) {
                        logger.debug("Detected corepack missing keyid error. Attempting to upgrade corepack");
                        try {
                            await loggingExeca(logger, "npm", ["install", "-g", "corepack@latest"], {
                                doNotPipeOutput: true
                            });
                        } catch (corepackError) {
                            throw contactFernSupportError(`Failed to update corepack due to error: ${corepackError}`);
                        }
                        try {
                            // Try installing esbuild again after upgrading corepack
                            logger.debug("Installing esbuild after upgrading corepack");
                            await loggingExeca(logger, "pnpm", ["i", "esbuild"], {
                                cwd: absolutePathToBundleFolder,
                                doNotPipeOutput: true
                            });
                        } catch (installError) {
                            throw contactFernSupportError(
                                `Failed to install required package after updating corepack due to error: ${installError}`
                            );
                        }
                    } else {
                        throw contactFernSupportError(`Failed to install required package due to error: ${error}.`);
                    }
                } else {
                    throw contactFernSupportError(`Failed to install required package due to error: ${error}.`);
                }
            }

            try {
                // resolve imports
                logger.debug("Resolve esbuild imports");
                await loggingExeca(logger, "node", ["install-esbuild.js"], {
                    cwd: absolutePathToBundleFolder,
                    doNotPipeOutput: true
                });
            } catch (error) {
                throw contactFernSupportError(`Failed to resolve imports due to error: ${error}`);
            }

            if (PLATFORM_IS_WINDOWS) {
                const absPathToInstrumentationJs = getPathToInstrumentationJs({ app });
                if (await doesPathExist(absPathToInstrumentationJs)) {
                    logger.debug(`Removing instrumentation.js at ${absPathToInstrumentationJs}`);
                    await rm(absPathToInstrumentationJs);
                }
            }
        }

        return {
            type: "success"
        };
    } catch (error) {
        logger.error(`Error: ${error}`);

        // remove incomplete bundle
        const absolutePathToPreviewFolder = getPathToPreviewFolder({ app });
        if (await doesPathExist(absolutePathToPreviewFolder)) {
            await rm(absolutePathToPreviewFolder, { recursive: true });
        }
        logger.debug(`Removing incomplete bundle: rm -rf ${absolutePathToPreviewFolder}`);

        return {
            type: "failure"
        };
    }
}
