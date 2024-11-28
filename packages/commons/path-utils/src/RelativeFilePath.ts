import { getPathModule } from "./getPathModule";
import { convertToOsPath } from "./convertToOsPath";

const path = getPathModule();

export type RelativeFilePath = string & {
    __RelativeFilePath: void;
};

export const RelativeFilePath = {
    of: (value: string): RelativeFilePath => {
        if (path.isAbsolute(value)) {
            throw new Error("Filepath is not relative: " + value);
        }
        return convertToOsPath(value) as RelativeFilePath;
    }
};
