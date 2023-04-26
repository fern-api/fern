import { FernRegistry } from "@fern-fern/registry";
import React from "react";
import { PackagePath } from "../../commons/PackagePath";
import { ResolvedUrlPath, UrlPathResolver } from "./url-path-resolver/UrlPathResolver";

export const ApiDefinitionContext = React.createContext<() => ApiDefinitionContextValue>(() => {
    throw new Error("ApiDefinitionContextProvider is not present in this tree.");
});

export interface ApiDefinitionContextValue {
    api: FernRegistry.ApiDefinition;
    resolveTypeById: (typeId: FernRegistry.TypeId) => FernRegistry.TypeDefinition;
    resolveTypeByName: (packagePath: PackagePath, typeName: string) => FernRegistry.TypeDefinition | undefined;
    getPackagePathForTypeId: (typeId: FernRegistry.TypeId) => PackagePath;
    resolveEndpointById: (packagePath: PackagePath, endpointId: string) => FernRegistry.EndpointDefinition | undefined;
    resolveSubpackageById: (subpackageId: FernRegistry.SubpackageId) => FernRegistry.ApiDefinitionSubpackage;
    urlPathResolver: UrlPathResolver;
    onClickSidebarItem: (item: ResolvedUrlPath) => void;
    registerSidebarItemClickListener: (path: ResolvedUrlPath, listener: () => void) => () => void;
}
