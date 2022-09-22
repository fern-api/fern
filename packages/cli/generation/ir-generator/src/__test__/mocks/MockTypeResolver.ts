import { TypeResolver } from "../../type-resolver/TypeResolver";

export const MockTypeResolver: TypeResolver = {
    getDeclarationOfNamedType: () => {
        throw new Error("Not implemented");
    },
    resolveType: () => {
        throw new Error("Not implemented");
    },
    resolveNamedType: () => {
        throw new Error("Not implemented");
    },
};
