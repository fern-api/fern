import { FernRegistry } from "@fern-fern/registry";
import React, { useCallback, useMemo } from "react";
import { PackagePath } from "../../commons/PackagePath";
import { useCurrentApiDefinition } from "../queries/useCurrentApiDefinition";
import { ApiDefinitionContext, ApiDefinitionContextValue } from "./ApiDefinitionContext";
import { TypeIdToPackagePathCache } from "./TypeIdToPackagePathCache";

export const ApiDefinitionContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const api = useCurrentApiDefinition();

    const getApiOrThrow = useCallback(() => {
        if (api.type !== "loaded") {
            throw new Error("API is not loaded");
        }
        return api.value;
    }, [api]);

    /**
     * subpackages
     */

    const resolveSubpackageById = useCallback(
        (subpackageId: FernRegistry.SubpackageId): FernRegistry.ApiDefinitionSubpackage => {
            const subpackage = getApiOrThrow().subpackages[subpackageId];
            if (subpackage == null) {
                throw new Error("Subpackage does not exist");
            }
            return subpackage;
        },
        [getApiOrThrow]
    );

    /**
     * types
     */

    const resolveTypeById = useCallback(
        (typeId: FernRegistry.TypeId): FernRegistry.TypeDefinition => {
            const type = getApiOrThrow().types[typeId];
            if (type == null) {
                throw new Error("Type does not exist");
            }
            return type;
        },
        [getApiOrThrow]
    );

    const resolveTypeByName = useCallback(
        (packagePath: PackagePath, typeName: string): FernRegistry.TypeDefinition | undefined => {
            return resolvePackageItem({
                package_: getApiOrThrow().rootPackage,
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
        [getApiOrThrow, resolveSubpackageById, resolveTypeById]
    );

    const typeIdToPackagePathCache = useMemo(
        () => (api.type === "loaded" ? new TypeIdToPackagePathCache(api.value, resolveSubpackageById) : undefined),
        [api, resolveSubpackageById]
    );

    const getPackagePathForTypeId = useCallback(
        (typeId: FernRegistry.TypeId) => {
            if (typeIdToPackagePathCache == null) {
                throw new Error("TypeIdToPackagePathCache has not been constructed");
            }
            return typeIdToPackagePathCache.get(typeId);
        },
        [typeIdToPackagePathCache]
    );

    /**
     * endpoints
     */

    const resolveEndpointByName = useCallback(
        (packagePath: PackagePath, endpointName: string): FernRegistry.EndpointDefinition | undefined => {
            return resolvePackageItem({
                package_: getApiOrThrow().rootPackage,
                packagePath,
                resolveSubpackageById,
                getItem: (package_) => package_.endpoints.find((endpoint) => endpoint.name === endpointName),
            });
        },
        [getApiOrThrow, resolveSubpackageById]
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
            resolveEndpointByName,
            resolveSubpackageById,
        }),
        [api, getPackagePathForTypeId, resolveEndpointByName, resolveSubpackageById, resolveTypeById, resolveTypeByName]
    );

    return <ApiDefinitionContext.Provider value={contextValue}>{children}</ApiDefinitionContext.Provider>;
};

function resolvePackageItem<T>({
    package_,
    packagePath,
    resolveSubpackageById,
    getItem,
}: {
    package_: FernRegistry.ApiDefinitionPackage;
    packagePath: PackagePath;
    resolveSubpackageById: (subpackageId: FernRegistry.SubpackageId) => FernRegistry.ApiDefinitionSubpackage;
    getItem: (package_: FernRegistry.ApiDefinitionPackage) => T;
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
    package_: FernRegistry.ApiDefinitionPackage;
    resolveSubpackageById: (subpackageId: FernRegistry.SubpackageId) => FernRegistry.ApiDefinitionSubpackage;
    subpackageName: string;
}): FernRegistry.ApiDefinitionSubpackage | undefined {
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
    package_: FernRegistry.ApiDefinitionPackage;
    resolveTypeById: (typeId: FernRegistry.TypeId) => FernRegistry.TypeDefinition;
    typeName: string;
}): FernRegistry.TypeDefinition | undefined {
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
