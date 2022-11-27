import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { HttpEndpoint } from "@fern-fern/ir-model/services/http";
import { DeclaredTypeName, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { TypeResolver } from "@fern-typescript/resolvers";
import { EndpointTypesContext, Reference } from "@fern-typescript/sdk-declaration-handler";
import { EndpointDeclarationReferencer } from "../declaration-referencers/EndpointDeclarationReferencer";
import { ErrorDeclarationReferencer } from "../declaration-referencers/ErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { ErrorReferencingContextMixinImpl } from "./mixins/ErrorReferencingContextMixinImpl";
import { TypeReferencingContextMixinImpl } from "./mixins/TypeReferencingContextMixinImpl";

export declare namespace EndpointTypesContextImpl {
    export interface Init extends BaseContextImpl.Init {
        serviceName: DeclaredServiceName;
        endpoint: HttpEndpoint;

        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        errorDeclarationReferencer: ErrorDeclarationReferencer;
        endpointDeclarationReferencer: EndpointDeclarationReferencer;
    }
}

export class EndpointTypesContextImpl extends BaseContextImpl implements EndpointTypesContext {
    private serviceName: DeclaredServiceName;
    private endpoint: HttpEndpoint;
    private typeReferencingContextMixin: TypeReferencingContextMixinImpl;
    private errorReferencingContextMixin: ErrorReferencingContextMixinImpl;
    private endpointDeclarationReferencer: EndpointDeclarationReferencer;

    constructor({
        serviceName,
        endpoint,
        typeResolver,
        typeDeclarationReferencer,
        errorDeclarationReferencer,
        endpointDeclarationReferencer,
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
        });
        this.errorReferencingContextMixin = new ErrorReferencingContextMixinImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            errorDeclarationReferencer,
        });
        this.endpointDeclarationReferencer = endpointDeclarationReferencer;
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
}
