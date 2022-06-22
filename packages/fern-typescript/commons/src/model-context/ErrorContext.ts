import { ErrorName } from "@fern-api/api";
import { SourceFile, ts } from "ts-morph";
import { BaseModelContext } from "./BaseModelContext";
import { ImportStrategy } from "./utils/ImportStrategy";

export declare namespace ErrorContext {
    namespace getReferenceToError {
        interface Args {
            errorName: ErrorName;
            referencedIn: SourceFile;
            importStrategy?: ImportStrategy;
        }
    }
}

export class ErrorContext extends BaseModelContext {
    public addErrorDefinition(errorName: ErrorName, withFile: (file: SourceFile) => void): void {
        this.addFile({
            fileNameWithoutExtension: errorName.name,
            fernFilepath: errorName.fernFilepath,
            intermediateDirectories: ["errors"],
            withFile,
        });
    }

    public getReferenceToError({
        errorName,
        importStrategy,
        referencedIn,
    }: ErrorContext.getReferenceToError.Args): ts.TypeReferenceNode {
        return this.getReferenceToTypeInModel({
            exportedType: errorName.name,
            fernFilepath: errorName.fernFilepath,
            importStrategy,
            referencedIn,
        });
    }
}
