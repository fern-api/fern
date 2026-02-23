import { FernIr } from "@fern-fern/ir-sdk";
/**
 * TypeResolver converts a TypeName to a "resolved" value by following all
 * aliases and unwrapping all containers.
 */
export class TypeResolver {
    private allTypes: Record<FernIr.TypeId, FernIr.TypeDeclaration> = {};

    constructor(intermediateRepresentation: FernIr.IntermediateRepresentation) {
        for (const type of Object.values(intermediateRepresentation.types)) {
            this.allTypes[type.name.typeId] = type;
        }
    }

    public getTypeDeclarationFromId(typeId: FernIr.TypeId): FernIr.TypeDeclaration {
        const type = this.allTypes[typeId];
        if (type == null) {
            throw new Error("Type not found: " + typeId);
        }
        return type;
    }

    public getTypeDeclarationFromName(typeName: FernIr.DeclaredTypeName): FernIr.TypeDeclaration {
        const type = this.allTypes[typeName.typeId];
        if (type == null) {
            throw new Error("Type not found: " + typeName.typeId);
        }
        return type;
    }

    public resolveTypeName(typeName: FernIr.DeclaredTypeName): FernIr.ResolvedTypeReference {
        const declaration = this.getTypeDeclarationFromName(typeName);
        return this.resolveTypeDeclaration(typeName, declaration.shape);
    }

    public resolveTypeReference(type: FernIr.TypeReference): FernIr.ResolvedTypeReference {
        return FernIr.TypeReference._visit<FernIr.ResolvedTypeReference>(type, {
            named: (typeName) => this.resolveTypeName(typeName),
            container: FernIr.ResolvedTypeReference.container,
            primitive: FernIr.ResolvedTypeReference.primitive,
            unknown: FernIr.ResolvedTypeReference.unknown,
            _other: () => {
                throw new Error("Unknown type reference type: " + type.type);
            }
        });
    }

    public resolveTypeDeclaration(
        typeName: FernIr.DeclaredTypeName,
        declaration: FernIr.Type
    ): FernIr.ResolvedTypeReference {
        return FernIr.Type._visit<FernIr.ResolvedTypeReference>(declaration, {
            alias: ({ resolvedType }) => resolvedType,
            enum: () =>
                FernIr.ResolvedTypeReference.named({
                    name: typeName,
                    shape: FernIr.ShapeType.Enum
                }),
            object: () =>
                FernIr.ResolvedTypeReference.named({
                    name: typeName,
                    shape: FernIr.ShapeType.Object
                }),
            union: () =>
                FernIr.ResolvedTypeReference.named({
                    name: typeName,
                    shape: FernIr.ShapeType.Union
                }),
            undiscriminatedUnion: () =>
                FernIr.ResolvedTypeReference.named({
                    name: typeName,
                    shape: FernIr.ShapeType.UndiscriminatedUnion
                }),
            _other: () => {
                throw new Error("Unknown type declaration type: " + declaration.type);
            }
        });
    }

    public doesTypeExist(typeName: FernIr.DeclaredTypeName): boolean {
        return this.allTypes[typeName.typeId] != null;
    }
}
