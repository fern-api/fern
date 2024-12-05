import { assertNever } from "@fern-api/core-utils";
import {
    ContainerType,
    DeclaredTypeName,
    IntermediateRepresentation,
    ObjectProperty,
    ResolvedTypeReference,
    ShapeType,
    Type,
    TypeDeclaration,
    TypeId,
    TypeReference
} from "@fern-fern/ir-sdk/api";

type InlineType = {
    typeId: TypeId;
    declaration: TypeDeclaration;
    parentNames: string[];
};

/**
 * TypeResolver converts a TypeName to a "resolved" value by following all
 * aliases and unwrapping all containers.
 */
export class TypeResolver {
    private allTypes: Record<TypeId, TypeDeclaration> = {};

    constructor(intermediateRepresentation: IntermediateRepresentation) {
        this.setAllTypes(intermediateRepresentation);
    }

    private setAllTypes(intermediateRepresentation: IntermediateRepresentation) {
        for (const type of Object.values(intermediateRepresentation.types)) {
            this.allTypes[type.name.typeId] = type;
        }
    }

    public getTypeDeclarationFromId(typeId: TypeId): TypeDeclaration {
        const type = this.allTypes[typeId];
        if (type == null) {
            throw new Error("Type not found: " + typeId);
        }
        return type;
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
            _other: () => {
                throw new Error("Unknown type reference type: " + type.type);
            }
        });
    }

    public resolveTypeDeclaration(typeName: DeclaredTypeName, declaration: Type): ResolvedTypeReference {
        return Type._visit<ResolvedTypeReference>(declaration, {
            alias: ({ resolvedType }) => resolvedType,
            enum: () =>
                ResolvedTypeReference.named({
                    name: typeName,
                    shape: ShapeType.Enum
                }),
            object: () =>
                ResolvedTypeReference.named({
                    name: typeName,
                    shape: ShapeType.Object
                }),
            union: () =>
                ResolvedTypeReference.named({
                    name: typeName,
                    shape: ShapeType.Union
                }),
            undiscriminatedUnion: () =>
                ResolvedTypeReference.named({
                    name: typeName,
                    shape: ShapeType.UndiscriminatedUnion
                }),
            _other: () => {
                throw new Error("Unknown type declaration type: " + declaration.type);
            }
        });
    }

    public doesTypeExist(typeName: DeclaredTypeName): boolean {
        return this.allTypes[typeName.typeId] != null;
    }
}

function handleObjectTypeReference(typeIdToFind: TypeId, type: TypeReference, parentNames: string[]): boolean {
    switch (type.type) {
        case "container":
            return handleContainer(typeIdToFind, type.container, parentNames);
        case "named":
            if (type.typeId === typeIdToFind) {
                parentNames.push(type.name.pascalCase.safeName);
                return true;
            }
            return false;
        case "primitive":
            return false;
        case "unknown":
            return false;
        default:
            assertNever(type);
    }
}

function handleContainer(typeIdToFind: TypeId, type: ContainerType, parentNames: string[]): boolean {
    switch (type.type) {
        case "list":
            return false;
        case "literal":
            return false;
        case "map":
            return false;
        case "optional":
            // run the parent switch on optional
            return handleObjectTypeReference(typeIdToFind, type.optional, parentNames);
        case "set":
            return false;
        default:
            assertNever(type);
    }
}
