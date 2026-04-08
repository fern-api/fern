import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import chalk from "chalk";
import cliProgress from "cli-progress";
import decompress from "decompress";
import { copyFile, cp, mkdir, readFile, rename, rm, stat, writeFile } from "fs/promises";
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
const NPMRC_NAME = ".npmrc";
const PNPMFILE_CJS_NAME = ".pnpmfile.cjs";
const PNPM_WORKSPACE_YAML_NAME = "pnpm-workspace.yaml";
const COREPACK_MISSING_KEYID_ERROR_MESSAGE = 'Cannot find matching keyid: {"signatures":';

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

function getPathToPnpmWorkspaceYaml({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(getPathToStandaloneFolder({ app }), RelativeFilePath.of(PNPM_WORKSPACE_YAML_NAME));
}

function getPathToPnpmfileCjs({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(getPathToStandaloneFolder({ app }), RelativeFilePath.of(PNPMFILE_CJS_NAME));
}

function getPathToNpmrc({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(getPathToStandaloneFolder({ app }), RelativeFilePath.of(NPMRC_NAME));
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

const PNPMFILE_CJS_CONTENTS = `module.exports = {
    hooks: {
        readPackage(pkg) {
            // Remove all workspace:* dependencies
            if (pkg.dependencies) {
                Object.keys(pkg.dependencies).forEach(dep => {
                    if (pkg.dependencies[dep] === 'workspace:*') {
                        delete pkg.dependencies[dep]; } });
                    }
            if (pkg.devDependencies) {
                Object.keys(pkg.devDependencies).forEach(dep => {
                    if (pkg.devDependencies[dep] === 'workspace:*') {
                        delete pkg.devDependencies[dep]; } });
            } return pkg;
        }
    }
};
`;

const NPMRC_CONTENTS = "@fern-fern:registry=https://npm.buildwithfern.com\n";

// Marker file written after Windows post-processing completes so we can skip
// the (slow) pnpm install on subsequent cached-bundle runs.
const WINDOWS_POST_PROCESSED_MARKER = ".windows-post-processed";

// Metadata file that stores symlink entries extracted from the tar archive.
// On Windows, symlinks are filtered out during extraction because they require
// admin privileges. This metadata is used later to recreate them as directory
// junctions (for directories) or file copies (for files).
const SYMLINKS_METADATA_FILE = ".symlinks-metadata.json";

function getPathToWindowsPostProcessedMarker({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(getPathToStandaloneFolder({ app }), RelativeFilePath.of(WINDOWS_POST_PROCESSED_MARKER));
}

/**
 * Runs Windows-specific post-processing on the extracted bundle.
 * The tar bundle contains Unix symlinks that don't work on Windows, so we
 * write helper config files and run `pnpm install` in the standalone directory
 * to recreate the missing node_modules entries.
 *
 * This is idempotent — it checks for existing files before writing and uses a
 * marker file to skip the expensive `pnpm install` on subsequent runs.
 */
async function postProcessWindowsBundle({ app, logger }: { app: boolean; logger: Logger }): Promise<void> {
    const absPathToStandalone = getPathToStandaloneFolder({ app });
    if (!(await doesPathExist(absPathToStandalone))) {
        logger.debug("Standalone folder does not exist, skipping Windows post-processing");
        return;
    }

    // If the marker file exists, post-processing was already completed.
    const markerPath = getPathToWindowsPostProcessedMarker({ app });
    if (await doesPathExist(markerPath)) {
        logger.debug("Windows post-processing already completed (marker file exists), skipping");
        return;
    }

    const absPathToInstrumentationJs = getPathToInstrumentationJs({ app });
    const pnpmWorkspacePath = getPathToPnpmWorkspaceYaml({ app });
    const pnpmfilePath = getPathToPnpmfileCjs({ app });
    const npmrcPath = getPathToNpmrc({ app });

    // Check all paths in parallel
    const [pnpmWorkspaceExists, pnpmfileExists, npmrcExists, instrumentationJsExists] = await Promise.all([
        doesPathExist(pnpmWorkspacePath),
        doesPathExist(pnpmfilePath),
        doesPathExist(npmrcPath),
        doesPathExist(absPathToInstrumentationJs)
    ]);

    // Warn if pnpm-workspace.yaml does not exist
    if (!pnpmWorkspaceExists) {
        logger.warn(
            `Expected pnpm-workspace.yaml at ${pnpmWorkspacePath} but it does not exist. If you are experiencing issues, please contact support@buildwithfern.com.`
        );
    }

    // Write pnpmfile.cjs if it does not exist
    if (!pnpmfileExists) {
        logger.debug(`Writing pnpmfile.cjs at ${pnpmfilePath}`);
        await writeFile(pnpmfilePath, PNPMFILE_CJS_CONTENTS);
    }
    // Write .npmrc if it does not exist
    if (!npmrcExists) {
        logger.debug(`Writing .npmrc at ${npmrcPath}`);
        await writeFile(npmrcPath, NPMRC_CONTENTS);
    }
    // Remove instrumentation.js if it exists
    if (instrumentationJsExists) {
        logger.debug(`Removing instrumentation.js at ${absPathToInstrumentationJs}`);
        await rm(absPathToInstrumentationJs);
    }

    try {
        // pnpm install within standalone
        logger.debug("Running pnpm install within standalone");
        await loggingExeca(logger, "pnpm", ["install"], {
            cwd: absPathToStandalone,
            doNotPipeOutput: true
        });
    } catch (error) {
        throw contactFernSupportError(`Failed to install required package due to error: ${error}`);
    }

    // NOTE: symlink resolution now happens immediately after extraction in
    // downloadBundle() — before pnpm i esbuild wipes .pnpm/ targets.

    // Write marker file so we skip this on future cached-bundle runs
    await writeFile(markerPath, new Date().toISOString());
    logger.debug("Windows post-processing completed");
}

/**
 * Resolves symlinks that were filtered out during tar extraction on Windows.
 * The tar bundle contains Unix symlinks that don't work on Windows, so during
 * extraction they are skipped and their metadata is saved to a JSON file.
 * After pnpm install recreates the pnpm-managed symlinks, this function
 * recreates the remaining ones (especially Next.js file-traced symlinks in
 * .next/node_modules/) as directory junctions or file copies.
 */
/**
 * Resolves symlinks that were filtered out during tar extraction on Windows.
 * Must be called immediately after extraction and BEFORE pnpm i esbuild,
 * because pnpm prunes the .pnpm/ virtual store and removes the targets.
 * Uses recursive copy (not junctions) so the resolved packages survive
 * subsequent pnpm operations that may modify node_modules.
 */
async function resolveWindowsSymlinks({
    bundleRoot,
    metadata,
    logger
}: {
    bundleRoot: string;
    metadata?: Array<{ path: string; linkname: string }>;
    logger: Logger;
}): Promise<void> {
    if (!metadata) {
        const metadataPath = path.join(bundleRoot, SYMLINKS_METADATA_FILE);
        if (!(await doesPathExist(AbsoluteFilePath.of(metadataPath)))) {
            logger.debug("No symlink metadata found, skipping symlink resolution");
            return;
        }
        metadata = JSON.parse((await readFile(metadataPath)).toString());
    }

    if (!metadata || metadata.length === 0) {
        return;
    }

    // Only resolve top-level node_modules/ entries (not .pnpm/ internals,
    // not standalone/ which pnpm install will handle later).
    const topLevelEntries = metadata.filter((entry) => {
        const parts = entry.path.split("/");
        return parts[0] === "node_modules" && parts.length === 2 && parts[1] != null && !parts[1].startsWith(".");
    });

    logger.debug(
        `Resolving ${topLevelEntries.length} top-level node_modules symlinks (${metadata.length} total in metadata)`
    );

    let resolved = 0;
    let skipped = 0;
    let failed = 0;

    for (const entry of topLevelEntries) {
        const entryAbsPath = path.join(bundleRoot, entry.path);
        const targetAbsPath = path.resolve(path.dirname(entryAbsPath), entry.linkname);

        try {
            // Skip if destination already exists
            if (await doesPathExist(AbsoluteFilePath.of(entryAbsPath))) {
                skipped++;
                continue;
            }

            // Skip if the target doesn't exist
            if (!(await doesPathExist(AbsoluteFilePath.of(targetAbsPath)))) {
                logger.debug(`Target missing for ${entry.path}: ${targetAbsPath}`);
                skipped++;
                continue;
            }

            // Ensure parent directory exists
            await mkdir(path.dirname(entryAbsPath), { recursive: true });

            const targetStat = await stat(targetAbsPath);
            if (targetStat.isDirectory()) {
                // Recursive copy so the package survives pnpm pruning
                await cp(targetAbsPath, entryAbsPath, { recursive: true });
            } else {
                await copyFile(targetAbsPath, entryAbsPath);
            }
            resolved++;
        } catch (error) {
            failed++;
            logger.debug(`Failed to resolve symlink ${entry.path}: ${error}`);
        }
    }

    logger.debug(`Symlink resolution: ${resolved} resolved, ${skipped} skipped, ${failed} failed`);
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
            // The bundle is already downloaded, but on Windows we may still
            // need to run post-processing (e.g. when the bundle was
            // pre-deployed by CI or extracted externally).
            if (PLATFORM_IS_WINDOWS && app) {
                await postProcessWindowsBundle({ app, logger });
            }
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

            const UNZIP_DURATION_MS = 30000;
            const startTime = Date.now();
            unzipInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const t = Math.min(elapsed / UNZIP_DURATION_MS, 1);
                const p = 1 - Math.pow(1 - t, 3);
                const percentage = Math.min(99, Math.floor(p * 100));
                unzipProgressBar?.update(percentage);
            }, 50);
        }

        // On Windows, collect symlink metadata during extraction so we can
        // recreate them later as directory junctions or file copies.
        const windowsSymlinkEntries: Array<{ path: string; linkname: string }> = [];

        try {
            await decompress(outputZipPath, absolutePathToBundleFolder, {
                filter: (file) => {
                    if (PLATFORM_IS_WINDOWS && file.type === "symlink") {
                        const linkname = (file as unknown as { linkname?: string }).linkname;
                        if (linkname) {
                            windowsSymlinkEntries.push({ path: file.path, linkname });
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

        // write etag
        await writeFile(eTagFilepath, eTag);
        logger.debug(`Downloaded bundle to ${absolutePathToBundleFolder}`);

        // Save symlink metadata on Windows so resolveWindowsSymlinks can
        // recreate them as junctions/copies after pnpm install.
        if (PLATFORM_IS_WINDOWS && windowsSymlinkEntries.length > 0) {
            const metadataPath = path.join(absolutePathToBundleFolder as string, SYMLINKS_METADATA_FILE);
            await writeFile(metadataPath, JSON.stringify(windowsSymlinkEntries));
            logger.debug(`Saved ${windowsSymlinkEntries.length} symlink entries to metadata file`);

            // Resolve symlinks IMMEDIATELY while .pnpm/ targets still exist.
            // This must happen before pnpm i esbuild which prunes .pnpm/.
            await resolveWindowsSymlinks({
                bundleRoot: absolutePathToBundleFolder as string,
                metadata: windowsSymlinkEntries,
                logger
            });
        }

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
                await postProcessWindowsBundle({ app, logger });
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
