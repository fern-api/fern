import { RelativeFilePath } from "@fern-api/core-utils";

export interface FernFile {
    filepath: RelativeFilePath;
    fileContents: string;
}
