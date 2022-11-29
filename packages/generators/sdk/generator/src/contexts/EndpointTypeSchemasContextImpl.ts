import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services/http";
import { DeclaredTypeName, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode, Zurg } from "@fern-typescript/commons-v2";
import { EndpointTypesGenerator } from "@fern-typescript/endpoint-types-generator";
import { TypeResolver } from "@fern-typescript/resolvers";
import {
    EndpointTypeSchemasContext,
    GeneratedEndpointTypes,
    Reference,
} from "@fern-typescript/sdk-declaration-handler";
import { EndpointDeclarationReferencer } from "../declaration-referencers/EndpointDeclarationReferencer";
import { ErrorDeclarationReferencer } from "../declaration-referencers/ErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { ErrorReferencingContextMixinImpl } from "./mixins/ErrorReferencingContextMixinImpl";
import { ErrorSchemaReferencingContextMixinImpl } from "./mixins/ErrorSchemaReferencingContextMixinImpl";
import { TypeReferencingContextMixinImpl } from "./mixins/TypeReferencingContextMixinImpl";
import { TypeSchemaReferencingContextMixinImpl } from "./mixins/TypeSchemaReferencingContextMixinImpl";

export declare namespace EndpointTypeSchemasContextImpl {
    export interface Init extends BaseContextImpl.Init {
        service: HttpService;
        endpoint: HttpEndpoint;

        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
        errorDeclarationReferencer: ErrorDeclarationReferencer;
        errorSchemaDeclarationReferencer: ErrorDeclarationReferencer;
        endpointDeclarationReferencer: EndpointDeclarationReferencer;
        endpointTypesGenerator: EndpointTypesGenerator;
    }
}

export class EndpointTypeSchemasContextImpl extends BaseContextImpl implements EndpointTypeSchemasContext {
    private service: HttpService;
    private endpoint: HttpEndpoint;
    private typeReferencingContextMixin: TypeReferencingContextMixinImpl;
    private typeSchemaReferencingContextMixin: TypeSchemaReferencingContextMixinImpl;
    private errorReferencingContextMixin: ErrorReferencingContextMixinImpl;
    private errorSchemaReferencingContextMixin: ErrorSchemaReferencingContextMixinImpl;
    private endpointDeclarationReferencer: EndpointDeclarationReferencer;
    private endpointTypesGenerator: EndpointTypesGenerator;

    constructor({
        service,
        endpoint,
        typeResolver,
        typeDeclarationReferencer,
        typeSchemaDeclarationReferencer,
        errorDeclarationReferencer,
        errorSchemaDeclarationReferencer,
        endpointDeclarationReferencer,
        endpointTypesGenerator,
        ...superInit
    }: EndpointTypeSchemasContextImpl.Init) {
        super(superInit);
        this.service = service;
        this.endpoint = endpoint;
        this.typeReferencingContextMixin = new TypeReferencingContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            typeResolver,
            typeDeclarationReferencer,
        });
        this.typeSchemaReferencingContextMixin = new TypeSchemaReferencingContextMixinImpl({
            sourceFile: this.sourceFile,
            coreUtilities: this.coreUtilities,
            importsManager: this.importsManager,
            typeResolver,
            typeSchemaDeclarationReferencer,
        });
        this.errorReferencingContextMixin = new ErrorReferencingContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            errorDeclarationReferencer,
        });
        this.errorSchemaReferencingContextMixin = new ErrorSchemaReferencingContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            coreUtilities: this.coreUtilities,
            errorSchemaDeclarationReferencer,
        });
        this.endpointDeclarationReferencer = endpointDeclarationReferencer;
        this.endpointTypesGenerator = endpointTypesGenerator;
    }

    public getReferenceToType(typeReference: TypeReference): TypeReferenceNode {
        return this.typeReferencingContextMixin.getReferenceToType(typeReference);
    }

    public getReferenceToNamedType(typeName: DeclaredTypeName): Reference {
        return this.typeReferencingContextMixin.getReferenceToNamedType(typeName);
    }

    public resolveTypeReference(typeReference: TypeReference): ResolvedTypeReference {
        return this.typeReferencingContextMixin.resolveTypeReference(typeReference);
    }

    public resolveTypeName(typeName: DeclaredTypeName): ResolvedTypeReference {
        return this.typeReferencingContextMixin.resolveTypeName(typeName);
    }

    public getReferenceToRawType(typeReference: TypeReference): TypeReferenceNode {
        return this.typeSchemaReferencingContextMixin.getReferenceToRawType(typeReference);
    }

    public getReferenceToRawNamedType(typeName: DeclaredTypeName): Reference {
        return this.typeSchemaReferencingContextMixin.getReferenceToRawNamedType(typeName);
    }

    public getSchemaOfTypeReference(typeReference: TypeReference): Zurg.Schema {
        return this.typeSchemaReferencingContextMixin.getSchemaOfTypeReference(typeReference);
    }

    public getSchemaOfNamedType(typeName: DeclaredTypeName): Zurg.Schema {
        return this.typeSchemaReferencingContextMixin.getSchemaOfNamedType(typeName);
    }

    public getReferenceToError(errorName: DeclaredErrorName): Reference {
        return this.errorReferencingContextMixin.getReferenceToError(errorName);
    }

    public getEndpointTypesBeingGenerated(): GeneratedEndpointTypes {
        return this.endpointTypesGenerator.generateEndpointTypes({
            service: this.service,
            endpoint: this.endpoint,
        });
    }

    public getReferenceToEndpointTypeExport(export_: string | string[]): Reference {
        return this.endpointDeclarationReferencer.getReferenceToEndpointExport({
            name: { serviceName: this.service.name, endpoint: this.endpoint },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: { type: "fromRoot" },
            subImport: typeof export_ === "string" ? [export_] : export_,
        });
    }

    public getReferenceToRawError(errorName: DeclaredErrorName): Reference {
        return this.errorSchemaReferencingContextMixin.getReferenceToRawError(errorName);
    }

    public getSchemaOfError(errorName: DeclaredErrorName): Zurg.Schema {
        return this.errorSchemaReferencingContextMixin.getSchemaOfError(errorName);
    }
}
