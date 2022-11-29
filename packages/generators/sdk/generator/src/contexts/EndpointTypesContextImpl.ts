import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpoint } from "@fern-fern/ir-model/services/http";
import { DeclaredTypeName, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { EndpointTypesGenerator } from "@fern-typescript/endpoint-types-generator";
import { ErrorGenerator } from "@fern-typescript/error-generator";
import { ErrorResolver, ServiceResolver, TypeResolver } from "@fern-typescript/resolvers";
import {
    EndpointTypesContext,
    GeneratedEndpointTypes,
    GeneratedError,
    GeneratedType,
    Reference,
} from "@fern-typescript/sdk-declaration-handler";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { EndpointDeclarationReferencer } from "../declaration-referencers/EndpointDeclarationReferencer";
import { ErrorDeclarationReferencer } from "../declaration-referencers/ErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { EndpointTypesReferencingContextMixinImpl } from "./mixins/EndpointTypesReferencingContextMixinImpl";
import { ErrorReferencingContextMixinImpl } from "./mixins/ErrorReferencingContextMixinImpl";
import { TypeReferencingContextMixinImpl } from "./mixins/TypeReferencingContextMixinImpl";

export declare namespace EndpointTypesContextImpl {
    export interface Init extends BaseContextImpl.Init {
        serviceName: DeclaredServiceName;
        endpoint: HttpEndpoint;

        typeResolver: TypeResolver;
        typeGenerator: TypeGenerator;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        errorResolver: ErrorResolver;
        errorGenerator: ErrorGenerator;
        errorDeclarationReferencer: ErrorDeclarationReferencer;
        endpointDeclarationReferencer: EndpointDeclarationReferencer;
        endpointTypesGenerator: EndpointTypesGenerator;
        serviceResolver: ServiceResolver;
    }
}

export class EndpointTypesContextImpl extends BaseContextImpl implements EndpointTypesContext {
    private serviceName: DeclaredServiceName;
    private endpoint: HttpEndpoint;
    private endpointDeclarationReferencer: EndpointDeclarationReferencer;

    private typeReferencingContextMixin: TypeReferencingContextMixinImpl;
    private errorReferencingContextMixin: ErrorReferencingContextMixinImpl;
    private endpointTypeReferencingContextMixin: EndpointTypesReferencingContextMixinImpl;

    constructor({
        serviceName,
        endpoint,
        typeResolver,
        typeGenerator,
        typeDeclarationReferencer,
        errorGenerator,
        errorResolver,
        errorDeclarationReferencer,
        endpointDeclarationReferencer,
        endpointTypesGenerator,
        serviceResolver,
        ...superInit
    }: EndpointTypesContextImpl.Init) {
        super(superInit);
        this.serviceName = serviceName;
        this.endpoint = endpoint;
        this.typeReferencingContextMixin = new TypeReferencingContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            typeResolver,
            typeDeclarationReferencer,
            typeGenerator,
        });
        this.errorReferencingContextMixin = new ErrorReferencingContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            errorDeclarationReferencer,
            errorGenerator,
            errorResolver,
        });
        this.endpointDeclarationReferencer = endpointDeclarationReferencer;
        this.endpointTypeReferencingContextMixin = new EndpointTypesReferencingContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            endpointDeclarationReferencer,
            endpointTypesGenerator,
            serviceResolver,
        });
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

    public getGeneratedType(typeName: DeclaredTypeName): GeneratedType {
        return this.typeReferencingContextMixin.getGeneratedType(typeName);
    }

    public getReferenceToExportFromThisFile(export_: string | string[]): Reference {
        return this.endpointDeclarationReferencer.getReferenceToEndpointExport({
            name: { serviceName: this.serviceName, endpoint: this.endpoint },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: { type: "fromRoot" },
            subImport: typeof export_ === "string" ? [export_] : export_,
        });
    }

    public getReferenceToError(errorName: DeclaredErrorName): Reference {
        return this.errorReferencingContextMixin.getReferenceToError(errorName);
    }

    public getGeneratedError(errorName: DeclaredErrorName): GeneratedError | undefined {
        return this.errorReferencingContextMixin.getGeneratedError(errorName);
    }

    public getGeneratedEndpointTypes(serviceName: DeclaredServiceName, endpointId: string): GeneratedEndpointTypes {
        return this.endpointTypeReferencingContextMixin.getGeneratedEndpointTypes(serviceName, endpointId);
    }

    public getReferenceToEndpointTypeExport(
        serviceName: DeclaredServiceName,
        endpointId: string,
        export_: string | string[]
    ): Reference {
        return this.endpointTypeReferencingContextMixin.getReferenceToEndpointTypeExport(
            serviceName,
            endpointId,
            export_
        );
    }
}
