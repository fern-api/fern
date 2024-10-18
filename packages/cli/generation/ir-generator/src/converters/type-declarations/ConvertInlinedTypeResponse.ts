import { Type, TypeDeclaration, TypeId } from "@fern-api/ir-sdk";

export interface WithInlinedTypes<T> {
    inlinedTypes: Record<TypeId, Type>;
    response: T;
}

export interface WithInlinedTypeDeclarations<T> {
    inlinedTypeDeclarations: Record<TypeId, TypeDeclaration>;
    response: T;
}
