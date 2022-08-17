export type AbsoluteFilePath = `/${string}`;

export const AbsoluteFilePath = {
    of: (value: string): AbsoluteFilePath => {
        if (!value.startsWith("/")) {
            throw new Error("Filepath is not absolute: " + value);
        }
        return value as AbsoluteFilePath;
    },
};
