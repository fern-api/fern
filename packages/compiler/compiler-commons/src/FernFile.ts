import { RelativeFilePath } from "./RelativeFilePath";

export interface FernFile {
    package: RelativeFilePath;
    fileContents: string;
}
