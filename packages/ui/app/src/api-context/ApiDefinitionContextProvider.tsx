import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import React, { useCallback } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { ApiDefinitionContext, ApiDefinitionContextValue } from "./ApiDefinitionContext";

export declare namespace ApiDefinitionContextProvider {
    export type Props = React.PropsWithChildren<{
        apiId: FernRegistry.ApiDefinitionId;
    }>;
}

export const ApiDefinitionContextProvider: React.FC<ApiDefinitionContextProvider.Props> = ({ apiId, children }) => {
    const { resolveApi } = useDocsContext();
    const api = resolveApi(apiId);

    const resolveSubpackageById = useCallback(
        (subpackageId: FernRegistryApiRead.SubpackageId): FernRegistryApiRead.ApiDefinitionSubpackage => {
            const subpackage = api.subpackages[subpackageId];
            if (subpackage == null) {
                throw new Error("Subpackage does not exist");
            }
            if (subpackage.pointsTo != null) {
                return resolveSubpackageById(subpackage.pointsTo);
            }
            return subpackage;
        },
        [api]
    );

    const resolveTypeById = useCallback(
        (typeId: FernRegistryApiRead.TypeId): FernRegistryApiRead.TypeDefinition => {
            const type = api.types[typeId];
            if (type == null) {
                throw new Error("Type does not exist");
            }
            return type;
        },
        [api]
    );

    const contextValue = useCallback(
        (): ApiDefinitionContextValue => ({
            api,
            resolveTypeById,
            resolveSubpackageById,
        }),
        [api, resolveSubpackageById, resolveTypeById]
    );

    return <ApiDefinitionContext.Provider value={contextValue}>{children}</ApiDefinitionContext.Provider>;
};
