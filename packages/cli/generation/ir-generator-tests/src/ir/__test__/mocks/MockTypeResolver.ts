import { TypeResolver } from "@fern-api/ir-generator"

export const MockTypeResolver: TypeResolver = {
    getDeclarationOfNamedType: () => {
        throw new Error("Not implemented")
    },
    getDeclarationOfNamedTypeOrThrow: () => {
        throw new Error("Not implemented")
    },
    resolveType: () => {
        throw new Error("Not implemented")
    },
    resolveTypeOrThrow: () => {
        throw new Error("Not implemented")
    },
    resolveNamedType: () => {
        throw new Error("Not implemented")
    },
    resolveNamedTypeOrThrow: () => {
        throw new Error("Not implemented")
    }
}
