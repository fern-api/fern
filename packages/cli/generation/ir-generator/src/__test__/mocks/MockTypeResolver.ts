import { TypeResolver } from "../../resolvers/TypeResolver";

export const MockTypeResolver: TypeResolver = {
    getDeclarationOfNamedType: () => {
        throw new Error("Not implemented");
    },
    resolveType: () => {
        throw new Error("Not implemented");
    },
    resolveTypeOrThrow: () => {
        throw new Error("Not implemented");
    },
    resolveNamedType: () => {
        throw new Error("Not implemented");
    },
};
