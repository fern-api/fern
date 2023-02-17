import { FernRegistry } from "@fern-fern/registry";
import React, { useCallback } from "react";
import { useCurrentApiDefinition } from "../queries/useCurrentApiDefinition";
import { ApiContext, ApiContextValue } from "./ApiContext";

export const ApiContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
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
        (): ApiContextValue => ({
            api,
            resolveType,
            resolveSubpackage,
        }),
        [api, resolveSubpackage, resolveType]
    );

    return <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>;
};
