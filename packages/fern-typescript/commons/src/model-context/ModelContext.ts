import { ErrorName, TypeName, TypeReference } from "@fern-api/api";
import { Directory, SourceFile, ts } from "ts-morph";
import { ErrorContext } from "./ErrorContext";
import { TypeContext } from "./TypeContext";

export enum ImportStrategy {
    MODEL_NAMESPACE_IMPORT,
    NAMED_IMPORT,
}

export class ModelContext {
    private typeContext: TypeContext;
    private errorContext: ErrorContext;

    // TODO make private
    constructor(public readonly modelDirectory: Directory) {
        this.typeContext = new TypeContext(modelDirectory);
        this.errorContext = new ErrorContext(modelDirectory);
    }

    public addTypeDefinition(typeName: TypeName, withFile: (file: SourceFile) => void): void {
        this.typeContext.addTypeDefinition(typeName, withFile);
    }

    public addErrorDefinition(errorName: ErrorName, withFile: (file: SourceFile) => void): void {
        this.errorContext.addErrorDefinition(errorName, withFile);
    }

    public getReferenceToType(args: {
        reference: TypeReference;
        referencedIn: SourceFile;
        importStrategy: ImportStrategy;
    }): ts.TypeNode {
        return this.typeContext.getReferenceToType(args);
    }

    public getReferenceToError(args: {
        errorName: ErrorName;
        importStrategy: ImportStrategy;
        referencedIn: SourceFile;
    }): ts.TypeNode {
        return this.errorContext.getReferenceToError(args);
    }
}
