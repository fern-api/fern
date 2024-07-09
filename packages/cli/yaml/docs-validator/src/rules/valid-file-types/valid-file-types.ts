import { doesPathExist } from "@fern-api/fs-utils";
import { fileTypeFromBuffer, type MimeType } from "file-type";
import { readFile } from "fs/promises";
import path from "path";
import { Rule, RuleViolation } from "../../Rule";

const ALLOWED_FILE_TYPES = new Set<MimeType>([
    // image files
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/tiff",
    "image/x-icon",
    // video files
    "video/quicktime",
    "video/mp4",
    "video/webm",
    // audio files
    "audio/mpeg",
    "audio/ogg",
    "audio/wav",
    // document files
    "application/pdf",
    // font files
    "font/woff",
    "font/woff2",
    "font/otf",
    "font/ttf"
]);

const ALLOWED_EXTENSIONS = new Set(["js", "svg"]);

export const ValidFileTypes: Rule = {
    name: "valid-file-types",
    create: () => {
        return {
            filepath: async ({ absoluteFilepath, willBeUploaded }) => {
                if (!willBeUploaded) {
                    return [];
                }

                const doesExist = await doesPathExist(absoluteFilepath);
                if (doesExist) {
                    return getViolationsForFile(absoluteFilepath);
                }

                return [];
            }
        };
    }
};

export const getViolationsForFile = async (absoluteFilepath: string): Promise<RuleViolation[]> => {
    const file = await readFile(absoluteFilepath);

    // otherwise, check the file type
    const fileType = await fileTypeFromBuffer(file);
    if (fileType != null) {
        if (ALLOWED_FILE_TYPES.has(fileType.mime)) {
            return [];
        } else {
            return [
                {
                    severity: "error",
                    message: `The file type of ${fileType.mime} is not allowed: ${absoluteFilepath}`
                }
            ];
        }
    }

    let extension = path.extname(absoluteFilepath).toLowerCase();
    if (extension.startsWith(".")) {
        extension = extension.substring(1);
    }
    // if `fileType` is undefined, its type can't be parsed because it's likely a text file
    if (ALLOWED_EXTENSIONS.has(extension)) {
        return [];
    }

    // in all other cases, return false
    return [
        {
            severity: "error",
            message: `File is not allowed to be uploaded: ${absoluteFilepath}`
        }
    ];
};
