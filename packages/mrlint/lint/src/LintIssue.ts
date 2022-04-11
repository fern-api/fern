export type LintIssue = LintIssue.IncorrectFileContents | LintIssue.MissingFile | LintIssue.UnexpectedFile;

export declare namespace LintIssue {
    export interface IncorrectFileContents {
        type: LintIssueType.INCORRECT_FILE_CONTENTS;
        file: PackageFileReference;
        expectedFileContents: string;
        actualFileContents: string;
    }

    export interface MissingFile {
        type: LintIssueType.MISSING_FILE;
        file: PackageFileReference;
    }

    export interface UnexpectedFile {
        type: LintIssueType.UNEXPECTED_FILE;
        file: PackageFileReference;
    }
}

export enum LintIssueType {
    INCORRECT_FILE_CONTENTS = "INCORRECT_FILE_CONTENTS",
    MISSING_FILE = "MISSING_FILE",
    UNEXPECTED_FILE = "UNEXPECTED_FILE",
}

export interface PackageFileReference {
    fullPath: string;
    pathRelativeToRoot: string;
    pathRelativeToPackage: string;
}
