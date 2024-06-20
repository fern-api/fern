import { doesPathExist } from "@fern-api/fs-utils";
import { fileTypeFromBuffer } from "file-type";
import { readFile } from "fs/promises";
import isSvg from "is-svg";
import { Rule } from "../../Rule";

const ALLOWED_FILE_TYPES = [
    // image files
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/tiff",
    // video files
    "video/quicktime",
    "video/mp4",
    "video/webm",
    // audio files
    "audio/mpeg",
    "audio/ogg",
    "audio/wav",
    // document files
    "application/pdf"
];

export const ValidFileTypes: Rule = {
    name: "valid-file-types",
    create: () => {
        return {
            filepath: async ({ absoluteFilepath, value }) => {
                const doesExist = await doesPathExist(absoluteFilepath);

                if (doesExist) {
                    const file = await readFile(absoluteFilepath);
                    const isValid = await isValidFileType(file);

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

export const isValidFileType = async (file: Buffer): Promise<boolean> => {
    if (isSvg(file.toString("utf-8"))) {
        // exit early if the file is an SVG
        return true;
    }

    // otherwise, check the file type
    const fileType = await fileTypeFromBuffer(file);
    if (fileType && ALLOWED_FILE_TYPES.includes(fileType.mime)) {
        return true;
    }

    // in all other cases, return false
    return false;
};
