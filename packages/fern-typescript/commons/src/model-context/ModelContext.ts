import { ErrorName, TypeName } from "@fern-api/api";
import { Directory, SourceFile, ts } from "ts-morph";
import { ErrorContext } from "./ErrorContext";
import { ServiceTypeContext, ServiceTypeMetadata } from "./ServiceTypeContext";
import { TypeContext } from "./TypeContext";

export class ModelContext {
    private typeContext: TypeContext;
    private errorContext: ErrorContext;
    private serviceTypeContext: ServiceTypeContext;

    // TODO make private
    constructor(public readonly modelDirectory: Directory) {
        this.typeContext = new TypeContext(modelDirectory);
        this.errorContext = new ErrorContext(modelDirectory);
        this.serviceTypeContext = new ServiceTypeContext(modelDirectory);
    }

    public addTypeDefinition(typeName: TypeName, withFile: (file: SourceFile) => void): void {
        this.typeContext.addTypeDefinition(typeName, withFile);
    }

    public getReferenceToType(args: TypeContext.getReferenceToType.Args): ts.TypeNode {
        return this.typeContext.getReferenceToType(args);
    }

    public addErrorDefinition(errorName: ErrorName, withFile: (file: SourceFile) => void): void {
        this.errorContext.addErrorDefinition(errorName, withFile);
    }

    public getReferenceToError(args: ErrorContext.getReferenceToError.Args): ts.TypeNode {
        return this.errorContext.getReferenceToError(args);
    }

    public addServiceTypeDefinition(metadata: ServiceTypeMetadata, withFile: (file: SourceFile) => void): SourceFile {
        return this.serviceTypeContext.addServiceTypeDefinition(metadata, withFile);
    }

    public getReferenceToServiceType(args: ServiceTypeContext.getReferenceToServiceType.Args): ts.TypeReferenceNode {
        return this.serviceTypeContext.getReferenceToServiceType(args);
    }
}
