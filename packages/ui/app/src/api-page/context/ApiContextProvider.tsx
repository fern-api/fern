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

    const contextValue = useCallback(
        (): ApiContextValue => ({
            api,
            resolveType,
        }),
        [api, resolveType]
    );

    return <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>;
};
