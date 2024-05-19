import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import decompress from "decompress";
import { createWriteStream } from "fs";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { homedir } from "os";
import path from "path";
import { pipeline } from "stream/promises";
import tmp from "tmp-promise";
import xml2js from "xml2js";

const ETAG_FILENAME = "etag";
const PREVIEW_FOLDER_NAME = "preview";
const BUNDLE_FOLDER_NAME = "bundle";
const LOCAL_STORAGE_FOLDER = process.env.LOCAL_STORAGE_FOLDER ?? ".fern";

export function getLocalStorageFolder(): AbsoluteFilePath {
    return join(AbsoluteFilePath.of(homedir()), RelativeFilePath.of(LOCAL_STORAGE_FOLDER));
}

export function getPathToPreviewFolder(): AbsoluteFilePath {
    return join(
        AbsoluteFilePath.of(homedir()),
        RelativeFilePath.of(LOCAL_STORAGE_FOLDER),
        RelativeFilePath.of(PREVIEW_FOLDER_NAME)
    );
}

export function getPathToBundleFolder(): AbsoluteFilePath {
    return join(
        AbsoluteFilePath.of(homedir()),
        RelativeFilePath.of(LOCAL_STORAGE_FOLDER),
        RelativeFilePath.of(PREVIEW_FOLDER_NAME),
        RelativeFilePath.of(BUNDLE_FOLDER_NAME)
    );
}

export function getPathToEtagFile(): AbsoluteFilePath {
    return join(
        AbsoluteFilePath.of(homedir()),
        RelativeFilePath.of(LOCAL_STORAGE_FOLDER),
        RelativeFilePath.of(PREVIEW_FOLDER_NAME),
        RelativeFilePath.of(ETAG_FILENAME)
    );
}

export declare namespace DownloadLocalBundle {
    type Result = SuccesResult | FailureResult;

    interface SuccesResult {
        type: "success";
    }

    interface FailureResult {
        type: "failure";
    }
}

export async function downloadBundle({
    bucketUrl,
    logger,
    preferCached
}: {
    bucketUrl: string;
    logger: Logger;
    preferCached: boolean;
}): Promise<DownloadLocalBundle.Result> {
    logger.debug("Setting up docs preview bundle...");
    const response = await fetch(bucketUrl);
    const body = await response.text();
    const parser = new xml2js.Parser();
    const parsedResponse = await parser.parseStringPromise(body);
    const eTag = parsedResponse?.ListBucketResult?.Contents?.[0]?.ETag?.[0];
    const key = parsedResponse?.ListBucketResult?.Contents?.[0]?.Key?.[0];

    const eTagFilepath = getPathToEtagFile();
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
        }
    }

    // create tmp directory
    const dir = await tmp.dir({ prefix: "fern" });
    const absoluteDirectoryToTmpDir = AbsoluteFilePath.of(dir.path);
    logger.debug(`Created tmp directory ${absoluteDirectoryToTmpDir}`);

    // download docs bundle
    const docsBundleZipResponse = await fetch(`${path.join(bucketUrl, key)}`);
    const outputZipPath = join(absoluteDirectoryToTmpDir, RelativeFilePath.of("output.zip"));

    const contents = docsBundleZipResponse.body;
    if (contents == null) {
        return {
            type: "failure"
        };
    }
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    await pipeline(contents as any, createWriteStream(outputZipPath));
    logger.debug(`Wrote output.zip to ${outputZipPath}`);

    const absolutePathToPreviewFolder = getPathToPreviewFolder();
    if (await doesPathExist(absolutePathToPreviewFolder)) {
        await rm(absolutePathToPreviewFolder, { recursive: true });
    }
    await mkdir(absolutePathToPreviewFolder, { recursive: true });
    logger.debug(`rm -rf ${absolutePathToPreviewFolder}`);

    const absolutePathToBundleFolder = getPathToBundleFolder();
    await mkdir(absolutePathToBundleFolder, { recursive: true });
    await decompress(outputZipPath, absolutePathToBundleFolder);

    // write etag
    await writeFile(eTagFilepath, eTag);
    logger.debug(`Downloaded bundle to ${absolutePathToBundleFolder}`);

    return {
        type: "success"
    };
}
