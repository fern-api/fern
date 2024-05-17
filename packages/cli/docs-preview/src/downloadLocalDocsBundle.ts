import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createWriteStream } from "fs";
import { readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { pipeline } from "stream/promises";
import tmp from "tmp-promise";
import xml2js from "xml2js";

const ETAG_FILENAME = "etag";
const PREVIEW_FOLDER_NAME = "preview";
const LOCAL_STORAGE_FOLDER = process.env.LOCAL_STORAGE_FOLDER ?? ".fern";

function getPathToPreviewFolder(): AbsoluteFilePath {
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

export async function downloadBundle({ bucketUrl }: { bucketUrl: string }) {
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
        return;
    }

    // create tmp directory
    const dir = await tmp.dir({ prefix: "fern" });
    const absoluteDirectoryToTmpDir = AbsoluteFilePath.of(dir.path);

    // download docs ui
    const request = await fetch(`${bucketUrl}/${key}`);
    const outputZipPath = join(absoluteDirectoryToTmpDir, RelativeFilePath.of("output.zip"));
    await pipeline(await request.blob(), createWriteStream(outputZipPath));
    if (await doesPathExist(absolutePathToLocalOutput)) {
        await rm(absolutePathToLocalOutput, { recursive: true });
    }
    await mkdir(absolutePathToLocalOutput, { recursive: true });
    await decompress(outputZipPath, absolutePathToLocalOutput);

    // write etag
    await writeFile(join(absoluteDirectoryToTmpDir, RelativeFilePath.of(ETAG_FILENAME)), eTag);
}
