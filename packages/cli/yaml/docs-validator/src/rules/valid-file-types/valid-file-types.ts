import { doesPathExist } from "@fern-api/fs-utils";
import { fileTypeFromBuffer } from "file-type";
import { readFile } from "fs/promises";
import isSvg from "is-svg";
import path from "path";
import { Rule } from "../../Rule";

const ALLOWED_FILE_TYPES = [
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
];

export const ValidFileTypes: Rule = {
    name: "valid-file-types",
    create: () => {
        return {
            filepath: async ({ absoluteFilepath, value, willBeUploaded }) => {
                if (!willBeUploaded) {
                    return [];
                }

                const doesExist = await doesPathExist(absoluteFilepath);
                if (doesExist) {
                    const isValid = await isValidFileType(absoluteFilepath);
                    if (!isValid) {
                        return [
                            {
                                severity: "error",
                                message: `File type of ${value} is invalid`
                            }
                        ];
                    }
                }

                return [];
            }
        };
    }
};

export const isValidFileType = async (absoluteFilepath: string): Promise<boolean> => {
    const file = await readFile(absoluteFilepath);

    // exit early if the file is an SVG
    if (isSvg(file.toString("utf-8"))) {
        return true;
    }

    // otherwise, check the file type
    const fileType = await fileTypeFromBuffer(file);
    if (fileType) {
        return ALLOWED_FILE_TYPES.includes(fileType.mime);
    }

    // if `fileType` is undefined, its type can't be parsed because it's likely a text file
    if (path.extname(absoluteFilepath) === "js") {
        // let JS files through
        return true;
    }

    // in all other cases, return false
    return false;
};
