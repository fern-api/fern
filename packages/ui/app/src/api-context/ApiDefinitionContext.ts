import * as FernRegistryApiRead from "@fern-fern/registry-browser/serialization/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/serialization/resources/docs/resources/v1/resources/read";
import React from "react";

export const ApiDefinitionContext = React.createContext<() => ApiDefinitionContextValue>(() => {
    throw new Error("ApiDefinitionContextProvider is not present in this tree.");
});

export interface ApiDefinitionContextValue {
    apiDefinition: FernRegistryApiRead.ApiDefinition.Raw;
    apiSection: FernRegistryDocsRead.ApiSection.Raw;
    apiSlug: string;
    resolveTypeById: (typeId: FernRegistryApiRead.TypeId.Raw) => FernRegistryApiRead.TypeDefinition.Raw;
    resolveSubpackageById: (
        subpackageId: FernRegistryApiRead.SubpackageId.Raw
    ) => FernRegistryApiRead.ApiDefinitionSubpackage.Raw;
}
