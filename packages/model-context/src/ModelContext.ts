import { DeclaredErrorName, ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { DeclaredTypeName, Type, TypeReference } from "@fern-fern/ir-model/types";
import { ImportStrategy } from "@fern-typescript/commons";
import { Directory, SourceFile, ts } from "ts-morph";
import { ErrorContext } from "./error-context/ErrorContext";
import {
    GeneratedHttpEndpointTypes,
    HttpServiceTypeContext,
    HttpServiceTypeMetadata,
    HttpServiceTypeReference,
    InlinedHttpServiceTypeReference,
} from "./service-type-context/HttpServiceTypeContext";
import {
    GeneratedWebSocketOperationTypes,
    WebSocketChannelTypeContext,
    WebSocketChannelTypeMetadata,
    WebSocketChannelTypeReference,
} from "./service-type-context/WebSocketChannelTypeContext";
import { ResolvedType } from "./type-context/ResolvedType";
import { TypeContext } from "./type-context/TypeContext";

export class ModelContext {
    private typeContext: TypeContext;
    private errorContext: ErrorContext;
    private httpServiceTypeContext: HttpServiceTypeContext;
    private webSocketChannelTypeContext: WebSocketChannelTypeContext;

    constructor({
        modelDirectory,
        intermediateRepresentation,
    }: {
        modelDirectory: Directory;
        intermediateRepresentation: IntermediateRepresentation;
    }) {
        this.typeContext = new TypeContext({ modelDirectory, intermediateRepresentation });
        this.errorContext = new ErrorContext({ modelDirectory, intermediateRepresentation });
        this.httpServiceTypeContext = new HttpServiceTypeContext(modelDirectory);
        this.webSocketChannelTypeContext = new WebSocketChannelTypeContext(modelDirectory);
    }

    /**
     * TYPES
     */

    public addTypeDeclaration(typeName: DeclaredTypeName, withFile: (file: SourceFile) => void): void {
        this.typeContext.addTypeDeclaration(typeName, withFile);
    }

    public getReferenceToType(args: TypeContext.getReferenceToType.Args): ts.TypeNode {
        return this.typeContext.getReferenceToType(args);
    }

    public getReferenceToTypeUtils(args: TypeContext.getReferenceToTypeUtils.Args): ts.Expression {
        return this.typeContext.getReferenceToTypeUtils(args);
    }

    public resolveTypeName(typeName: DeclaredTypeName): ResolvedType {
        return this.typeContext.resolveTypeName(typeName);
    }

    public resolveTypeReference(typeReference: TypeReference): ResolvedType {
        return this.typeContext.resolveTypeReference(typeReference);
    }

    public resolveTypeDeclaration(type: Type): ResolvedType {
        return this.typeContext.resolveTypeDeclaration(type);
    }

    public getTypeDeclarationFromName(typeName: DeclaredTypeName): Type {
        return this.typeContext.getTypeDeclarationFromName(typeName);
    }

    public doesTypeExist(typeName: DeclaredTypeName): boolean {
        return this.typeContext.doesTypeExist(typeName);
    }

    /**
     * ERRORS
     */

    public addErrorDeclaration(errorName: DeclaredErrorName, withFile: (file: SourceFile) => void): void {
        this.errorContext.addErrorDeclaration(errorName, withFile);
    }

    public getReferenceToError(args: ErrorContext.getReferenceToError.Args): ts.TypeNode {
        return this.errorContext.getReferenceToError(args);
    }

    public getReferenceToErrorUtils(args: ErrorContext.getReferenceToErrorUtils.Args): ts.Expression {
        return this.errorContext.getReferenceToErrorUtils(args);
    }

    public getErrorDeclarationFromName(errorName: DeclaredErrorName): ErrorDeclaration {
        return this.errorContext.getErrorDeclarationFromName(errorName);
    }

    /**
     * HTTP SERVICE TYPES
     */

    public addHttpServiceTypeDeclaration(
        metadata: HttpServiceTypeMetadata,
        withFile: (file: SourceFile) => void
    ): void {
        this.httpServiceTypeContext.addHttpServiceTypeDeclaration(metadata, withFile);
    }

    public getReferenceToHttpServiceType({
        reference,
        referencedIn,
        importStrategy,
    }: {
        reference: HttpServiceTypeReference;
        referencedIn: SourceFile;
        importStrategy?: ImportStrategy;
    }): ts.TypeNode {
        if (reference.isInlined) {
            return this.httpServiceTypeContext.getReferenceToHttpServiceType({
                metadata: reference.metadata,
                referencedIn,
                importStrategy,
            });
        } else {
            return this.getReferenceToType({
                reference: reference.typeReference,
                referencedIn,
                importStrategy,
            });
        }
    }

    public getReferenceToHttpServiceTypeUtils({
        reference,
        referencedIn,
        importStrategy,
    }: {
        reference: InlinedHttpServiceTypeReference;
        referencedIn: SourceFile;
        importStrategy?: ImportStrategy;
    }): ts.Expression {
        return this.httpServiceTypeContext.getReferenceToHttpServiceTypeUtils({
            metadata: reference.metadata,
            referencedIn,
            importStrategy,
        });
    }

    public registerGeneratedHttpServiceTypes(args: HttpServiceTypeContext.registerGeneratedTypes.Args): void {
        this.httpServiceTypeContext.registerGeneratedTypes(args);
    }

    public getGeneratedHttpServiceTypes(
        args: HttpServiceTypeContext.getGeneratedTypes.Args
    ): GeneratedHttpEndpointTypes {
        return this.httpServiceTypeContext.getGeneratedTypes(args);
    }

    /**
     * WEBSOCKET CHANNEL TYPES
     */

    public addWebSocketChannelTypeDeclaration(
        metadata: WebSocketChannelTypeMetadata,
        withFile: (file: SourceFile) => void
    ): void {
        this.webSocketChannelTypeContext.addWebSocketChannelTypeDeclaration(metadata, withFile);
    }

    public getReferenceToWebSocketChannelType({
        reference,
        referencedIn,
        importStrategy,
    }: {
        reference: WebSocketChannelTypeReference;
        referencedIn: SourceFile;
        importStrategy?: ImportStrategy;
    }): ts.TypeNode {
        if (reference.isInlined) {
            return this.webSocketChannelTypeContext.getReferenceToWebSocketChannelType({
                metadata: reference.metadata,
                referencedIn,
                importStrategy,
            });
        } else {
            return this.getReferenceToType({
                reference: reference.typeReference,
                referencedIn,
                importStrategy,
            });
        }
    }

    public registerGeneratedWebSocketChannelTypes(args: WebSocketChannelTypeContext.registerGeneratedTypes.Args): void {
        this.webSocketChannelTypeContext.registerGeneratedTypes(args);
    }

    public getGeneratedWebSocketChannelTypes(
        args: WebSocketChannelTypeContext.getGeneratedTypes.Args
    ): GeneratedWebSocketOperationTypes {
        return this.webSocketChannelTypeContext.getGeneratedTypes(args);
    }
}
