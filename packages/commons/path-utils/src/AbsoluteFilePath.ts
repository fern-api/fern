import { convertToOsPath } from "./convertToOsPath.js";
import { isAbsolute } from "./isAbsolute.js";

export type AbsoluteFilePath = string & {
    __AbsoluteFilePath: void;
};

export const AbsoluteFilePath = {
    of: (value: string): AbsoluteFilePath => {
        if (!isAbsolute(value)) {
            throw new Error("Filepath is not absolute: " + value);
        }
        return convertToOsPath(value) as AbsoluteFilePath;
    }
};
