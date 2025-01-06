import chardet from "chardet";
import { type MimeType, fileTypeFromBuffer } from "file-type";
import { readFile } from "fs/promises";
import path from "path";

import { doesPathExist } from "@fern-api/fs-utils";

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
    "application/xml",
    // font files
    "font/woff",
    "font/woff2",
    "font/otf",
    "font/ttf"
]);

const ALLOWED_EXTENSIONS = new Set(["js", "svg"]);

// allowed text encodings
const ALLOWED_ENCODINGS = new Set([
    "ASCII", // 7-bit American Standard Code for Information Interchange
    "UTF-8", // default
    "UTF-16", // 16-bit Unicode Transformation Format
    "ISO-8859-1", // Latin-1 (Western European)
    "ISO-8859-2", // Latin-2 (Central European)
    "ISO-8859-3", // Latin-3 (South European)
    "ISO-8859-4", // Latin-4 (North European)
    "ISO-8859-5", // Latin/Cyrillic (Russian)
    "ISO-8859-6", // Latin/Arabic
    "ISO-8859-7", // Latin/Greek
    "ISO-8859-8", // Latin/Hebrew
    "ISO-8859-9", // Latin-5 (Turkish)
    "ISO-8859-10", // Latin-6 (Nordic)
    "ISO-8859-13", // Latin-7 (Baltic Rim)
    "ISO-8859-14", // Latin-8 (Celtic)
    "ISO-8859-15", // Latin-9 (Euro)
    "ISO-8859-16", // Latin-10 (South-Eastern European)
    "WINDOWS-1250", // Central European
    "WINDOWS-1251", // Cyrillic
    "WINDOWS-1252", // Western European
    "WINDOWS-1253", // Greek
    "WINDOWS-1254", // Turkish
    "WINDOWS-1255", // Hebrew
    "WINDOWS-1256", // Arabic
    "WINDOWS-1257", // Baltic
    "WINDOWS-1258", // Vietnamese
    "SHIFT_JIS", // Japanese
    "SHIFT-JIS", // Japanese
    "EUC-JP", // Japanese
    "ISO-2022-JP", // Japanese
    "BIG5", // Chinese Traditional
    "GB2312", // Chinese Simplified
    "GB18030", // Chinese government standard
    "KOI8-R" // Russian
]);

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
    const file = new Uint8Array(await readFile(absoluteFilepath));

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
        const encoding = chardet.detect(file);
        if (encoding == null) {
            return [
                {
                    severity: "error",
                    message: `The encoding of the file could not be detected: ${absoluteFilepath}`
                }
            ];
        }
        if (!ALLOWED_ENCODINGS.has(encoding.toUpperCase())) {
            return [
                {
                    severity: "error",
                    message: `The encoding of ${encoding} is not allowed: ${absoluteFilepath}`
                }
            ];
        }

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
