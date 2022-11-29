import { Constants } from "@fern-fern/ir-model/constants";
import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { DeclaredTypeName, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import {
    CoreUtilities,
    EndpointTypeSchemasContext,
    EndpointTypesContext,
    ExternalDependencies,
    Reference,
} from "@fern-typescript/sdk-declaration-handler";
import { SourceFile } from "ts-morph";

export declare namespace EndpointTypesContextImpl {
    export interface Init {
        endpointTypeSchemaContext: EndpointTypeSchemasContext;
    }
}

export class EndpointTypesContextImpl implements EndpointTypesContext {
    private endpointTypeSchemaContext: EndpointTypeSchemasContext;

    constructor({ endpointTypeSchemaContext }: EndpointTypesContextImpl.Init) {
        this.endpointTypeSchemaContext = endpointTypeSchemaContext;
    }

    public get sourceFile(): SourceFile {
        return this.endpointTypeSchemaContext.sourceFile;
    }

    public get externalDependencies(): ExternalDependencies {
        return this.endpointTypeSchemaContext.externalDependencies;
    }

    public get coreUtilities(): CoreUtilities {
        return this.endpointTypeSchemaContext.coreUtilities;
    }

    public get fernConstants(): Constants {
        return this.endpointTypeSchemaContext.fernConstants;
    }

    public getReferenceToExportFromThisFile(export_: string | string[]): Reference {
        return this.endpointTypeSchemaContext.getReferenceToEndpointTypeExport(export_);
    }

    public getReferenceToType(typeReference: TypeReference): TypeReferenceNode {
        return this.endpointTypeSchemaContext.getReferenceToType(typeReference);
    }

    public getReferenceToNamedType(typeName: DeclaredTypeName): Reference {
        return this.endpointTypeSchemaContext.getReferenceToNamedType(typeName);
    }

    public resolveTypeReference(typeReference: TypeReference): ResolvedTypeReference {
        return this.endpointTypeSchemaContext.resolveTypeReference(typeReference);
    }

    public resolveTypeName(typeName: DeclaredTypeName): ResolvedTypeReference {
        return this.endpointTypeSchemaContext.resolveTypeName(typeName);
    }

    public getReferenceToError(errorName: DeclaredErrorName): Reference {
        return this.endpointTypeSchemaContext.getReferenceToError(errorName);
    }
}
