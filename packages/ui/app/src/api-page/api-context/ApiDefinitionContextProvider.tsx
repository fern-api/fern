import { FernRegistry } from "@fern-fern/registry";
import React, { useCallback } from "react";
import { useCurrentApiDefinition } from "../queries/useCurrentApiDefinition";
import { ApiDefinitionContext, ApiDefinitionContextValue } from "./ApiDefinitionContext";

export const ApiDefinitionContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const api = useCurrentApiDefinition();

    const resolveType = useCallback(
        (typeId: FernRegistry.TypeId): FernRegistry.Type => {
            if (api.type !== "loaded") {
                throw new Error("API is not loaded");
            }
            const type = api.value.types[typeId];
            if (type == null) {
                throw new Error("Type does not exist");
            }
            return type;
        },
        [api]
    );

    const resolveSubpackage = useCallback(
        (subpackageId: FernRegistry.SubpackageId): FernRegistry.ApiDefinitionSubpackage => {
            if (api.type !== "loaded") {
                throw new Error("API is not loaded");
            }
            const subpackage = api.value.subpackages[subpackageId];
            if (subpackage == null) {
                throw new Error("Subpackage does not exist");
            }
            return subpackage;
        },
        [api]
    );

    const contextValue = useCallback(
        (): ApiDefinitionContextValue => ({
            api,
            resolveType,
            resolveSubpackage,
        }),
        [api, resolveSubpackage, resolveType]
    );

    return <ApiDefinitionContext.Provider value={contextValue}>{children}</ApiDefinitionContext.Provider>;
};
