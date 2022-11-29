import { Constants } from "@fern-fern/ir-model/constants";
import { DeclaredTypeName, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode, Zurg } from "@fern-typescript/commons-v2";
import {
    CoreUtilities,
    ErrorSchemaContext,
    ExternalDependencies,
    GeneratedType,
    Reference,
    TypeSchemaContext,
} from "@fern-typescript/sdk-declaration-handler";
import { SourceFile } from "ts-morph";

export class TypeSchemaContextImpl implements TypeSchemaContext {
    private errorSchemaContext: ErrorSchemaContext;

    constructor({ errorSchemaContext }: { errorSchemaContext: ErrorSchemaContext }) {
        this.errorSchemaContext = errorSchemaContext;
    }

    public get sourceFile(): SourceFile {
        return this.errorSchemaContext.sourceFile;
    }

    public get externalDependencies(): ExternalDependencies {
        return this.errorSchemaContext.externalDependencies;
    }

    public get coreUtilities(): CoreUtilities {
        return this.errorSchemaContext.coreUtilities;
    }

    public get fernConstants(): Constants {
        return this.errorSchemaContext.fernConstants;
    }

    public getReferenceToType(typeReference: TypeReference): TypeReferenceNode {
        return this.errorSchemaContext.getReferenceToType(typeReference);
    }

    public getReferenceToNamedType(typeName: DeclaredTypeName): Reference {
        return this.errorSchemaContext.getReferenceToNamedType(typeName);
    }

    public resolveTypeReference(typeReference: TypeReference): ResolvedTypeReference {
        return this.errorSchemaContext.resolveTypeReference(typeReference);
    }

    public resolveTypeName(typeName: DeclaredTypeName): ResolvedTypeReference {
        return this.errorSchemaContext.resolveTypeName(typeName);
    }

    public getTypeBeingGenerated(): GeneratedType {
        return this.errorSchemaContext.getErrorBeingGenerated().getAsGeneratedType();
    }

    public getReferenceToRawType(typeReference: TypeReference): TypeReferenceNode {
        return this.errorSchemaContext.getReferenceToRawType(typeReference);
    }

    public getReferenceToRawNamedType(typeName: DeclaredTypeName): Reference {
        return this.errorSchemaContext.getReferenceToRawNamedType(typeName);
    }

    public getSchemaOfTypeReference(typeReference: TypeReference): Zurg.Schema {
        return this.errorSchemaContext.getSchemaOfTypeReference(typeReference);
    }

    public getSchemaOfNamedType(typeName: DeclaredTypeName): Zurg.Schema {
        return this.errorSchemaContext.getSchemaOfNamedType(typeName);
    }
}
