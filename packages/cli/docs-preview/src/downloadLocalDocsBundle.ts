import decompress from "decompress";
import fs from "fs";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { homedir, platform } from "os";
import path from "path";
import tmp from "tmp-promise";
import xml2js from "xml2js";

import { AbsoluteFilePath, RelativeFilePath, doesPathExist, join } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";

const ETAG_FILENAME = "etag";
const PREVIEW_FOLDER_NAME = "preview";
const APP_PREVIEW_FOLDER_NAME = "app-preview";
const BUNDLE_FOLDER_NAME = "bundle";
const NEXT_BUNDLE_FOLDER_NAME = ".next";
const LOCAL_STORAGE_FOLDER = process.env.LOCAL_STORAGE_FOLDER ?? ".fern";

export function getLocalStorageFolder(): AbsoluteFilePath {
    return join(AbsoluteFilePath.of(homedir()), RelativeFilePath.of(LOCAL_STORAGE_FOLDER));
}

export function getPathToPreviewFolder({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(
        AbsoluteFilePath.of(homedir()),
        RelativeFilePath.of(LOCAL_STORAGE_FOLDER),
        RelativeFilePath.of(app ? APP_PREVIEW_FOLDER_NAME : PREVIEW_FOLDER_NAME)
    );
}

export function getPathToBundleFolder({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(
        AbsoluteFilePath.of(homedir()),
        RelativeFilePath.of(LOCAL_STORAGE_FOLDER),
        RelativeFilePath.of(app ? APP_PREVIEW_FOLDER_NAME : PREVIEW_FOLDER_NAME),
        RelativeFilePath.of(app ? NEXT_BUNDLE_FOLDER_NAME : BUNDLE_FOLDER_NAME)
    );
}

export function getPathToEtagFile({ app = false }: { app?: boolean }): AbsoluteFilePath {
    return join(
        AbsoluteFilePath.of(homedir()),
        RelativeFilePath.of(LOCAL_STORAGE_FOLDER),
        RelativeFilePath.of(app ? APP_PREVIEW_FOLDER_NAME : PREVIEW_FOLDER_NAME),
        RelativeFilePath.of(ETAG_FILENAME)
    );
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

    // const docsBundleUrl = new URL(key, bucketUrl).href;
    // logger.debug(`Downloading docs preview bundle from ${docsBundleUrl}`);
    // download docs bundle
    try {
        // logger.debug("Fetching docs bundle zip response");
        // const docsBundleZipResponse = await fetch(docsBundleUrl);
        // if (!docsBundleZipResponse.ok) {
        //     logger.error(`Failed to download docs preview bundle. Status code: ${docsBundleZipResponse.status}`);
        //     return {
        //         type: "failure"
        //     };
        // }
        // logger.debug("Joining output zip path");
        // const outputZipPath = join(
        //     absoluteDirectoryToTmpDir,
        //     RelativeFilePath.of(tryTar ? "output.tar.gz" : "output.zip")
        // );

        // if (docsBundleZipResponse.body == null) {
        //     logger.debug("Docs bundle zip response body is null");
        //     return {
        //         type: "failure"
        //     };
        // }

        // logger.debug("Converting docs bundle zip response to buffer");
        // const nodeBuffer = Buffer.from(await docsBundleZipResponse.arrayBuffer());
        // logger.debug("Writing docs bundle zip to file");
        // await writeFile(outputZipPath, new Uint8Array(nodeBuffer));
        // logger.debug(`Wrote ${tryTar ? "output.tar.gz" : "output.zip"} to ${outputZipPath}`);
        const outputZipPath =
            process.platform === "win32"
                ? "C:\\Users\\cathe\\git\\fern-platform\\packages\\fern-docs\\bundle\\next.tar.gz"
                : "/Volumes/git/fern-platform/packages/fern-docs/bundle/next.tar.gz";
        logger.debug(`outputZipPath: ${outputZipPath}`);

        logger.debug("Getting path to preview folder");
        const absolutePathToPreviewFolder = getPathToPreviewFolder({ app });
        logger.debug("Checking if preview folder exists");
        if (await doesPathExist(absolutePathToPreviewFolder)) {
            logger.debug("Preview folder exists, removing");
            await rm(absolutePathToPreviewFolder, { recursive: true });
        }
        logger.debug("Creating preview folder");
        await mkdir(absolutePathToPreviewFolder, { recursive: true });
        logger.debug(`jsklan-foobar: rm -rf ${absolutePathToPreviewFolder}`);

        logger.debug("Getting path to bundle folder");
        const absolutePathToBundleFolder = getPathToBundleFolder({ app });
        logger.debug("Creating bundle folder");
        await mkdir(absolutePathToBundleFolder, { recursive: true });
        logger.debug(
            `Calling decompress with outputZipPath: ${outputZipPath}, absolutePathToBundleFolder: ${absolutePathToBundleFolder}`
        );
        await decompress(outputZipPath, absolutePathToBundleFolder, {
            filter: (file) => {
                if (file.type === "symlink") {
                    // file.data contains the symlink target as a Buffer
                    const target = file.data.toString();
                    const symlinkPath = path.resolve("output-directory", file.path);
                    const targetPath = path.resolve(path.dirname(symlinkPath), target);
                    if (targetPath.includes("node_modules/next") || targetPath.includes("node_modules\\next")) {
                        logger.debug(`Found symlink: \n\t${symlinkPath} -> \n\t${targetPath}`);
                    }
                    if (!fs.existsSync(targetPath)) {
                        // Dangling symlink, skip it
                        //   logger.debug(`Dangling symlink: ${symlinkPath} -> ${targetPath}`);
                        if (targetPath.includes("node_modules/next") || targetPath.includes("node_modules\\next")) {
                            logger.debug(`Dangling symlink: \n\t${symlinkPath} -> \n\t${targetPath}`);
                        }
                        if (platform() === "win32") {
                            return false;
                        }
                        return true;
                    }
                }
                return true;
            }
        });

        // write etag
        logger.debug("Writing etag file");
        await writeFile(eTagFilepath, eTag);
        logger.debug(`Downloaded bundle to ${absolutePathToBundleFolder}`);

        if (app) {
            // check if pnpm exists
            logger.debug("Checking if pnpm is installed");
            try {
                await loggingExeca(logger, process.platform === "win32" ? "where" : "which", ["pnpm"], {
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
            logger.debug("Verifying pnpm installation");
            try {
                await loggingExeca(logger, process.platform === "win32" ? "where" : "which", ["pnpm"], {
                    cwd: absolutePathToBundleFolder,
                    doNotPipeOutput: true
                });
            } catch (error) {
                logger.error(
                    "Requires [pnpm] to run local development. Please run: npm install -g pnpm, and then: fern docs dev"
                );

                // remove incomplete bundle
                logger.debug("Checking if incomplete preview folder exists for removal");
                if (await doesPathExist(absolutePathToPreviewFolder)) {
                    logger.debug("Removing incomplete preview folder");
                    await rm(absolutePathToPreviewFolder, { recursive: true });
                }
                logger.debug(`rm -rf ${absolutePathToPreviewFolder}`);
                return {
                    type: "failure"
                };
            }

            try {
                // install esbuild
                logger.debug("Installing esbuild");
                await loggingExeca(logger, "pnpm", ["i", "esbuild"], {
                    cwd: absolutePathToBundleFolder,
                    doNotPipeOutput: true
                });
            } catch (error) {
                logger.error("Failed to install required package. Please reach out to support@buildwithfern.com.");

                // remove incomplete bundle
                logger.debug("Checking if incomplete preview folder exists for removal");
                if (await doesPathExist(absolutePathToPreviewFolder)) {
                    logger.debug("Removing incomplete preview folder");
                    await rm(absolutePathToPreviewFolder, { recursive: true });
                }
                logger.debug(`rm -rf ${absolutePathToPreviewFolder}`);
                return {
                    type: "failure"
                };
            }

            try {
                // resolve imports
                logger.debug("Resolve esbuild imports");
                await loggingExeca(logger, "node", ["install-esbuild.js"], {
                    cwd: absolutePathToBundleFolder,
                    doNotPipeOutput: true
                });
            } catch (error) {
                logger.error("Failed to resolve imports. Please reach out to support@buildwithfern.com.");

                // remove incomplete bundle
                logger.debug("Checking if incomplete preview folder exists for removal");
                if (await doesPathExist(absolutePathToPreviewFolder)) {
                    logger.debug("Removing incomplete preview folder");
                    await rm(absolutePathToPreviewFolder, { recursive: true });
                }
                logger.debug(`rm -rf ${absolutePathToPreviewFolder}`);
                return {
                    type: "failure"
                };
            }
        }

        return {
            type: "success"
        };
    } catch (error) {
        logger.error(`jsklan-foobar: Failed to download docs preview bundle. Error: ${error}`);
        return {
            type: "failure"
        };
    }
}
