import * as FernIr from "@fern-api/ir-sdk";

/**
 * Aliases of named types are created with a placeholder `resolvedType` because the target declaration
 * may not have been converted yet. Once all types are present, replace each placeholder with the
 * terminal named type (following alias chains) so consumers can rely on `resolvedType.shape`.
 */
export function resolveAliasResolvedTypes(types: Record<FernIr.TypeId, FernIr.TypeDeclaration>): void {
    const resolved = new Map<FernIr.TypeId, FernIr.ResolvedTypeReference | undefined>();

    const resolveTypeId = (
        typeId: FernIr.TypeId,
        visiting: Set<FernIr.TypeId>
    ): FernIr.ResolvedTypeReference | undefined => {
        if (resolved.has(typeId)) {
            return resolved.get(typeId);
        }
        const declaration = types[typeId];
        if (declaration == null || visiting.has(typeId)) {
            return undefined;
        }
        visiting.add(typeId);
        const result = resolveDeclaration(declaration, visiting);
        visiting.delete(typeId);
        resolved.set(typeId, result);
        return result;
    };

    const resolveDeclaration = (
        declaration: FernIr.TypeDeclaration,
        visiting: Set<FernIr.TypeId>
    ): FernIr.ResolvedTypeReference | undefined => {
        const named = (shape: FernIr.ShapeType) =>
            FernIr.ResolvedTypeReference.named({ name: declaration.name, shape });
        switch (declaration.shape.type) {
            case "object":
                return named(FernIr.ShapeType.Object);
            case "enum":
                return named(FernIr.ShapeType.Enum);
            case "union":
                return named(FernIr.ShapeType.Union);
            case "undiscriminatedUnion":
                return named(FernIr.ShapeType.UndiscriminatedUnion);
            case "alias": {
                const { resolvedType } = declaration.shape;
                const placeholderTypeId = getPlaceholderTypeId(resolvedType);
                return placeholderTypeId != null ? resolveTypeId(placeholderTypeId, visiting) : resolvedType;
            }
            default:
                return undefined;
        }
    };

    for (const [typeId, declaration] of Object.entries(types)) {
        if (declaration.shape.type !== "alias" || getPlaceholderTypeId(declaration.shape.resolvedType) == null) {
            continue;
        }
        const resolvedType = resolveTypeId(typeId, new Set());
        if (resolvedType == null) {
            continue;
        }
        types[typeId] = {
            ...declaration,
            shape: FernIr.Type.alias({ aliasOf: declaration.shape.aliasOf, resolvedType })
        };
    }
}

function getPlaceholderTypeId(resolvedType: FernIr.ResolvedTypeReference): FernIr.TypeId | undefined {
    if (resolvedType.type !== "named") {
        return undefined;
    }
    const maybeTypeReference = resolvedType as unknown as Partial<FernIr.NamedType>;
    return resolvedType.shape == null && typeof maybeTypeReference.typeId === "string"
        ? maybeTypeReference.typeId
        : undefined;
}
