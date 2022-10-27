import { RelativeFilePath } from "@fern-api/fs-utils";

export interface FernFile {
    filepath: RelativeFilePath;
    fileContents: string;
}
