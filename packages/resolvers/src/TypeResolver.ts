import { TypeId } from "@fern-fern/ir-model/commons";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import {
    DeclaredTypeName,
    ResolvedTypeReference,
    ShapeType,
    Type,
    TypeDeclaration,
    TypeReference,
} from "@fern-fern/ir-model/types";

/**
 * TypeResolver converts a TypeName to a "resolved" value by following all
 * aliases and unwrapping all containers.
 */
export class TypeResolver {
    private allTypes: Record<TypeId, TypeDeclaration> = {};

    constructor(intermediateRepresentation: IntermediateRepresentation) {
        for (const type of Object.values(intermediateRepresentation.types)) {
            this.allTypes[type.name.typeId] = type;
        }
    }

    public getTypeDeclarationFromName(typeName: DeclaredTypeName): TypeDeclaration {
        const type = this.allTypes[typeName.typeId];
        if (type == null) {
            throw new Error("Type not found: " + typeName.typeId);
        }
        return type;
    }

    public resolveTypeName(typeName: DeclaredTypeName): ResolvedTypeReference {
        const declaration = this.getTypeDeclarationFromName(typeName);
        return this.resolveTypeDeclaration(typeName, declaration.shape);
    }

    public resolveTypeReference(type: TypeReference): ResolvedTypeReference {
        return TypeReference._visit<ResolvedTypeReference>(type, {
            named: (typeName) => this.resolveTypeName(typeName),
            container: ResolvedTypeReference.container,
            primitive: ResolvedTypeReference.primitive,
            unknown: ResolvedTypeReference.unknown,
            _unknown: () => {
                throw new Error("Unknown type reference type: " + type._type);
            },
        });
    }

    public resolveTypeDeclaration(typeName: DeclaredTypeName, declaration: Type): ResolvedTypeReference {
        return Type._visit<ResolvedTypeReference>(declaration, {
            alias: ({ resolvedType }) => resolvedType,
            enum: () =>
                ResolvedTypeReference.named({
                    name: typeName,
                    shape: ShapeType.Enum,
                }),
            object: () =>
                ResolvedTypeReference.named({
                    name: typeName,
                    shape: ShapeType.Object,
                }),
            union: () =>
                ResolvedTypeReference.named({
                    name: typeName,
                    shape: ShapeType.Union,
                }),
            undiscriminatedUnion: () =>
                ResolvedTypeReference.named({
                    name: typeName,
                    shape: ShapeType.UndiscriminatedUnion,
                }),
            _unknown: () => {
                throw new Error("Unknown type declaration type: " + declaration._type);
            },
        });
    }

    public doesTypeExist(typeName: DeclaredTypeName): boolean {
        return this.allTypes[typeName.typeId] != null;
    }
}
