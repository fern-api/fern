import { AbsoluteFilePath } from "@fern-api/fs-utils";

export interface APIChangelog {
    files: ChangelogFile[];
}

export interface ChangelogFile {
    absoluteFilepath: AbsoluteFilePath;
    contents: string;
}
