import { Loadable } from "@fern-api/loadable";
import { FernRegistry } from "@fern-fern/registry";
import React from "react";
import { PackagePath } from "../../commons/PackagePath";

export const ApiDefinitionContext = React.createContext<() => ApiDefinitionContextValue>(() => {
    throw new Error("ApiContextProvider is not present in this tree.");
});

export interface ApiDefinitionContextValue {
    api: Loadable<FernRegistry.ApiDefinition, FernRegistry.registry.getApiForEnvironment.Error>;
    resolveTypeById: (typeId: FernRegistry.TypeId) => FernRegistry.TypeDefinition;
    resolveTypeByName: (packagePath: PackagePath, typeName: string) => FernRegistry.TypeDefinition | undefined;
    getPackagePathForTypeId: (typeId: FernRegistry.TypeId) => PackagePath;
    resolveEndpointByName: (
        packagePath: PackagePath,
        endpointName: string
    ) => FernRegistry.EndpointDefinition | undefined;
    resolveSubpackageById: (subpackageId: FernRegistry.SubpackageId) => FernRegistry.ApiDefinitionSubpackage;
}
