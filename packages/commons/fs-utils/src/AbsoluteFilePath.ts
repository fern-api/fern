import path from "path";

import { convertToOsPath } from "./osPathConverter";

export type AbsoluteFilePath = string & {
    __AbsoluteFilePath: void;
};

export const AbsoluteFilePath = {
    of: (value: string): AbsoluteFilePath => {
        if (!path.isAbsolute(value)) {
            throw new Error("Filepath is not absolute: " + value);
        }
        return convertToOsPath(value) as AbsoluteFilePath;
    }
};
