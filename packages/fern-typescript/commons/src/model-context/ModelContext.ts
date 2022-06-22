import { ErrorDefinition, ErrorName, IntermediateRepresentation, Type, TypeName, TypeReference } from "@fern-api/api";
import { Directory, SourceFile, ts } from "ts-morph";
import { ErrorContext } from "./error-context/ErrorContext";
import { ServiceTypeContext, ServiceTypeMetadata } from "./ServiceTypeContext";
import { TypeContext } from "./type-context/TypeContext";
import { ResolvedType } from "./type-context/types";

export class ModelContext {
    private typeContext: TypeContext;
    private errorContext: ErrorContext;
    private serviceTypeContext: ServiceTypeContext;

    constructor({
        modelDirectory,
        intermediateRepresentation,
    }: {
        modelDirectory: Directory;
        intermediateRepresentation: IntermediateRepresentation;
    }) {
        this.typeContext = new TypeContext({ modelDirectory, intermediateRepresentation });
        this.errorContext = new ErrorContext({ modelDirectory, intermediateRepresentation });
        this.serviceTypeContext = new ServiceTypeContext(modelDirectory);
    }

    /**
     * TYPES
     */

    public addTypeDefinition(typeName: TypeName, withFile: (file: SourceFile) => void): void {
        this.typeContext.addTypeDefinition(typeName, withFile);
    }

    public getReferenceToType(args: TypeContext.getReferenceToType.Args): ts.TypeNode {
        return this.typeContext.getReferenceToType(args);
    }

    public resolveTypeName(typeName: TypeName): ResolvedType {
        return this.typeContext.resolveTypeName(typeName);
    }

    public resolveTypeReference(typeReference: TypeReference): ResolvedType {
        return this.typeContext.resolveTypeReference(typeReference);
    }

    public resolveTypeDefinition(type: Type): ResolvedType {
        return this.typeContext.resolveTypeDefinition(type);
    }

    /**
     * ERRORS
     */

    public addErrorDefinition(errorName: ErrorName, withFile: (file: SourceFile) => void): void {
        this.errorContext.addErrorDefinition(errorName, withFile);
    }

    public getReferenceToError(args: ErrorContext.getReferenceToError.Args): ts.TypeNode {
        return this.errorContext.getReferenceToError(args);
    }

    public resolveErrorName(errorName: ErrorName): ErrorDefinition {
        return this.errorContext.resolveErrorName(errorName);
    }

    /**
     * SERVICE TYPES
     */

    public addServiceTypeDefinition(metadata: ServiceTypeMetadata, withFile: (file: SourceFile) => void): void {
        this.serviceTypeContext.addServiceTypeDefinition(metadata, withFile);
    }

    public getReferenceToServiceType(args: ServiceTypeContext.getReferenceToServiceType.Args): ts.TypeReferenceNode {
        return this.serviceTypeContext.getReferenceToServiceType(args);
    }
}
