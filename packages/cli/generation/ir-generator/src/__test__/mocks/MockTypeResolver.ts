import { TypeResolver } from "../../type-resolver/TypeResolver";

export const MockTypeResolver: TypeResolver = {
    resolveType: () => {
        throw new Error("Not implemented");
    },
};
