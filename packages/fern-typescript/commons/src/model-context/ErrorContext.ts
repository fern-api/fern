import { ErrorName } from "@fern-api/api";
import { SourceFile, ts } from "ts-morph";
import { BaseModelContext } from "./base-context/BaseModelContext";

export enum ImportStrategy {
    MODEL_NAMESPACE_IMPORT,
    NAMED_IMPORT,
}

export class ErrorContext extends BaseModelContext {
    public addErrorDefinition(errorName: ErrorName, withFile: (file: SourceFile) => void): void {
        this.addFile(errorName.name, errorName.fernFilepath, ["errors"], withFile);
    }

    public getReferenceToError({
        errorName,
        importStrategy,
        referencedIn,
    }: {
        errorName: ErrorName;
        importStrategy: ImportStrategy;
        referencedIn: SourceFile;
    }): ts.TypeNode {
        return this.getReferenceToTypeInModel({
            exportedType: errorName.name,
            fernFilepath: errorName.fernFilepath,
            importStrategy,
            referencedIn,
        });
    }
}
