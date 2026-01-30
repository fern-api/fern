import { AbsoluteFilePath } from "@fern-api/fs-utils";

export interface DetectResult {
    found: boolean;
    absoluteFilePath?: AbsoluteFilePath;
}
