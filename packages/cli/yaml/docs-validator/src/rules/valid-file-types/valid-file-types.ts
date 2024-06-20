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
                const file = await readFile(absoluteFilepath);

                if (!isSvg(file.toString("utf-8"))) {
                    // if the file is not an SVG, check the file type
                    const fileType = await fileTypeFromBuffer(file);
                    // if the file can't be parsed or is not an allowed file type return an error
                    if (!fileType || !ALLOWED_FILE_TYPES.includes(fileType.mime)) {
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
