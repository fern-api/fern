import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import React from "react";
import { PackagePath } from "../../commons/PackagePath";
import { ResolvedUrlPath, UrlPathResolver } from "./url-path-resolver/UrlPathResolver";

export const ApiDefinitionContext = React.createContext<() => ApiDefinitionContextValue>(() => {
    throw new Error("ApiDefinitionContextProvider is not present in this tree.");
});

export interface ApiDefinitionContextValue {
    api: FernRegistryApiRead.ApiDefinition;
    resolveTypeById: (typeId: FernRegistryApiRead.TypeId) => FernRegistryApiRead.TypeDefinition;
    resolveTypeByName: (packagePath: PackagePath, typeName: string) => FernRegistryApiRead.TypeDefinition | undefined;
    getPackagePathForTypeId: (typeId: FernRegistryApiRead.TypeId) => PackagePath;
    resolveEndpointById: (
        packagePath: PackagePath,
        endpointId: string
    ) => FernRegistryApiRead.EndpointDefinition | undefined;
    resolveSubpackageById: (
        subpackageId: FernRegistryApiRead.SubpackageId
    ) => FernRegistryApiRead.ApiDefinitionSubpackage;
    urlPathResolver: UrlPathResolver;
    onClickSidebarItem: (item: ResolvedUrlPath) => void;
    registerSidebarItemClickListener: (path: ResolvedUrlPath, listener: () => void) => () => void;
}
