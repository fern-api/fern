import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

import { SUPPORTED_MEDIA_EXTENSIONS } from "../../constants";
import type { Result } from "../../types/result";
import { getErrorMessage } from "../error";
import { fetchImage } from "../network";
import { getFileExtension } from "./extension";
import { write } from "./file";

export async function downloadImage(src: string): Promise<Result<[string, string]>> {
    if (src.startsWith("data:image/")) {
        return { success: true, data: [src, src] };
    }
    const basePath = join(process.cwd(), "fern");
    try {
        let filename = await writeImageToFile(src, join(basePath, "images"));
        filename = filename.replace(basePath, "");
        return { success: true, data: [src, filename] };
    } catch (error) {
        return { success: false, data: undefined };
    }
}

async function writeImageToFile(src: string, rootPath: string): Promise<string> {
    const filename = removeMetadataFromImageSrc(src);
    const imagePath = join(rootPath, filename);

    if (!isValidImageSrc(filename)) {
        throw new Error(`${filename} - file extension not supported`);
    }
    if (existsSync(imagePath)) {
        return imagePath;
    }

    try {
        mkdirSync(dirname(imagePath), { recursive: true });
    } catch (error) {
        throw new Error(`${imagePath} - failed to create directory`);
    }

    try {
        const imageData = await fetchImage(src);
        write(imagePath, imageData);
        return imagePath;
    } catch (error) {
        throw new Error(`Failed to download file from source: ${getErrorMessage(error)}`);
    }
}

export function isValidImageSrc(src: string) {
    if (!src) {
        return false;
    }
    const ext = getFileExtension(src);
    if (ext && !SUPPORTED_MEDIA_EXTENSIONS.includes(ext)) {
        return false;
    }
    return true;
}

export function removeMetadataFromImageSrc(src: string): string {
    if (src.startsWith("http")) {
        src = new URL(src).pathname;
    }
    return (
        decodeURIComponent(
            src
                .split("#")[0]!
                .split("?")[0]!
                .replace(/[/]{2,}/g, "/")
        ).replace(/(?:_{2,}|[\s%#&{}\\<>*?$!'":@+`|=])/g, "-") || "image"
    );
}
