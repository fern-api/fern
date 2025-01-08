import { convertToOsPath } from "./convertToOsPath";
import { isAbsolute } from "./isAbsolute";

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
