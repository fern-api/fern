import { fetcher } from "@fern-typescript/fetcher";
import decompress from "decompress";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { homedir } from "os";
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
    app = false
}: {
    bucketUrl: string;
    logger: Logger;
    preferCached: boolean;
    app?: boolean;
}): Promise<DownloadLocalBundle.Result> {
    logger.debug("Setting up docs preview bundle...");
    const response = await fetcher<string>({
        url: bucketUrl,
        method: "GET",
        responseType: "text",
        duplex: "half"
    });
    if (!response.ok) {
        return {
            type: "failure"
        };
    }
    const body = response.body;
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
    const docsBundleZipResponse = await fetcher<unknown>({
        url: docsBundleUrl,
        method: "GET",
        responseType: "arrayBuffer",
        duplex: "half"
    });

    if (!docsBundleZipResponse.ok) {
        let errorMessage: string;
        if (docsBundleZipResponse.error.reason === "status-code") {
            errorMessage = `Failed to download docs preview bundle. Status code: ${docsBundleZipResponse.error.statusCode}`;
        } else if (docsBundleZipResponse.error.reason === "unknown") {
            errorMessage = `Failed to download docs preview bundle. Error: ${docsBundleZipResponse.error.errorMessage}`;
        } else {
            errorMessage = `Failed to download docs preview bundle. Error: ${docsBundleZipResponse.error.reason}`;
        }
        logger.error(errorMessage);
        return {
            type: "failure"
        };
    }
    const outputZipPath = join(absoluteDirectoryToTmpDir, RelativeFilePath.of("output.zip"));

    const contents = docsBundleZipResponse.body;
    if (contents == null) {
        return {
            type: "failure"
        };
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const nodeBuffer = Buffer.from(contents as any);
    await writeFile(outputZipPath, new Uint8Array(nodeBuffer));
    logger.debug(`Wrote output.zip to ${outputZipPath}`);

    const absolutePathToPreviewFolder = getPathToPreviewFolder({ app });
    if (await doesPathExist(absolutePathToPreviewFolder)) {
        await rm(absolutePathToPreviewFolder, { recursive: true });
    }
    await mkdir(absolutePathToPreviewFolder, { recursive: true });
    logger.debug(`rm -rf ${absolutePathToPreviewFolder}`);

    const absolutePathToBundleFolder = getPathToBundleFolder({ app });
    await mkdir(absolutePathToBundleFolder, { recursive: true });
    await decompress(outputZipPath, absolutePathToBundleFolder);

    // write etag
    await writeFile(eTagFilepath, eTag);
    logger.debug(`Downloaded bundle to ${absolutePathToBundleFolder}`);

    if (app) {
        // install esbuild
        logger.debug("Installing esbuild");
        await loggingExeca(logger, "pnpm", ["i", "esbuild"], {
            cwd: absolutePathToBundleFolder,
            doNotPipeOutput: true
        });
        // resolve imports
        logger.debug("Resolve esbuild imports");
        await loggingExeca(logger, "node", ["install-esbuild.js"], {
            cwd: absolutePathToBundleFolder,
            doNotPipeOutput: true
        });
    }

    return {
        type: "success"
    };
}
