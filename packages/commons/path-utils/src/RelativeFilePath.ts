import { convertToOsPath } from "./convertToOsPath.js";
import { isAbsolute } from "./isAbsolute.js";

export type RelativeFilePath = string & {
    __RelativeFilePath: void;
};

export const RelativeFilePath = {
    of: (value: string): RelativeFilePath => {
        if (isAbsolute(value)) {
            throw new Error("Filepath is not relative: " + value);
        }
        return convertToOsPath(value) as RelativeFilePath;
    }
};
