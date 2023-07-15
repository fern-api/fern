import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import React, { useCallback } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { ApiDefinitionContext, ApiDefinitionContextValue } from "./ApiDefinitionContext";

export declare namespace ApiDefinitionContextProvider {
    export type Props = React.PropsWithChildren<{
        apiSection: FernRegistryDocsRead.ApiSection;
        apiSlug: string;
    }>;
}

export const ApiDefinitionContextProvider: React.FC<ApiDefinitionContextProvider.Props> = ({
    apiSection,
    apiSlug,
    children,
}) => {
    const { resolveApi } = useDocsContext();
    const apiDefinition = resolveApi(apiSection.api);

    const resolveSubpackageById = useCallback(
        (subpackageId: FernRegistryApiRead.SubpackageId): FernRegistryApiRead.ApiDefinitionSubpackage => {
            return resolveSubpackage(apiDefinition, subpackageId);
        },
        [apiDefinition]
    );

    const resolveTypeById = useCallback(
        (typeId: FernRegistryApiRead.TypeId): FernRegistryApiRead.TypeDefinition => {
            const type = apiDefinition.types[typeId];
            if (type == null) {
                throw new Error("Type does not exist");
            }
            return type;
        },
        [apiDefinition]
    );

    const contextValue = useCallback(
        (): ApiDefinitionContextValue => ({
            apiDefinition,
            apiSection,
            apiSlug,
            resolveTypeById,
            resolveSubpackageById,
        }),
        [apiDefinition, apiSlug, apiSection, resolveSubpackageById, resolveTypeById]
    );

    return <ApiDefinitionContext.Provider value={contextValue}>{children}</ApiDefinitionContext.Provider>;
};

export function resolveSubpackage(
    apiDefinition: FernRegistryApiRead.ApiDefinition,
    subpackageId: FernRegistryApiRead.SubpackageId
): FernRegistryApiRead.ApiDefinitionSubpackage {
    const subpackage = apiDefinition.subpackages[subpackageId];
    if (subpackage == null) {
        throw new Error("Subpackage does not exist");
    }
    if (subpackage.pointsTo != null) {
        const resolvedSubpackage = resolveSubpackage(apiDefinition, subpackage.pointsTo);
        return {
            ...resolvedSubpackage,
            name: subpackage.name,
            urlSlug: subpackage.urlSlug,
        };
    } else {
        return subpackage;
    }
}
