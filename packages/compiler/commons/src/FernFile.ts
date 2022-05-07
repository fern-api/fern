import { RelativeFilePath } from "./RelativeFilePath";

export interface FernFile {
    filepath: RelativeFilePath;
    fileContents: string;
}
