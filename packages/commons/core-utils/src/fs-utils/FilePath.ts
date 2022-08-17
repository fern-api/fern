import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { RelativeFilePath } from "./RelativeFilePath";

export type FilePath = AbsoluteFilePath | RelativeFilePath;

export const FilePath = {
    of: (value: string): FilePath => value as FilePath,
};
