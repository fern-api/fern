import { getPathModule } from "./getPathModule";
import { convertToOsPath } from "./convertToOsPath";

const path = getPathModule();

export type AbsoluteFilePath = string & {
    __AbsoluteFilePath: void;
};

export const AbsoluteFilePath = {
    of: (value: string): AbsoluteFilePath => {
        if (!path.isAbsolutePath(value)) {
            throw new Error("Filepath is not absolute: " + value);
        }
        return convertToOsPath(value) as AbsoluteFilePath;
    }
};
