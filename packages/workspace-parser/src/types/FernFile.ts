import { RelativeFilePath } from "@fern-api/config-management-commons";
export interface FernFile {
    filepath: RelativeFilePath;
    fileContents: string;
}
