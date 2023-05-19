import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import React, { useCallback, useMemo, useRef } from "react";
import { PackagePath } from "../../commons/PackagePath";
import { ApiDefinitionContext, ApiDefinitionContextValue } from "./ApiDefinitionContext";
import { TypeIdToPackagePathCache } from "./TypeIdToPackagePathCache";
import { ResolvedUrlPath, UrlPathResolverImpl } from "./url-path-resolver/UrlPathResolver";

export declare namespace ApiDefinitionContextProvider {
    export type Props = React.PropsWithChildren<{
        api: FernRegistryApiRead.ApiDefinition;
    }>;
}

export const ApiDefinitionContextProvider: React.FC<ApiDefinitionContextProvider.Props> = ({ api, children }) => {
    /**
     * subpackages
     */

    const resolveSubpackageById = useCallback(
        (subpackageId: FernRegistryApiRead.SubpackageId): FernRegistryApiRead.ApiDefinitionSubpackage => {
            const subpackage = api.subpackages[subpackageId];
            if (subpackage == null) {
                throw new Error("Subpackage does not exist");
            }
            return subpackage;
        },
        [api]
    );

    /**
     * types
     */

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

    const resolveTypeByName = useCallback(
        (packagePath: PackagePath, typeName: string): FernRegistryApiRead.TypeDefinition | undefined => {
            return resolvePackageItem({
                package_: api.rootPackage,
                packagePath,
                resolveSubpackageById,
                getItem: (package_) =>
                    findTypeByName({
                        package_,
                        resolveTypeById,
                        typeName,
                    }),
            });
        },
        [api, resolveSubpackageById, resolveTypeById]
    );

    const typeIdToPackagePathCache = useMemo(
        () => new TypeIdToPackagePathCache(api, resolveSubpackageById),
        [api, resolveSubpackageById]
    );

    const getPackagePathForTypeId = useCallback(
        (typeId: FernRegistryApiRead.TypeId) => {
            return typeIdToPackagePathCache.get(typeId);
        },
        [typeIdToPackagePathCache]
    );

    /**
     * endpoints
     */

    const resolveEndpointById = useCallback(
        (packagePath: PackagePath, endpointId: string): FernRegistryApiRead.EndpointDefinition | undefined => {
            return resolvePackageItem({
                package_: api.rootPackage,
                packagePath,
                resolveSubpackageById,
                getItem: (package_) => package_.endpoints.find((endpoint) => endpoint.id === endpointId),
            });
        },
        [api, resolveSubpackageById]
    );

    /**
     * url path
     */

    const urlPathResolver = useMemo(() => new UrlPathResolverImpl(api), [api]);

    /**
     * sidebar item listeners
     */
    const sidebarItemClickListeners = useRef<Record<string, (() => void)[]>>({});

    const registerSidebarItemClickListener = useCallback(
        (resolvedUrlPath: ResolvedUrlPath, listener: () => void) => {
            const stringifiedPath = urlPathResolver.stringifyPath(resolvedUrlPath);
            const listenersForPath = (sidebarItemClickListeners.current[stringifiedPath] ??= []);
            listenersForPath.push(listener);
            return () => {
                const listeners = sidebarItemClickListeners.current[stringifiedPath];
                if (listeners != null) {
                    const indexOfListenerToDelete = listeners.indexOf(listener);
                    if (indexOfListenerToDelete !== -1) {
                        // eslint-disable-next-line no-console
                        console.warn("Failed to locate sidebar item click listener for deregistration.");
                    } else {
                        listeners.splice(indexOfListenerToDelete, 1);
                    }
                }
            };
        },
        [urlPathResolver]
    );

    const onClickSidebarItem = useCallback(
        (resolvedUrlPath: ResolvedUrlPath) => {
            const listeners = sidebarItemClickListeners.current[urlPathResolver.stringifyPath(resolvedUrlPath)];
            if (listeners != null) {
                for (const listener of listeners) {
                    listener();
                }
            }
        },
        [urlPathResolver]
    );

    /**
     * context
     */

    const contextValue = useCallback(
        (): ApiDefinitionContextValue => ({
            api,
            resolveTypeById,
            resolveTypeByName,
            getPackagePathForTypeId,
            resolveEndpointById,
            resolveSubpackageById,
            urlPathResolver,
            onClickSidebarItem,
            registerSidebarItemClickListener,
        }),
        [
            api,
            getPackagePathForTypeId,
            onClickSidebarItem,
            registerSidebarItemClickListener,
            resolveEndpointById,
            resolveSubpackageById,
            resolveTypeById,
            resolveTypeByName,
            urlPathResolver,
        ]
    );

    return <ApiDefinitionContext.Provider value={contextValue}>{children}</ApiDefinitionContext.Provider>;
};

function resolvePackageItem<T>({
    package_,
    packagePath,
    resolveSubpackageById,
    getItem,
}: {
    package_: FernRegistryApiRead.ApiDefinitionPackage;
    packagePath: PackagePath;
    resolveSubpackageById: (
        subpackageId: FernRegistryApiRead.SubpackageId
    ) => FernRegistryApiRead.ApiDefinitionSubpackage;
    getItem: (package_: FernRegistryApiRead.ApiDefinitionPackage) => T;
}): T | undefined {
    const [nextSubpackage, ...remainingPackagePath] = packagePath;
    if (nextSubpackage == null) {
        return getItem(package_);
    }
    const subpackage = findSubpackageByName({ package_, resolveSubpackageById, subpackageName: nextSubpackage });
    if (subpackage == null) {
        return undefined;
    }
    return resolvePackageItem({
        package_: subpackage,
        packagePath: remainingPackagePath,
        resolveSubpackageById,
        getItem,
    });
}

function findSubpackageByName({
    package_,
    resolveSubpackageById,
    subpackageName,
}: {
    package_: FernRegistryApiRead.ApiDefinitionPackage;
    resolveSubpackageById: (
        subpackageId: FernRegistryApiRead.SubpackageId
    ) => FernRegistryApiRead.ApiDefinitionSubpackage;
    subpackageName: string;
}): FernRegistryApiRead.ApiDefinitionSubpackage | undefined {
    return findItemByName({
        ids: package_.subpackages,
        name: subpackageName,
        resolveItemById: resolveSubpackageById,
        getItemName: (subpackage) => subpackage.name,
    });
}

function findTypeByName({
    package_,
    resolveTypeById,
    typeName,
}: {
    package_: FernRegistryApiRead.ApiDefinitionPackage;
    resolveTypeById: (typeId: FernRegistryApiRead.TypeId) => FernRegistryApiRead.TypeDefinition;
    typeName: string;
}): FernRegistryApiRead.TypeDefinition | undefined {
    return findItemByName({
        ids: package_.types,
        name: typeName,
        resolveItemById: resolveTypeById,
        getItemName: (type) => type.name,
    });
}

function findItemByName<Id, T>({
    ids,
    name,
    resolveItemById,
    getItemName,
}: {
    ids: Id[];
    name: string;
    resolveItemById: (id: Id) => T;
    getItemName: (item: T) => string;
}): T | undefined {
    for (const id of ids) {
        const item = resolveItemById(id);
        if (getItemName(item) === name) {
            return item;
        }
    }
    return undefined;
}
