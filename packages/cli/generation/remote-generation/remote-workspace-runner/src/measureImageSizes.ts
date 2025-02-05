import imageSize from "image-size";
import { chunk } from "lodash-es";
import { promisify } from "util";

import { isNonNullish } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

interface AbsoluteImageFilePath {
    filePath: AbsoluteFilePath;
    width: number;
    height: number;
    blurDataUrl: string | undefined;
}

const sizeOf = promisify(imageSize);
export async function measureImageSizes(
    imageFilePaths: AbsoluteFilePath[],
    batchSize: number,
    context: TaskContext
): Promise<Map<AbsoluteFilePath, AbsoluteImageFilePath>> {
    const filepathChunks = chunk(imageFilePaths, batchSize);
    const imageFilesWithMetadata: AbsoluteImageFilePath[] = [];
    for (const filepaths of filepathChunks) {
        const chunk: (AbsoluteImageFilePath | undefined)[] = await Promise.all(
            filepaths.map(async (filePath): Promise<AbsoluteImageFilePath | undefined> => {
                try {
                    const size = await sizeOf(filePath);
                    if (size == null || size.height == null || size.width == null) {
                        return undefined;
                    }
                    return { filePath, width: size.width, height: size.height, blurDataUrl: undefined };
                } catch (e) {
                    context.logger.error(`Failed to measure image size for ${filePath}. ${(e as Error)?.message}`);
                    return undefined;
                }
            })
        );

        imageFilesWithMetadata.push(...chunk.filter(isNonNullish));
    }
    return new Map(imageFilesWithMetadata.map((file) => [file.filePath, file]));
}
