import path from "path";

export type RelativeFilePath = string & {
    __RelativeFilePath: void;
};

export const RelativeFilePath = {
    of: (value: string): RelativeFilePath => {
        if (path.isAbsolute(value)) {
            throw new Error("Filepath is not relative: " + value);
        }
        return value as RelativeFilePath;
    }
};
