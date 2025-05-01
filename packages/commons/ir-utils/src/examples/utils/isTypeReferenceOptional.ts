import { TypeDeclaration, TypeId, TypeReference } from "@fern-api/ir-sdk";

export declare namespace isOptional {
    interface Args {
        typeReference: TypeReference;
        typeDeclarations?: Record<TypeId, TypeDeclaration>;
    }
}

export function isOptional({ typeReference, typeDeclarations }: isOptional.Args): boolean {
    if (typeReference.type === "container" && typeReference.container.type === "optional") {
        return true;
    }
    if (typeReference.type === "named") {
        const typeDeclaration = typeDeclarations?.[typeReference.typeId];
        if (
            typeDeclaration?.shape.type === "alias" &&
            typeDeclaration?.shape.resolvedType.type === "container" &&
            typeDeclaration?.shape.resolvedType.container.type === "optional"
        ) {
            return true;
        }
    }
    return false;
}
