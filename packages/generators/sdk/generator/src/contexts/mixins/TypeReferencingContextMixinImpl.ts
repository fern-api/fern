import { DeclaredTypeName, ResolvedTypeReference, TypeReference } from "@fern-fern/ir-model/types";
import { TypeReferenceNode } from "@fern-typescript/commons-v2";
import { TypeResolver } from "@fern-typescript/resolvers";
import { GeneratedType, Reference, TypeReferencingContextMixin } from "@fern-typescript/sdk-declaration-handler";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceToParsedTypeNodeConverter } from "@fern-typescript/type-reference-converters";
import { SourceFile } from "ts-morph";
import { TypeDeclarationReferencer } from "../../declaration-referencers/TypeDeclarationReferencer";
import { ImportsManager } from "../../imports-manager/ImportsManager";

export declare namespace TypeReferencingContextMixinImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeGenerator: TypeGenerator;
    }
}

export class TypeReferencingContextMixinImpl implements TypeReferencingContextMixin {
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;
    private typeDeclarationReferencer: TypeDeclarationReferencer;
    private typeReferenceToParsedTypeNodeConverter: TypeReferenceToParsedTypeNodeConverter;
    private typeResolver: TypeResolver;
    private typeGenerator: TypeGenerator;

    constructor({
        sourceFile,
        importsManager,
        typeResolver,
        typeDeclarationReferencer,
        typeGenerator,
    }: TypeReferencingContextMixinImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.typeResolver = typeResolver;
        this.typeDeclarationReferencer = typeDeclarationReferencer;
        this.typeGenerator = typeGenerator;

        this.typeReferenceToParsedTypeNodeConverter = new TypeReferenceToParsedTypeNodeConverter({
            getReferenceToNamedType: (typeName) => this.getReferenceToNamedType(typeName).getEntityName(),
            typeResolver,
        });
    }

    public getReferenceToType(typeReference: TypeReference): TypeReferenceNode {
        return this.typeReferenceToParsedTypeNodeConverter.convert(typeReference);
    }

    public getReferenceToNamedType(typeName: DeclaredTypeName): Reference {
        return this.typeDeclarationReferencer.getReferenceToType({
            name: typeName,
            importStrategy: { type: "fromRoot" },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
        });
    }

    public resolveTypeReference(typeReference: TypeReference): ResolvedTypeReference {
        return this.typeResolver.resolveTypeReference(typeReference);
    }

    public resolveTypeName(typeName: DeclaredTypeName): ResolvedTypeReference {
        return this.typeResolver.resolveTypeName(typeName);
    }

    public getGeneratedType(typeName: DeclaredTypeName): GeneratedType {
        const typeDeclaration = this.typeResolver.getTypeDeclarationFromName(typeName);
        return this.typeGenerator.generateType({
            shape: typeDeclaration.shape,
            docs: typeDeclaration.docs ?? undefined,
            typeName: this.typeDeclarationReferencer.getExportedName(typeDeclaration.name),
            fernFilepath: typeDeclaration.name.fernFilepathV2,
            getReferenceToSelf: (context) => context.getReferenceToNamedType(typeName),
        });
    }
}
