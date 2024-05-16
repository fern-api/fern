import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createWriteStream } from "fs";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { homedir } from "os";
import { pipeline } from "stream/promises";
import tmp from "tmp-promise";
import xml2js from "xml2js";

const ETAG_FILENAME = "etag";
const PREVIEW_FOLDER_NAME = "preview";
const BUNDLE_FOLDER_NAME = "bundle";
const LOCAL_STORAGE_FOLDER = process.env.LOCAL_STORAGE_FOLDER ?? ".fern";

function getPathToPreviewFolder(): AbsoluteFilePath {
    return join(
        AbsoluteFilePath.of(homedir()),
        RelativeFilePath.of(LOCAL_STORAGE_FOLDER),
        RelativeFilePath.of(PREVIEW_FOLDER_NAME)
    );
}

function getPathToBundleFolder(): AbsoluteFilePath {
    return join(
        AbsoluteFilePath.of(homedir()),
        RelativeFilePath.of(LOCAL_STORAGE_FOLDER),
        RelativeFilePath.of(PREVIEW_FOLDER_NAME)
    );
}

function getPathToEtagFile(): AbsoluteFilePath {
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

export async function downloadBundle({ bucketUrl }: { bucketUrl: string }): Promise<DownloadLocalBundle.Result> {
    const response = await fetch(bucketUrl);
    const body = await response.text();
    const parser = new xml2js.Parser();
    const parsedResponse = await parser.parseStringPromise(body);
    const eTag = parsedResponse?.ListBucketResult?.Contents?.[0]?.ETag?.[0];
    const key = parsedResponse?.ListBucketResult?.Contents?.[0]?.Key?.[0];

    const eTagFilepath = getPathToEtagFile();
    const currentETag = (await doesPathExist(eTagFilepath)) ? (await readFile(eTagFilepath)).toString() : undefined;
    if (currentETag != null && currentETag === eTag) {
        // The bundle is already downloaded
        return {
            type: "success"
        };
    }

    // create tmp directory
    const dir = await tmp.dir({ prefix: "fern" });
    const absoluteDirectoryToTmpDir = AbsoluteFilePath.of(dir.path);

    // download docs ui
    const request = await fetch(`${bucketUrl}/${key}`);
    const outputZipPath = join(absoluteDirectoryToTmpDir, RelativeFilePath.of("output.zip"));

    const contents = request.body;
    if (contents == null) {
        return {
            type: "failure"
        };
    }
    await pipeline(contents, createWriteStream(outputZipPath));

    const absolutePathToPreviewFolder = getPathToPreviewFolder();
    if (await doesPathExist(absolutePathToPreviewFolder)) {
        await rm(absolutePathToPreviewFolder, { recursive: true });
    }
    const absolutePathToTmpBundleFolder = join(absolutePathToPreviewFolder, RelativeFilePath.of(BUNDLE_FOLDER_NAME));
    await mkdir(absolutePathToTmpBundleFolder, { recursive: true });
    await decompress(outputZipPath, absolutePathToLocalOutput);

    // write etag
    await writeFile(join(absoluteDirectoryToTmpDir, RelativeFilePath.of(ETAG_FILENAME)), eTag);
}
