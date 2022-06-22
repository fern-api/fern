import { ErrorName } from "@fern-api/api";
import { Directory, SourceFile, ts } from "ts-morph";
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
    constructor(modelDirectory: Directory) {
        super({
            modelDirectory,
            intermediateDirectories: ["errors"],
        });
    }

    public addErrorDefinition(errorName: ErrorName, withFile: (file: SourceFile) => void): void {
        this.addFile({
            item: {
                typeName: errorName.name,
                fernFilepath: errorName.fernFilepath,
            },
            withFile,
        });
    }

    public getReferenceToError({
        errorName,
        importStrategy,
        referencedIn,
    }: ErrorContext.getReferenceToError.Args): ts.TypeReferenceNode {
        return this.getReferenceToTypeInModel({
            item: {
                typeName: errorName.name,
                fernFilepath: errorName.fernFilepath,
            },
            importStrategy,
            referencedIn,
        });
    }
}
